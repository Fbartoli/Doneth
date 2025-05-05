'use client';

import React from 'react'; // Ensure React is imported
import { WagmiProvider, createConfig, http } from "wagmi";
import { lens } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { PonderProvider } from "@ponder/react";
import { client } from "../ponder/ponder";
// Fetch WalletConnect Project ID and Alchemy ID from environment variables
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";
const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID || "";

// Check if Alchemy ID is provided, otherwise throw an error or handle appropriately
if (!alchemyId) {
  console.error("Alchemy ID (NEXT_PUBLIC_ALCHEMY_ID) is not defined in environment variables.");
  // Depending on your needs, you might want to throw an error or use a default/fallback RPC
}

const config = createConfig(
  getDefaultConfig({
    chains: [lens],
    transports: {
      [lens.id]: http(
        // Only use Alchemy URL if ID is present
        alchemyId ? `https://lens-mainnet.g.alchemy.com/v2/${alchemyId}` : undefined
      ),
    },
    walletConnectProjectId,
    appName: "Doneth",
    appDescription: "Doneth App Description",
    appUrl: "http://localhost:3000", // Replace with your actual app URL
    appIcon: "/logo.png", // Replace with your actual icon path
  }),
);

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PonderProvider client={client}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider>{children}</ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PonderProvider>
  );
}
