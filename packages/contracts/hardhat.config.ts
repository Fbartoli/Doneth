import "@matterlabs/hardhat-zksync";
import "@nomicfoundation/hardhat-toolbox";

import { HardhatUserConfig } from "hardhat/config";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",

  zksolc: {
    version: "latest",
    settings: {},
  },

  networks: {
    lens: {
      chainId: 232,
      ethNetwork: "lens",
      url: `https://lens-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`,
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