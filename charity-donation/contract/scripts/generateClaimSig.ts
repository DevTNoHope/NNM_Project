import hre from "hardhat";

// =============================================================
//  Điền thông tin vào đây trước khi chạy
// =============================================================

const VAULT_ADDRESS = "0xaa0202467fBF7137CC22E59bD889ff364179B5C9";
const FOUNDER_ADDRESS = "0xA6380643f002608EB57d9316118D736FB37907f9";
const CLAIM_AMOUNT = "1000000000000000000"; // 1 USDT (18 decimals)
const NONCE = 1n;
const DEADLINE_IN_MINUTES = 30; // signature có hiệu lực 30 phút

// =============================================================

async function main() {
  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();

  // Lấy adminSigner từ accounts (ví deploy = adminSigner trên testnet)
  const [adminSigner] = await viem.getWalletClients();

  const chainId = await publicClient.getChainId();
  const deadline = BigInt(
    Math.floor(Date.now() / 1000) + DEADLINE_IN_MINUTES * 60,
  );

  console.log("\n===== THÔNG TIN CLAIM =====");
  console.log(`Vault       : ${VAULT_ADDRESS}`);
  console.log(`Founder     : ${FOUNDER_ADDRESS}`);
  console.log(`Amount      : ${CLAIM_AMOUNT}`);
  console.log(`Nonce       : ${NONCE}`);
  console.log(`Deadline    : ${deadline} (unix timestamp)`);
  console.log(`AdminSigner : ${adminSigner.account.address}`);
  console.log(`ChainId     : ${chainId}`);

  // Ký EIP-712
  const signature = await adminSigner.signTypedData({
    domain: {
      name: "HopeFund",
      version: "1",
      chainId,
      verifyingContract: VAULT_ADDRESS as `0x${string}`,
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
      projectId: await getProjectId(viem, VAULT_ADDRESS),
      founder: FOUNDER_ADDRESS as `0x${string}`,
      amount: BigInt(CLAIM_AMOUNT),
      nonce: NONCE,
      deadline,
    },
  });

  console.log("\n===== PASTE VÀO BSCSCAN =====");
  console.log(`amount    : ${CLAIM_AMOUNT}`);
  console.log(`nonce     : ${NONCE}`);
  console.log(`deadline  : ${deadline}`);
  console.log(`signature : ${signature}`);
  console.log("==============================\n");
}

async function getProjectId(viem: any, vaultAddress: string): Promise<bigint> {
  const vault = await viem.getContractAt(
    "HopeFundVault",
    vaultAddress as `0x${string}`,
  );
  return await vault.read.projectId();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
