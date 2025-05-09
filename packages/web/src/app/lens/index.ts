import { PublicClient, mainnet } from "@lens-protocol/react";


export const lensClient = PublicClient.create({
  environment: mainnet,
});