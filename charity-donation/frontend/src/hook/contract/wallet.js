import { createPublicClient, createWalletClient, custom, http } from "viem";
import { bscTestnet } from "viem/chains";

const BSC_TESTNET_CHAIN_ID = "0x61";

export const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http(import.meta.env.VITE_RPC_URL),
});

export function getWalletClient() {
  return createWalletClient({
    chain: bscTestnet,
    transport: custom(window.ethereum),
  });
}

export async function ensureWalletReady(expectedAccount) {
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

  if (currentChainId !== BSC_TESTNET_CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BSC_TESTNET_CHAIN_ID }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: BSC_TESTNET_CHAIN_ID,
              chainName: "BNB Smart Chain Testnet",
              nativeCurrency: {
                name: "tBNB",
                symbol: "tBNB",
                decimals: 18,
              },
              rpcUrls: ["https://data-seed-prebsc-1-s1.bnbchain.org:8545"],
              blockExplorerUrls: ["https://testnet.bscscan.com"],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  return currentAccount;
}
