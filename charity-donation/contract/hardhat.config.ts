import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 150,
          },
        },
      },
    },
  },
  test: {
    solidity: {
      ffi: false,
      timeout: 60000,
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    bscTestnet: {
      type: "http",
      chainType: "l1",
      url: "https://bnb-testnet.g.alchemy.com/v2/tJXZhoAiX7nu-LNyvzYoa9o4Xyb4C1cL",
      accounts: [configVariable("DEPLOYER_PK")],
    },
  },
  verify: {
    etherscan: {
      apiKey: configVariable("ETHERSCAN_KEY"),
    },
  },
});
