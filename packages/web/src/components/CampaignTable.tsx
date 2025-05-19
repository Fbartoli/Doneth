"use client";
import { formatEther, parseEther, zeroAddress } from "viem";
import { campaignAbi } from "../app/abis/campaignAbi";
import { useWriteContract } from 'wagmi';
import React, { useState } from 'react';
import Link from 'next/link';
import { Campaign } from "../app/ponder/ponder.schema";

interface CampaignTableProps {
  campaigns: typeof Campaign.$inferSelect[];
  expandedCampaignAddress: string | null;
  setExpandedCampaignAddress: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function CampaignTable({ campaigns, expandedCampaignAddress, setExpandedCampaignAddress }: CampaignTableProps) {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const { writeContract } = useWriteContract();

  const contribute = async (campaignAddress: string) => {
    const amount = inputValues[campaignAddress];
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      alert("Please enter a valid, positive amount to contribute.");
      return;
    }
    try {
      const value = parseEther(amount as `${number}`);
      await writeContract({
        address: campaignAddress as `0x${string}`,
        abi: campaignAbi,
        functionName: "contribute",
        value: value,
        args: [zeroAddress as `0x${string}`],
      });
    } catch (error) {
      console.error("Contribution failed:", error);
      alert(`Contribution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goal (GHO)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contributions (GHO)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {campaigns.map((campaign) => {
            const isExpanded = campaign.address === expandedCampaignAddress;
            const now = Math.floor(Date.now() / 1000);
            const deadlineTimestamp = typeof campaign.deadline === 'bigint' ? Number(campaign.deadline) : campaign.deadline;
            const isExpired = deadlineTimestamp ? deadlineTimestamp < now : false;
            const deadlineDate = deadlineTimestamp ? new Date(deadlineTimestamp * 1000).toLocaleString() : 'N/A';

            return (
              <React.Fragment key={campaign.address}>
                <tr className={`${isExpanded ? 'bg-indigo-50 dark:bg-indigo-900' : 'hover:bg-gray-50 dark:hover:bg-gray-700'} transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    <Link href={`/campaign/${campaign.address}`} className="hover:underline text-indigo-600 dark:text-indigo-400" title={campaign.name ?? ""}>
                      {campaign.name ?? ""}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatEther(campaign.goal ?? BigInt(0))}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatEther(campaign.totalContributions ?? BigInt(0))}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isExpired ? 
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Expired</span> : 
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setExpandedCampaignAddress(isExpanded ? null : campaign.address)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      {isExpanded ? 'Hide Details' : 'Show Details'}
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${campaign.address}-details`}>
                    <td colSpan={5} className="p-0">
                      <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t-2 border-indigo-200 dark:border-indigo-700">
                        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">Campaign Details:</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1"><strong>Address:</strong> {campaign.address}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3"><strong>Full Deadline:</strong> {deadlineDate}</p>
                        {!isExpired && (
                          <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700">
                            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Support this Campaign</h5>
                            <div className="space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
                              <div className="flex-grow">
                                <label htmlFor={`contributionAmount-${campaign.address}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Amount (GHO):
                                </label>
                                <input
                                  id={`contributionAmount-${campaign.address}`}
                                  type="number"
                                  value={inputValues[campaign.address] ?? ""}
                                  onChange={(e) =>
                                    setInputValues((prev) => ({
                                      ...prev,
                                      [campaign.address]: e.target.value,
                                    }))
                                  }
                                  placeholder="e.g., 0.1"
                                  min="0"
                                  step="any"
                                  className="block w-full px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm focus:outline-none transition-colors duration-150"
                                />
                              </div>
                              <button
                                onClick={() => contribute(campaign.address)}
                                className="w-full md:w-auto shrink-0 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-md shadow-sm hover:shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={
                                  !inputValues[campaign.address] ||
                                  isNaN(parseFloat(inputValues[campaign.address])) ||
                                  parseFloat(inputValues[campaign.address]) <= 0
                                }
                              >
                                Contribute ETH
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 