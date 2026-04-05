// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./HopeFundVault.sol";

/**
 * @title  HopeFundFactory
 * @notice Deploy và quản lý các HopeFundVault — mỗi project một vault riêng biệt
 * @dev    Chỉ operator được phép tạo vault mới. Token dùng chung 1 loại cho toàn platform.
 */
contract HopeFundFactory {

    // =========================
    // CONFIGURATION
    // =========================

    address public immutable token; // Token dùng chung toàn platform (USDT/USDC)
    address public operator;        // Người có quyền tạo vault mới (backend/admin)

    // =========================
    // STORAGE
    // =========================

    mapping(uint256 => address) public vaults; // projectId → địa chỉ vault
    address[] public allVaults;                // Danh sách tất cả vault đã tạo

    // =========================
    // EVENTS
    // =========================

    event VaultCreated(
        uint256 indexed projectId,
        address indexed vault,
        address indexed founder,
        address adminSigner
    );

    event OperatorChanged(address indexed oldOperator, address indexed newOperator);

    // =========================
    // CONSTRUCTOR
    // =========================

    constructor(address _token, address _operator) {
        require(_token    != address(0), "Invalid token address");
        require(_operator != address(0), "Invalid operator address");

        token    = _token;
        operator = _operator;
    }

    // =========================
    // MODIFIERS
    // =========================

    modifier onlyOperator() {
        require(msg.sender == operator, "Caller is not the operator");
        _;
    }

    // =========================
    // EXTERNAL FUNCTIONS
    // =========================

    /**
     * @notice Tạo một HopeFundVault mới cho một project
     * @dev    Chỉ operator gọi được. Mỗi projectId chỉ được tạo 1 vault duy nhất.
     * @param projectId   ID project (đồng bộ với backend)
     * @param founder     Địa chỉ founder — người được phép claim tiền
     * @param adminSigner Địa chỉ ký duyệt claim request (off-chain admin)
     * @param metaHash    Hash metadata dự án (IPFS hoặc backend)
     * @return vault      Địa chỉ vault vừa deploy
     */
    function createVault(
        uint256 projectId,
        address founder,
        address adminSigner,
        bytes32 metaHash
    ) external onlyOperator returns (address vault) {
        require(founder     != address(0),       "Invalid founder address");
        require(adminSigner != address(0),       "Invalid admin signer address");
        require(vaults[projectId] == address(0), "Vault already exists for this project");

        // Deploy HopeFundVault mới cho project này
        HopeFundVault newVault = new HopeFundVault(
            token,
            founder,
            adminSigner,
            projectId,
            metaHash
        );

        vault = address(newVault);

        // Lưu vào mapping và array để tra cứu sau
        vaults[projectId] = vault;
        allVaults.push(vault);

        emit VaultCreated(projectId, vault, founder, adminSigner);
    }

    /**
     * @notice Chuyển quyền operator sang địa chỉ mới
     * @param newOperator Địa chỉ operator mới (khác address(0))
     */
    function setOperator(address newOperator) external onlyOperator {
        require(newOperator != address(0), "Invalid operator address");

        address old = operator;
        operator    = newOperator;

        emit OperatorChanged(old, newOperator);
    }

    // =========================
    // VIEW FUNCTIONS
    // =========================

    /**
     * @notice Lấy địa chỉ vault theo projectId
     */
    function getVault(uint256 projectId) external view returns (address) {
        return vaults[projectId];
    }

    /**
     * @notice Tổng số vault đã tạo trên platform
     */
    function totalVaults() external view returns (uint256) {
        return allVaults.length;
    }
}
