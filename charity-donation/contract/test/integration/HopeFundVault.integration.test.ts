import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { parseEther } from "viem";
import hre from "hardhat";

const { viem, networkHelpers } = await hre.network.connect();

describe("HopeFundVault - Integration (viem)", () => {
  let vault: any;
  let token: any;
  let founder: any;
  let adminSigner: any;
  let donor1: any;
  let donor2: any;
  let attacker: any;

  let projectId = 123n;
  let metaHash = ("0x" + "a".repeat(64)) as `0x${string}`;

  // Helper: tạo EIP-712 signature hợp lệ từ adminSigner

  async function signClaim(
    signer: any,
    amount: bigint,
    nonce: bigint,
    deadline: bigint,
  ) {
    const publicClient = await viem.getPublicClient();
    const chainId = await publicClient.getChainId();

    return signer.signTypedData({
      domain: {
        name: "HopeFund",
        version: "1",
        chainId,
        verifyingContract: vault.address,
      },
      types: {
        Claim: [
          { name: "projectId", type: "uint256" },
          { name: "founder", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      } as const,
      primaryType: "Claim",
      message: {
        projectId,
        founder: founder.account.address,
        amount,
        nonce,
        deadline,
      },
    });
  }

  beforeEach(async () => {
    const walletClients = await viem.getWalletClients();
    [founder, adminSigner, donor1, donor2, attacker] = walletClients;

    token = await viem.deployContract("MockUSDT");

    await token.write.mint([donor1.account.address, parseEther("10000")]);
    await token.write.mint([donor2.account.address, parseEther("5000")]);

    vault = await viem.deployContract("HopeFundVault", [
      token.address,
      founder.account.address,
      adminSigner.account.address,
      projectId,
      metaHash,
    ]);

    await token.write.approve([vault.address, parseEther("10000")], {
      account: donor1.account.address,
    });
    await token.write.approve([vault.address, parseEther("5000")], {
      account: donor2.account.address,
    });
  });

  // HAPPY PATH

  it("multiple donations → accumulate totalDonated and vault balance", async () => {
    const amt1 = parseEther("2.5");
    const amt2 = parseEther("3.7");

    await vault.write.donate([amt1], { account: donor1.account.address });
    await vault.write.donate([amt2], { account: donor2.account.address });

    assert.equal(await vault.read.totalDonated(), amt1 + amt2);
    assert.equal(await vault.read.vaultBalance(), amt1 + amt2);
  });

  it("founder claims with valid signature → success + nonce marked", async () => {
    await vault.write.donate([parseEther("1000")], {
      account: donor1.account.address,
    });

    const claimAmount = parseEther("400");
    const nonce = 1n;
    const deadline = BigInt(await networkHelpers.time.latest()) + 3600n;
    const signature = await signClaim(
      adminSigner,
      claimAmount,
      nonce,
      deadline,
    );

    const founderBalanceBefore = await token.read.balanceOf([
      founder.account.address,
    ]);

    await vault.write.claim([claimAmount, nonce, deadline, signature], {
      account: founder.account.address,
    });

    assert.equal(await vault.read.totalClaimed(), claimAmount);
    assert.equal(await vault.read.usedNonce([nonce]), true);
    assert.equal(
      await token.read.balanceOf([founder.account.address]),
      founderBalanceBefore + claimAmount,
    );
  });

  it("claim multiple times with different nonces → totalClaimed accumulates", async () => {
    await vault.write.donate([parseEther("1000")], {
      account: donor1.account.address,
    });

    const claim1 = parseEther("200");
    const claim2 = parseEther("300");
    const deadline = BigInt(await networkHelpers.time.latest()) + 3600n;

    const sig1 = await signClaim(adminSigner, claim1, 1n, deadline);
    const sig2 = await signClaim(adminSigner, claim2, 2n, deadline);

    await vault.write.claim([claim1, 1n, deadline, sig1], {
      account: founder.account.address,
    });
    await vault.write.claim([claim2, 2n, deadline, sig2], {
      account: founder.account.address,
    });

    assert.equal(await vault.read.totalClaimed(), claim1 + claim2);
    assert.equal(
      await vault.read.vaultBalance(),
      parseEther("1000") - claim1 - claim2,
    );
    assert.equal(await vault.read.usedNonce([1n]), true);
    assert.equal(await vault.read.usedNonce([2n]), true);
  });

  it("setAdminSigner → new signer can authorize claim", async () => {
    // Rotate signer sang donor2 (giả làm newAdmin)
    const newAdmin = donor2;
    await vault.write.setAdminSigner([newAdmin.account.address], {
      account: adminSigner.account.address,
    });
    assert.equal(
      (await vault.read.adminSigner()).toLowerCase(),
      newAdmin.account.address.toLowerCase(),
    );

    // Donate rồi claim với signer mới
    await vault.write.donate([parseEther("500")], {
      account: donor1.account.address,
    });

    const claimAmount = parseEther("100");
    const deadline = BigInt(await networkHelpers.time.latest()) + 3600n;
    const signature = await signClaim(newAdmin, claimAmount, 10n, deadline);

    await vault.write.claim([claimAmount, 10n, deadline, signature], {
      account: founder.account.address,
    });

    assert.equal(await vault.read.totalClaimed(), claimAmount);
  });

  it("pause → unpause → donate works again", async () => {
    await vault.write.pause({ account: adminSigner.account.address });

    await assert.rejects(
      vault.write.donate([parseEther("1")], {
        account: donor1.account.address,
      }),
      /EnforcedPause/,
    );

    await vault.write.unpause({ account: adminSigner.account.address });

    // Sau unpause donate bình thường
    await vault.write.donate([parseEther("1")], {
      account: donor1.account.address,
    });
    assert.equal(await vault.read.totalDonated(), parseEther("1"));
  });

  // UNHAPPY PATH

  it("claim with expired deadline → revert", async () => {
    const claimAmount = parseEther("100");
    const nonce = 99n;
    const deadline = BigInt(await networkHelpers.time.latest()) - 100n; // expired

    await assert.rejects(
      vault.write.claim([claimAmount, nonce, deadline, "0x"], {
        account: founder.account.address,
      }),
      /Signature expired/,
    );
  });

  it("donate below MIN_DONATION → revert", async () => {
    await assert.rejects(
      vault.write.donate([parseEther("0.09")], {
        account: donor1.account.address,
      }),
      /Amount below minimum donation/,
    );
  });

  it("donate when paused → revert", async () => {
    await vault.write.pause({ account: adminSigner.account.address });

    await assert.rejects(
      vault.write.donate([parseEther("10")], {
        account: donor1.account.address,
      }),
      /EnforcedPause/,
    );
  });

  it("non-founder calls claim → revert", async () => {
    await vault.write.donate([parseEther("100")], {
      account: donor1.account.address,
    });

    const deadline = BigInt(await networkHelpers.time.latest()) + 3600n;
    const signature = await signClaim(
      adminSigner,
      parseEther("50"),
      1n,
      deadline,
    );

    await assert.rejects(
      vault.write.claim([parseEther("50"), 1n, deadline, signature], {
        account: attacker.account.address,
      }),
      /Caller is not the founder/,
    );
  });

  it("claim with wrong signer → revert", async () => {
    await vault.write.donate([parseEther("100")], {
      account: donor1.account.address,
    });

    const deadline = BigInt(await networkHelpers.time.latest()) + 3600n;
    // Ký bằng attacker thay vì adminSigner
    const fakeSignature = await signClaim(
      attacker,
      parseEther("50"),
      1n,
      deadline,
    );

    await assert.rejects(
      vault.write.claim([parseEther("50"), 1n, deadline, fakeSignature], {
        account: founder.account.address,
      }),
      /Invalid signature/,
    );
  });

  it("replay attack — reuse nonce → revert", async () => {
    await vault.write.donate([parseEther("1000")], {
      account: donor1.account.address,
    });

    const claimAmount = parseEther("100");
    const nonce = 1n;
    const deadline = BigInt(await networkHelpers.time.latest()) + 3600n;
    const signature = await signClaim(
      adminSigner,
      claimAmount,
      nonce,
      deadline,
    );

    // Lần 1 — thành công
    await vault.write.claim([claimAmount, nonce, deadline, signature], {
      account: founder.account.address,
    });

    // Lần 2 — replay → revert
    await assert.rejects(
      vault.write.claim([claimAmount, nonce, deadline, signature], {
        account: founder.account.address,
      }),
      /Nonce already used/,
    );
  });

  it("claim amount exceeds vault balance → revert", async () => {
    await vault.write.donate([parseEther("50")], {
      account: donor1.account.address,
    });

    const claimAmount = parseEther("100"); // nhiều hơn vault
    const deadline = BigInt(await networkHelpers.time.latest()) + 3600n;
    const signature = await signClaim(adminSigner, claimAmount, 1n, deadline);

    await assert.rejects(
      vault.write.claim([claimAmount, 1n, deadline, signature], {
        account: founder.account.address,
      }),
      /Insufficient vault balance/,
    );
  });

  it("claim when paused → revert", async () => {
    await vault.write.donate([parseEther("100")], {
      account: donor1.account.address,
    });

    await vault.write.pause({ account: adminSigner.account.address });

    const deadline = BigInt(await networkHelpers.time.latest()) + 3600n;
    const signature = await signClaim(
      adminSigner,
      parseEther("50"),
      1n,
      deadline,
    );

    await assert.rejects(
      vault.write.claim([parseEther("50"), 1n, deadline, signature], {
        account: founder.account.address,
      }),
      /EnforcedPause/,
    );
  });

  it("non-admin calls setAdminSigner → revert", async () => {
    await assert.rejects(
      vault.write.setAdminSigner([attacker.account.address], {
        account: attacker.account.address,
      }),
      /Caller is not the current admin signer/,
    );
  });

  it("setAdminSigner to zero address → revert", async () => {
    await assert.rejects(
      vault.write.setAdminSigner(
        ["0x0000000000000000000000000000000000000000"],
        { account: adminSigner.account.address },
      ),
      /Invalid new signer address/,
    );
  });

  it("old signer cannot authorize claim after rotation → revert", async () => {
    const newAdmin = donor2;
    await vault.write.setAdminSigner([newAdmin.account.address], {
      account: adminSigner.account.address,
    });

    await vault.write.donate([parseEther("100")], {
      account: donor1.account.address,
    });

    const deadline = BigInt(await networkHelpers.time.latest()) + 3600n;
    // Ký bằng signer CŨ
    const staleSignature = await signClaim(
      adminSigner,
      parseEther("50"),
      1n,
      deadline,
    );

    await assert.rejects(
      vault.write.claim([parseEther("50"), 1n, deadline, staleSignature], {
        account: founder.account.address,
      }),
      /Invalid signature/,
    );
  });
});
