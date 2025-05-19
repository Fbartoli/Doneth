"use client";
import React, { useState } from "react";
import { group as groupMetadata } from "@lens-protocol/metadata";
import { lensAccountOnly, StorageClient } from "@lens-chain/storage-client";
import { lens } from "viem/chains";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { createGroup, fetchGroup } from "@lens-protocol/client/actions";
import { evmAddress, type SessionClient, useAuthenticatedUser, useAccount } from "@lens-protocol/react";
import type { WalletClient } from "viem";
import { factoryAbi } from "@/app/abis/factoryAbi";
import { useWriteContract } from "wagmi";

const storageClient = StorageClient.create();

interface Props {
  sessionClient: SessionClient;
  walletClient: WalletClient;
}

export default function CreateCampaignGroup({ sessionClient, walletClient }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState(""); // as string eth or gho
  const [deadline, setDeadline] = useState(""); // ISO date string
  const [withdrawalPeriod, setWithdrawalPeriod] = useState(""); // days
  const [beneficiary, setBeneficiary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { writeContract } = useWriteContract();
  const { data: user } = useAuthenticatedUser();
  const { data: account } = useAccount({ address: user?.address })
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const metadata = groupMetadata({ name, description });
      console.log(deadline, withdrawalPeriod, beneficiary, account?.address);

      const metadataFile = new File([
        JSON.stringify(metadata),
      ], "group-metadata.json", { type: "application/json" });

      const { uri } = await storageClient.uploadFile(metadataFile, {
        acl: lensAccountOnly(evmAddress(account?.address), lens.id)
      });

      const result = await createGroup(sessionClient, {
        metadataUri: uri,
        owner: evmAddress(account?.address),
      })
        .andThen(handleOperationWith(walletClient))
        .andThen(sessionClient.waitForTransaction)
        .andThen((txHash) => fetchGroup(sessionClient, {txHash}));


        if (result.isErr()) {
          return console.error(result.error);
        }

        writeContract({
          address: process.env.NEXT_PUBLIC_FACTORY as `0x${string}`,
          abi: factoryAbi,
          functionName: "createCampaign",
          args: [
            account?.address,
            BigInt(goal),
            BigInt(new Date(deadline).getTime() / 1000),
            BigInt(withdrawalPeriod),
            result.value?.address,
          ],
        });


      setSuccess(true);
      setName("");
      setDescription("");
      setGoal("");
      setDeadline("");
      setWithdrawalPeriod("");
      setBeneficiary("");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Create Campaign Group</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 rounded text-black" required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border p-2 rounded text-black" />
        <input type="number" placeholder="Goal (GHO)" value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full border p-2 rounded text-black" required />
        <input type="date" placeholder="Deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full border p-2 rounded text-black" required />
        <input type="number" placeholder="Withdrawal Period (days)" value={withdrawalPeriod} onChange={(e) => setWithdrawalPeriod(e.target.value)} className="w-full border p-2 rounded text-black" required />
        <input type="text" placeholder="Beneficiary address" value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} className="w-full border p-2 rounded text-black" required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">Campaign created!</p>}
        <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded">
          {loading ? "Creating..." : "Create Campaign"}
        </button>
      </form>
    </div>
  );
} 