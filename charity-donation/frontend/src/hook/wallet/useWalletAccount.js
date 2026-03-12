import { useAccount } from "wagmi";

const useWalletAccount = () => {
  const { address, isConnected, chain } = useAccount();

  return {
    address,
    isConnected,
    chain,
  };
};

export default useWalletAccount;
