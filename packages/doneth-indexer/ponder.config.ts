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
      transport: http(process.env.PONDER_RPC_URL),
    },
  },
  contracts: {
    Campaign: {
      network: "testnet",
      abi: campaignAbi,
      address: factory({
        address: process.env.FACTORY_ADDRESS as `0x${string}`,
        event: proxyCreationEvent,
        parameter: "campaignAddress",
      }),
      startBlock: 1800000,
    },
  },
});
