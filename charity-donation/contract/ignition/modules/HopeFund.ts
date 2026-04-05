import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// ─────────────────────────────────────────────────────────────────────────────
//  HopeFundModule
//
//  Flow:
//    1. Deploy MockUSDT
//    2. Mint 1 tỷ USDT vào ví deployer
//    3. Deploy HopeFundFactory
//    4. Deploy HopeFundVault mẫu → BSCScan "Similar Match" tự verify vault con
//
//  Deploy:
//    npx hardhat ignition deploy ignition/modules/HopeFund.ts \
//      --network bscTestnet \
//      --parameters ignition/params/bscTestnet.json
// ─────────────────────────────────────────────────────────────────────────────

export default buildModule("HopeFundModule", (m) => {
  const operatorAddress = m.getParameter<string>("operatorAddress");
  const deployerAddress = m.getParameter<string>("deployerAddress");

  // Deploy MockUSDT — tên "MockUSDT", symbol "USDT"
  const mockUSDT = m.contract("MockUSDT", []);

  // Mint 1 tỷ USDT (18 decimals) vào ví deployer
  m.call(mockUSDT, "mint", [deployerAddress, 1_000_000_000n * 10n ** 18n]);

  // Deploy Factory
  const factory = m.contract("HopeFundFactory", [mockUSDT, operatorAddress]);

  // Deploy 1 vault mẫu để BSCScan register source code
  // → các vault con tạo từ Factory sẽ được auto verify qua "Similar Match"
  const dummyVault = m.contract("HopeFundVault", [
    mockUSDT,
    operatorAddress,
    operatorAddress,
    0n,
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  ]);

  return { mockUSDT, factory, dummyVault };
});
