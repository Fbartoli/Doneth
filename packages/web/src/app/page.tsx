"use client";
import Header from "../components/Header";
import { useWriteContract, useWalletClient, useAccount } from 'wagmi'
import { factoryAbi } from "./abis/factoryAbi"
import { usePonderQuery } from "@ponder/react";
import { Campaign } from "./ponder/ponder.schema";
import { signMessageWith } from "@lens-protocol/client/viem";
import { PublicClient, mainnet, SessionClient, evmAddress } from "@lens-protocol/client";
import { useState } from "react";
import { desc, gt } from "ponder";
import CreateCampaignCard from "../components/CreateCampaignCard";
import CampaignTable from "../components/CampaignTable";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { data: hash, writeContract } = useWriteContract()
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [authenticated, setAuthenticated] = useState<SessionClient | boolean>(false)
  const [expandedCampaignAddress, setExpandedCampaignAddress] = useState<string | null>(null);
  const client = PublicClient.create({
    environment: mainnet,
  });

  const login = async () => {
    const authenticated = await client.login({
      onboardingUser: {
        app: "0x8FA8f97850A5BB6D8a02c56f198Dc93e532Fd88C",
        wallet: address,
      },
      signMessage: signMessageWith(walletClient!),
    });

    // The result of client.login is a Result type (Ok/Err), not the session directly.
    // You should check if it's Ok before setting authenticated.
    if (authenticated.isOk()) {
      setAuthenticated(authenticated.value);
    } else {
      // Optionally handle error here, e.g. show a message or log
      setAuthenticated(false);
      // console.error(authenticated.error);
    }
  }

  const { data: ponderData, isLoading: ponderIsLoading, error: ponderError } = usePonderQuery({
    queryFn: (db) => {
      const now = Math.floor(Date.now() / 1000);
      return db.select()
        .from(Campaign)
        .orderBy(desc(Campaign.totalContributions))
        .where(gt(Campaign.deadline, BigInt(now)))
        .limit(10)
    }
  });

  const { data: accountsAvailable } = useQuery({
    queryKey: ['accountsAvailable'],
    queryFn: async () => {
      const result = await fetchAccountsAvailable(client, {
        managedBy: evmAddress(address!),
        includeOwned: true,
      });
      return result;
    },
  });


  const createCampaign = async () => {
    await writeContract({
      address: process.env.NEXT_PUBLIC_FACTORY! as `0x${string}`,
      abi: factoryAbi,
      functionName: "createCampaign",
      args: [
        "0x75155d07f805eC2758eF6e2900B11F5988d17424",
        1n,
        100000000000n,
        1000n,
        "test",
      ],
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)]">
      <Header />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
          {authenticated && (
            <CreateCampaignCard createCampaign={createCampaign} txHash={hash} />
          )}
          {accountsAvailable && (
            <div className="bg-white p-6 rounded-lg shadow-lg w-full">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Accounts Available</h2>
              <p className="text-gray-700">{JSON.stringify(accountsAvailable)}</p>
            </div>
          )}

          {!authenticated && (
            <div className="bg-white p-6 rounded-lg shadow-lg w-full">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Authenticate with Lens</h2>
              <button
                onClick={login}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
              >
                Login with Lens
              </button>
            </div>
          )}


          <div className="w-full">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Active Campaigns</h2>

            {ponderIsLoading && <p className="text-center text-gray-600">Loading campaigns...</p>}
            {ponderError && <p className="text-center text-red-600">Error loading campaigns: {ponderError.message}</p>}

            {ponderData && Array.isArray(ponderData) && ponderData.length > 0 ? (
              <CampaignTable
                campaigns={ponderData}
                expandedCampaignAddress={expandedCampaignAddress}
                setExpandedCampaignAddress={setExpandedCampaignAddress}
              />
            ) : (
              !ponderIsLoading && <p className="text-center text-gray-500">No campaigns found.</p>
            )}
          </div>
        </div>
      </main>

      <footer className="py-6 bg-gray-100 border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Doneth. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
