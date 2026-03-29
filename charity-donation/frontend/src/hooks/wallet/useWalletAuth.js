import { useCallback, useMemo, useState } from "react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { loginWithWalletApi } from "@/api/authApi";

const buildLoginMessage = (address) => {
  return `Login to HopeFund 
Wallet: ${address}`;
};

const shortenAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const useWalletAuth = () => {
  const { address, isConnected, chain } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const [loading, setLoading] = useState(false);

  const displayAddress = useMemo(() => shortenAddress(address), [address]);

  const loginWithWallet = useCallback(async () => {
    if (!isConnected || !address) {
      throw new Error("Wallet is not connected");
    }

    setLoading(true);

    try {
      const message = buildLoginMessage(address);

      const signature = await signMessageAsync({
        message,
      });

      const result = await loginWithWalletApi({
        address,
        message,
        signature,
      });

      const { user, accessToken } = result.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      window.dispatchEvent(new Event("storage"));

      return result;
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, signMessageAsync]);

  const logoutWalletAuth = useCallback(async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    if (isConnected) {
      await disconnectAsync();
    }
  }, [disconnectAsync, isConnected]);

  return {
    address,
    displayAddress,
    isConnected,
    chain,
    loading,
    loginWithWallet,
    logoutWalletAuth,
  };
};

export default useWalletAuth;
