// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract HopeFundVault is ReentrancyGuard, Pausable, EIP712 {
    using SafeERC20 for IERC20;

    // =========================
    // CONFIGURATION
    // =========================

    IERC20 public immutable token;       // Token dùng để donate (thường là USDT/USDC 18 decimals)
    address public immutable founder;    // Founder - người được phép claim tiền
    address public adminSigner;          // Địa chỉ ký duyệt withdraw request (off-chain admin)
    uint256 public immutable projectId;  // ID dự án, đồng bộ với backend
    bytes32 public metaHash;             // Hash metadata dự án (IPFS hoặc backend)

    uint256 public constant MIN_DONATION = 1e17; // Số tiền donate tối thiểu (0.1 token nếu 18 decimals)

    // =========================
    // STATISTICS
    // =========================

    uint256 public totalDonated;  // Tổng tiền đã donate qua hàm donate()
    uint256 public totalClaimed;  // Tổng tiền founder đã rút thành công

    mapping(uint256 => bool) public usedNonce; // Lưu nonce đã dùng để chống replay attack

    // EIP-712 typehash cho claim
    bytes32 private constant CLAIM_TYPEHASH =
        keccak256(
            "Claim(uint256 projectId,address founder,uint256 amount,uint256 nonce,uint256 deadline)"
        );

    // =========================
    // EVENTS
    // =========================

    event Donated(uint256 indexed projectId, address indexed donor, uint256 amount);
    event Claimed(uint256 indexed projectId, address indexed founder, uint256 amount, uint256 nonce);
    event AdminSignerChanged(address indexed oldSigner, address indexed newSigner);

    // =========================
    // CONSTRUCTOR
    // =========================

    constructor(
        address _token,
        address _founder,
        address _adminSigner,
        uint256 _projectId,
        bytes32 _metaHash
    ) EIP712("HopeFund", "1") {
        require(_token      != address(0), "Invalid token address");
        require(_founder    != address(0), "Invalid founder address");
        require(_adminSigner != address(0), "Invalid admin signer address");

        token       = IERC20(_token);
        founder     = _founder;
        adminSigner = _adminSigner;
        projectId   = _projectId;
        metaHash    = _metaHash;
    }

    // =========================
    // EXTERNAL FUNCTIONS
    // =========================

    /**
     * @notice Người dùng donate (ủng hộ) dự án
     * @dev Chuyển token từ người gọi vào vault, cập nhật totalDonated
     * @param amount Số lượng token donate (phải >= MIN_DONATION)
     */
    function donate(uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= MIN_DONATION, "Amount below minimum donation");

        token.safeTransferFrom(msg.sender, address(this), amount);
        totalDonated += amount;

        emit Donated(projectId, msg.sender, amount);
    }

    /**
     * @notice Founder rút tiền (claim) - yêu cầu chữ ký EIP-712 từ adminSigner
     * @dev Verify signature, nonce, deadline, balance trước khi transfer
     * @param amount    Số tiền muốn rút
     * @param nonce     Nonce chống replay attack
     * @param deadline  Thời hạn hiệu lực của chữ ký
     * @param signature Chữ ký EIP-712 từ adminSigner
     */
    function claim(
        uint256 amount,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external nonReentrant whenNotPaused {
        require(msg.sender == founder,                        "Caller is not the founder");
        require(amount > 0,                                   "Amount must be greater than zero");
        require(block.timestamp <= deadline,                  "Signature expired");
        require(!usedNonce[nonce],                            "Nonce already used");
        require(token.balanceOf(address(this)) >= amount,    "Insufficient vault balance");

        bytes32 structHash = keccak256(
            abi.encode(CLAIM_TYPEHASH, projectId, founder, amount, nonce, deadline)
        );

        address recovered = ECDSA.recover(_hashTypedDataV4(structHash), signature);
        require(recovered == adminSigner, "Invalid signature");

        usedNonce[nonce] = true;
        token.safeTransfer(founder, amount);
        totalClaimed += amount;

        emit Claimed(projectId, founder, amount, nonce);
    }

    /**
     * @notice Tạm dừng contract — chặn donate & claim
     * @dev Chỉ adminSigner gọi được
     */
    function pause() external {
        require(msg.sender == adminSigner, "Caller is not the current admin signer");
        _pause();
    }

    /**
     * @notice Bỏ tạm dừng contract
     * @dev Chỉ adminSigner gọi được
     */
    function unpause() external {
        require(msg.sender == adminSigner, "Caller is not the current admin signer");
        _unpause();
    }

    /**
     * @notice Thay đổi adminSigner — chỉ adminSigner hiện tại gọi được
     * @param newSigner Địa chỉ adminSigner mới (khác address(0))
     */
    function setAdminSigner(address newSigner) external {
        require(msg.sender == adminSigner,  "Caller is not the current admin signer");
        require(newSigner != address(0),    "Invalid new signer address");

        address old = adminSigner;
        adminSigner = newSigner;

        emit AdminSignerChanged(old, newSigner);
    }

    // =========================
    // VIEW FUNCTIONS
    // =========================

    /**
     * @notice Xem số dư token hiện tại trong vault
     */
    function vaultBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
