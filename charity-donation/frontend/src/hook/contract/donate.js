import { createPublicClient, createWalletClient, custom, http } from "viem";
import { bscTestnet } from "viem/chains";
import vaultAbi from "./abis/HopeFundVaultAbi.json";
import erc20Abi from "./abis/ERC20Abi.json";

const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http(import.meta.env.VITE_RPC_URL),
});

async function ensureWalletReady(expectedAccount) {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  const currentAccount = accounts?.[0];

  if (!currentAccount) {
    throw new Error("No wallet account connected");
  }

  if (
    expectedAccount &&
    currentAccount.toLowerCase() !== expectedAccount.toLowerCase()
  ) {
    throw new Error("Connected wallet does not match your linked wallet");
  }

  const currentChainId = await window.ethereum.request({
    method: "eth_chainId",
  });

  if (currentChainId !== "0x61") {
    throw new Error("Please switch MetaMask to BSC Testnet");
  }

  return currentAccount;
}

function getWalletClient() {
  return createWalletClient({
    chain: bscTestnet,
    transport: custom(window.ethereum),
  });
}

export async function approveUsdtMock({
  tokenAddress,
  spender,
  amount,
  account,
}) {
  const connectedAccount = await ensureWalletReady(account);
  const walletClient = getWalletClient();
  const hash = await walletClient.writeContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "approve",
    args: [spender, amount],
    account: connectedAccount,
  });

  console.log("approve hash:", hash);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("approve receipt:", receipt);

  if (receipt.status !== "success") {
    throw new Error("Approve transaction failed");
  }

  return hash;
}

export async function donateToVault({ vaultAddress, amount, account }) {
  const connectedAccount = await ensureWalletReady(account);
  const walletClient = getWalletClient();

  const simulation = await publicClient.simulateContract({
    address: vaultAddress,
    abi: vaultAbi,
    functionName: "donate",
    args: [amount],
    account: connectedAccount,
  });

  const hash = await walletClient.writeContract(simulation.request);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status !== "success") {
    throw new Error("Donation transaction failed");
  }

  return hash;
}
