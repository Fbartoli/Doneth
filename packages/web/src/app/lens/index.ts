import { PublicClient, mainnet } from "@lens-protocol/react";

let options;

if (typeof window === "undefined") {
  options = {
    environment: mainnet,
  };
} else {
  options = {
    environment: mainnet,
    storage: window.localStorage,
  };
}

export const lensClient = PublicClient.create(options);