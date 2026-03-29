// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../contracts/HopeFundVault.sol";
import "../../contracts/MockUSDT.sol";

// Harness: expose _hashTypedDataV4 (internal) để test có thể tính digest
contract HopeFundVaultHarness is HopeFundVault {
    constructor(
        address _token,
        address _founder,
        address _adminSigner,
        uint256 _projectId,
        bytes32 _metaHash
    ) HopeFundVault(_token, _founder, _adminSigner, _projectId, _metaHash) {}

    function hashTypedDataV4Public(bytes32 structHash)
        external
        view
        returns (bytes32)
    {
        return _hashTypedDataV4(structHash);
    }
}

contract HopeFundVaultUnitTest is Test {
    HopeFundVaultHarness vault;
    MockUSDT token;

    address founder    = makeAddr("founder");
    address attacker   = makeAddr("attacker");
    address donor      = makeAddr("donor");
    address newSigner  = makeAddr("newSigner");

    // adminSigner cần private key để ký EIP-712
    uint256 constant ADMIN_SIGNER_PK = 0xA11CE;
    address adminSigner;

    uint256 projectId = 777;
    bytes32 metaHash  = bytes32(keccak256("metadata-hash"));

    uint256 constant MIN_DONATION = 0.1 ether; // 1e17

    // SETUP

    function setUp() public {
        adminSigner = vm.addr(ADMIN_SIGNER_PK);

        token = new MockUSDT();
        vault = new HopeFundVaultHarness(
            address(token),
            founder,
            adminSigner,
            projectId,
            metaHash
        );

        token.mint(donor, 10_000 ether);
        vm.prank(donor);
        token.approve(address(vault), type(uint256).max);
    }

    // Helper: tạo EIP-712 signature hợp lệ từ adminSigner

    function _signClaim(
        uint256 amount,
        uint256 nonce,
        uint256 deadline
    ) internal view returns (bytes memory) {
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256(
                    "Claim(uint256 projectId,address founder,uint256 amount,uint256 nonce,uint256 deadline)"
                ),
                projectId,
                founder,
                amount,
                nonce,
                deadline
            )
        );

        bytes32 digest = vault.hashTypedDataV4Public(structHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ADMIN_SIGNER_PK, digest);
        return abi.encodePacked(r, s, v);
    }

    // HAPPY PATH

    function test_DeployCorrectly() public view {
        assertEq(address(vault.token()),   address(token));
        assertEq(vault.founder(),          founder);
        assertEq(vault.adminSigner(),      adminSigner);
        assertEq(vault.projectId(),        projectId);
        assertEq(vault.metaHash(),         metaHash);
        assertEq(vault.MIN_DONATION(),     MIN_DONATION);
        assertEq(vault.totalDonated(),     0);
        assertEq(vault.totalClaimed(),     0);
        assertFalse(vault.paused());
    }

    function test_DonateUpdatesTotalAndBalance() public {
        uint256 amount = 5 ether;

        vm.prank(donor);
        vm.expectEmit(true, true, false, true);
        emit HopeFundVault.Donated(projectId, donor, amount);
        vault.donate(amount);

        assertEq(vault.totalDonated(),             amount);
        assertEq(vault.vaultBalance(),             amount);
        assertEq(token.balanceOf(address(vault)),  amount);
    }

    function testFuzz_DonateMultipleTimes(uint256 amt1, uint256 amt2) public {
        amt1 = bound(amt1, MIN_DONATION, 1000 ether);
        amt2 = bound(amt2, MIN_DONATION, 1000 ether);

        vm.prank(donor);
        vault.donate(amt1);
        vm.prank(donor);
        vault.donate(amt2);

        assertEq(vault.totalDonated(), amt1 + amt2);
    }

    function test_ClaimSuccess() public {
        // Arrange
        uint256 donated = 1000 ether;
        vm.prank(donor);
        vault.donate(donated);

        uint256 claimAmount = 400 ether;
        uint256 nonce       = 1;
        uint256 deadline    = block.timestamp + 1 hours;
        bytes memory sig    = _signClaim(claimAmount, nonce, deadline);

        uint256 founderBalBefore = token.balanceOf(founder);

        // Act
        vm.expectEmit(true, true, false, true);
        emit HopeFundVault.Claimed(projectId, founder, claimAmount, nonce);
        vm.prank(founder);
        vault.claim(claimAmount, nonce, deadline, sig);

        // Assert
        assertEq(vault.totalClaimed(),                      claimAmount);
        assertEq(vault.vaultBalance(),                      donated - claimAmount);
        assertTrue(vault.usedNonce(nonce));
        assertEq(token.balanceOf(founder),                  founderBalBefore + claimAmount);
    }

    function test_ClaimMultipleTimesWithDifferentNonces() public {
        uint256 donated = 1000 ether;
        vm.prank(donor);
        vault.donate(donated);

        uint256 claim1 = 200 ether;
        uint256 claim2 = 300 ether;
        uint256 deadline = block.timestamp + 1 hours;

        bytes memory sig1 = _signClaim(claim1, 1, deadline);
        bytes memory sig2 = _signClaim(claim2, 2, deadline);

        vm.prank(founder);
        vault.claim(claim1, 1, deadline, sig1);

        vm.prank(founder);
        vault.claim(claim2, 2, deadline, sig2);

        assertEq(vault.totalClaimed(),  claim1 + claim2);
        assertEq(vault.vaultBalance(),  donated - claim1 - claim2);
        assertTrue(vault.usedNonce(1));
        assertTrue(vault.usedNonce(2));
    }

    function test_PauseAndUnpauseByAdmin() public {
        assertFalse(vault.paused());

        vm.prank(adminSigner);
        vault.pause();
        assertTrue(vault.paused());

        vm.prank(adminSigner);
        vault.unpause();
        assertFalse(vault.paused());
    }

    function test_SetAdminSignerSuccess() public {
        vm.expectEmit(true, true, false, false);
        emit HopeFundVault.AdminSignerChanged(adminSigner, newSigner);

        vm.prank(adminSigner);
        vault.setAdminSigner(newSigner);

        assertEq(vault.adminSigner(), newSigner);
    }

    function test_ClaimWithNewSignerAfterRotation() public {
        // Rotate signer
        uint256 newSignerPk   = 0xB0B;
        address newSignerAddr = vm.addr(newSignerPk);

        vm.prank(adminSigner);
        vault.setAdminSigner(newSignerAddr);

        // Donate rồi claim với signer mới
        uint256 donated  = 500 ether;
        vm.prank(donor);
        vault.donate(donated);

        uint256 claimAmount = 100 ether;
        uint256 nonce       = 10;
        uint256 deadline    = block.timestamp + 1 hours;

        // Ký bằng newSignerPk
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256(
                    "Claim(uint256 projectId,address founder,uint256 amount,uint256 nonce,uint256 deadline)"
                ),
                projectId,
                founder,
                claimAmount,
                nonce,
                deadline
            )
        );
        bytes32 digest = vault.hashTypedDataV4Public(structHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(newSignerPk, digest);
        bytes memory sig = abi.encodePacked(r, s, v);

        vm.prank(founder);
        vault.claim(claimAmount, nonce, deadline, sig);

        assertEq(vault.totalClaimed(), claimAmount);
    }

    // UNHAPPY PATH

    // donate

    function test_RevertWhen_DonateBelowMin() public {
        vm.expectRevert("Amount below minimum donation");
        vm.prank(donor);
        vault.donate(MIN_DONATION - 1);
    }

    function test_RevertWhen_DonateWhenPaused() public {
        vm.prank(adminSigner);
        vault.pause();

        vm.expectRevert(Pausable.EnforcedPause.selector);
        vm.prank(donor);
        vault.donate(MIN_DONATION);
    }

    // claim

    function test_RevertWhen_ClaimNotFounder() public {
        uint256 donated  = 100 ether;
        vm.prank(donor);
        vault.donate(donated);

        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _signClaim(50 ether, 1, deadline);

        vm.expectRevert("Caller is not the founder");
        vm.prank(attacker);
        vault.claim(50 ether, 1, deadline, sig);
    }

    function test_RevertWhen_ClaimZeroAmount() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _signClaim(0, 1, deadline);

        vm.expectRevert("Amount must be greater than zero");
        vm.prank(founder);
        vault.claim(0, 1, deadline, sig);
    }

    function test_RevertWhen_ClaimExpiredDeadline() public {
        uint256 deadline = block.timestamp - 1; // đã hết hạn

        vm.expectRevert("Signature expired");
        vm.prank(founder);
        vault.claim(100 ether, 1, deadline, "0x");
    }

    function test_RevertWhen_ClaimNonceReused() public {
        uint256 donated  = 1000 ether;
        vm.prank(donor);
        vault.donate(donated);

        uint256 claimAmount = 100 ether;
        uint256 nonce       = 1;
        uint256 deadline    = block.timestamp + 1 hours;
        bytes memory sig    = _signClaim(claimAmount, nonce, deadline);

        // Lần 1 — thành công
        vm.prank(founder);
        vault.claim(claimAmount, nonce, deadline, sig);

        // Lần 2 — replay attack → revert
        bytes memory sig2 = _signClaim(claimAmount, nonce, deadline);
        vm.expectRevert("Nonce already used");
        vm.prank(founder);
        vault.claim(claimAmount, nonce, deadline, sig2);
    }

    function test_RevertWhen_ClaimInsufficientBalance() public {
        uint256 donated  = 50 ether;
        vm.prank(donor);
        vault.donate(donated);

        uint256 claimAmount = 100 ether; // nhiều hơn vault
        uint256 deadline    = block.timestamp + 1 hours;
        bytes memory sig    = _signClaim(claimAmount, 1, deadline);

        vm.expectRevert("Insufficient vault balance");
        vm.prank(founder);
        vault.claim(claimAmount, 1, deadline, sig);
    }

    function test_RevertWhen_ClaimWrongSigner() public {
        uint256 donated  = 100 ether;
        vm.prank(donor);
        vault.donate(donated);

        // Ký bằng private key của attacker (không phải adminSigner)
        uint256 wrongPk  = 0xDEAD;
        uint256 deadline = block.timestamp + 1 hours;

        bytes32 structHash = keccak256(
            abi.encode(
                keccak256(
                    "Claim(uint256 projectId,address founder,uint256 amount,uint256 nonce,uint256 deadline)"
                ),
                projectId,
                founder,
                50 ether,
                uint256(1),
                deadline
            )
        );
        bytes32 digest = vault.hashTypedDataV4Public(structHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(wrongPk, digest);
        bytes memory sig = abi.encodePacked(r, s, v);

        vm.expectRevert("Invalid signature");
        vm.prank(founder);
        vault.claim(50 ether, 1, deadline, sig);
    }

    function test_RevertWhen_ClaimWhenPaused() public {
        uint256 donated  = 100 ether;
        vm.prank(donor);
        vault.donate(donated);

        vm.prank(adminSigner);
        vault.pause();

        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _signClaim(50 ether, 1, deadline);

        vm.expectRevert(Pausable.EnforcedPause.selector);
        vm.prank(founder);
        vault.claim(50 ether, 1, deadline, sig);
    }

    // pause / unpause 

    function test_RevertWhen_NonAdminPause() public {
        vm.expectRevert("Caller is not the current admin signer");
        vm.prank(donor);
        vault.pause();
    }

    function test_RevertWhen_NonAdminUnpause() public {
        vm.prank(adminSigner);
        vault.pause();

        vm.expectRevert("Caller is not the current admin signer");
        vm.prank(attacker);
        vault.unpause();
    }

    // setAdminSigner 

    function test_RevertWhen_SetAdminSignerZero() public {
        vm.expectRevert("Invalid new signer address");
        vm.prank(adminSigner);
        vault.setAdminSigner(address(0));
    }

    function test_RevertWhen_NonAdminSetSigner() public {
        vm.expectRevert("Caller is not the current admin signer");
        vm.prank(donor);
        vault.setAdminSigner(attacker);
    }

    // constructor guards 

    function test_RevertWhen_DeployZeroToken() public {
        vm.expectRevert("Invalid token address");
        new HopeFundVaultHarness(address(0), founder, adminSigner, projectId, metaHash);
    }

    function test_RevertWhen_DeployZeroFounder() public {
        vm.expectRevert("Invalid founder address");
        new HopeFundVaultHarness(address(token), address(0), adminSigner, projectId, metaHash);
    }

    function test_RevertWhen_DeployZeroAdminSigner() public {
        vm.expectRevert("Invalid admin signer address");
        new HopeFundVaultHarness(address(token), founder, address(0), projectId, metaHash);
    }
}
