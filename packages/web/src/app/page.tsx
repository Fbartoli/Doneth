"use client";
import { ConnectKitButton } from "connectkit";
import { useWriteContract, useReadContract, useChainId, useSendTransaction } from 'wagmi'
import { factoryAbi } from "./abis/factoryAbi"
import { parseEther } from "viem"
import { usePonderQuery } from "@ponder/react";
import { Campaign } from "./ponder/ponder.schema";

export default function Home() {
  const { data: hash, writeContract } = useWriteContract()
  const { data: hash1, sendTransaction } = useSendTransaction()
  const chainId = useChainId()
  const { data: campaigns } = useReadContract({
    address: process.env.NEXT_PUBLIC_FACTORY! as `0x${string}`,
    abi: factoryAbi,
    functionName: "getDeployedCampaigns",
  })

  const { data, isError, isPending } = usePonderQuery({
    queryFn: (db) =>
      db.select()
        .from(Campaign)
        .orderBy(Campaign.createdAt)
        .limit(10),
  });

  const createCampaign = async () => {
    await writeContract({
      address: process.env.NEXT_PUBLIC_FACTORY! as `0x${string}`,
      abi: factoryAbi,
      functionName: "createCampaign",
      args: [
        "0x75155d07f805eC2758eF6e2900B11F5988d17424",
        1n,
        1000000000000000n,
        1000n,
        "test",
      ],
    })
  }

  const sendEth = async () => {
    console.log("Sending Eth")
    await sendTransaction({
      to: '0x44857FCEE5328bCe58BdB97AFd1cC154Bd4d17f9',
      value: parseEther('0.001'),
    })
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <ConnectKitButton />
        <button onClick={createCampaign}>Create Campaign</button>
        {chainId && <div>Chain ID: {chainId}</div>}
        {hash && <div>Transaction Hash: {hash}</div>}
        <button onClick={sendEth}>Send Eth</button>
        {hash1 && <div>Transaction Hash: {hash1}</div>}
        {campaigns && <div>Campaigns: {campaigns.length}</div>}
        {data && data.map((campaign) => {
          return <div key={campaign.address}>{campaign.name}</div>
        })}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
