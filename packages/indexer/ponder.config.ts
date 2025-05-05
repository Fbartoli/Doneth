import { parseAbiItem } from "abitype";
import { createConfig, factory } from "ponder";

import { http } from "viem";
import { campaignAbi } from "./abis/campaignAbi";

const proxyCreationEvent = parseAbiItem(
  "event CampaignCreated(address indexed campaignAddress,address indexed beneficiary,uint256 goal,uint256 deadline,uint256 withdrawalPeriod,string name)",
);

export default createConfig({
  networks: {
    testnet: {
      chainId: 31337,
      transport: http(process.env.PONDER_RPC_URL_1),
    },
  },
  contracts: {
    Campaign: {
      network: "testnet",
      abi: campaignAbi,
      address: factory({
        address: "0xB90AcF57C3BFE8e0E8215defc282B5F48b3edC74",
        event: proxyCreationEvent,
        parameter: "campaignAddress",
      }),
      startBlock: 22403150,
    },
  },
});
