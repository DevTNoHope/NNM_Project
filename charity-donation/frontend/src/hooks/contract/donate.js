import { publicClient, getWalletClient, ensureWalletReady } from "@/hooks/wallet/wallet";
import vaultAbi from "@/hooks/contract/abis/HopeFundVaultAbi.json";
import erc20Abi from "@/hooks/contract/abis/ERC20Abi.json";

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

export async function claimFromVault({ vaultAddress, amount, nonce, deadline, signature, account }) {
  const connectedAccount = await ensureWalletReady(account);
  const walletClient = getWalletClient();

  const simulation = await publicClient.simulateContract({
    address: vaultAddress,
    abi: vaultAbi,
    functionName: "claim",
    args: [BigInt(amount), BigInt(nonce), BigInt(deadline), signature],
    account: connectedAccount,
  });

  const hash = await walletClient.writeContract(simulation.request);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status !== "success") {
    throw new Error("Claim transaction failed");
  }

  return hash;
}
