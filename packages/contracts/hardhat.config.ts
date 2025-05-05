import "@matterlabs/hardhat-zksync";
import "@nomicfoundation/hardhat-toolbox";

import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.24",

  zksolc: {
    version: "latest",
    settings: {},
  },

  networks: {
    lensTestnet: {
      chainId: 232,
      ethNetwork: "lens-mainnet",
      url: "https://lens-mainnet.g.alchemy.com/v2/HtjVi-EgFf7Up_PGwYLEBKzwvxB-hw1f",
      verifyURL:
        "https://block-explorer-verify.testnet.lens.dev/contract_verification",
      zksync: true,
    },

    hardhat: {
      zksync: true,
    },
  },
};

export default config;