const { createPublicClient, createWalletClient, http } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { bscTestnet } = require("viem/chains");
require("dotenv").config();

// ABI for the functions 
const HopeFundVaultAbi = [
  {
    "inputs": [],
    "name": "eip712Domain",
    "outputs": [
      { "name": "fields", "type": "bytes1" },
      { "name": "name", "type": "string" },
      { "name": "version", "type": "string" },
      { "name": "chainId", "type": "uint256" },
      { "name": "verifyingContract", "type": "address" },
      { "name": "salt", "type": "bytes32" },
      { "name": "extensions", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "adminSigner",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const HopeFundFactoryAbi = [
  {
    "inputs": [
      { "name": "projectId", "type": "uint256" },
      { "name": "founder", "type": "address" },
      { "name": "adminSigner", "type": "address" },
      { "name": "metaHash", "type": "bytes32" }
    ],
    "name": "createVault",
    "outputs": [{ "name": "vault", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "", "type": "uint256" }],
    "name": "vaults",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "projectId", "type": "uint256" },
      { "indexed": true, "name": "vault", "type": "address" },
      { "indexed": true, "name": "founder", "type": "address" },
      { "indexed": false, "name": "adminSigner", "type": "address" }
    ],
    "name": "VaultCreated",
    "type": "event"
  }
];

const getClients = () => {
  const privateKey = process.env.ADMIN_PRIVATE_KEY;
  const rpcUrl = process.env.RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545";

  if (!privateKey) {
    throw new Error("ADMIN_PRIVATE_KEY is not defined in .env");
  }

  const account = privateKeyToAccount(privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`);

  const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http(rpcUrl)
  });

  const walletClient = createWalletClient({
    account,
    chain: bscTestnet,
    transport: http(rpcUrl)
  });

  return { publicClient, walletClient, account };
};

/**
 * Admin signs the EIP-712 typed data for a Claim.
 * Returns the signature (bytes) that the Founder will use to call claim() on-chain.
 */
const signClaim = async (vaultAddress, projectId, founderAddress, amount, nonce, deadline) => {
  const { account, publicClient, walletClient } = getClients();

  // 1. Read EIP-712 domain from contract
  const domainData = await publicClient.readContract({
    address: vaultAddress,
    abi: HopeFundVaultAbi,
    functionName: "eip712Domain"
  });

  const domain = {
    name: domainData[1],
    version: domainData[2],
    chainId: Number(domainData[3]),
    verifyingContract: domainData[4]
  };

  // "Claim(uint256 projectId,address founder,uint256 amount,uint256 nonce,uint256 deadline)"
  const types = {
    Claim: [
      { name: "projectId", type: "uint256" },
      { name: "founder", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ]
  };

  const message = {
    projectId: BigInt(projectId),
    founder: founderAddress,
    amount: BigInt(amount),
    nonce: BigInt(nonce),
    deadline: BigInt(deadline)
  };

  // 2. Sign (Admin signs, Founder will submit)
  const signature = await walletClient.signTypedData({
    domain,
    types,
    primaryType: "Claim",
    message
  });

  return signature;
};

/**
 * Deploy a new HopeFundVault via the HopeFundFactory contract.
 * Admin signs the transaction using ADMIN_PRIVATE_KEY.
 * @returns {Promise<{vaultAddress: string, txHash: string}>}
 */
const deployVaultViaFactory = async (projectId, founderAddress, metaHash) => {
  const { account, publicClient, walletClient } = getClients();

  const factoryAddress = process.env.FACTORY_ADDRESS;
  if (!factoryAddress) {
    throw new Error("FACTORY_ADDRESS is not defined in .env");
  }

  console.log("=== DEPLOY VAULT VIA FACTORY ===");
  console.log("Factory:", factoryAddress);
  console.log("ProjectId:", projectId);
  console.log("Founder:", founderAddress);
  console.log("AdminSigner:", account.address);
  console.log("MetaHash:", metaHash);

  // Simulate first to check for errors
  const { request } = await publicClient.simulateContract({
    address: factoryAddress,
    abi: HopeFundFactoryAbi,
    functionName: "createVault",
    args: [BigInt(projectId), founderAddress, account.address, metaHash],
    account
  });

  // Execute transaction
  const txHash = await walletClient.writeContract(request);

  // Wait for receipt
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  // Get vault address from VaultCreated event
  let vaultAddress = null;
  for (const log of receipt.logs) {
    try {
      // VaultCreated event topic
      if (log.topics[0] === "0x5a4e3028e86e4f9290815b0ae068a8c97babd380fba79dd9f3f85416af5f7d47" ||
        log.topics.length >= 3) {
        // topics[2] = vault address (indexed)
        if (log.topics[2]) {
          vaultAddress = "0x" + log.topics[2].slice(26);
        }
      }
    } catch (e) {
      // skip
    }
  }

  // Fallback: read from factory mapping
  if (!vaultAddress) {
    vaultAddress = await publicClient.readContract({
      address: factoryAddress,
      abi: HopeFundFactoryAbi,
      functionName: "vaults",
      args: [BigInt(projectId)]
    });
  }
  return { vaultAddress, txHash };
};

module.exports = {
  signClaim,
  HopeFundVaultAbi,
  deployVaultViaFactory
};
