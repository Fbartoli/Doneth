"use client";
import { formatEther, parseEther, zeroAddress } from "viem";
import { campaignAbi } from "../app/abis/campaignAbi";
import { useWriteContract } from 'wagmi';
import React, { useState } from 'react';

interface CampaignTableProps {
  campaigns: any[];
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
                <tr className={`${isExpanded ? 'bg-indigo-50' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate" title={campaign.name}>{campaign.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatEther(campaign.goal)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatEther(campaign.totalContributions)}</td>
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
                    <button
                      onClick={() => contribute(campaign.address)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Contribute
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${campaign.address}-details`}>
                    <td colSpan={5} className="p-0">
                      <div className="p-6 bg-gray-50 border-t border-indigo-200">
                        <h4 className="text-md font-semibold text-gray-700 mb-3">Campaign Details:</h4>
                        <p className="text-xs text-gray-500 mb-1"><strong>Address:</strong> {campaign.address}</p>
                        <p className="text-xs text-gray-500 mb-3"><strong>Full Deadline:</strong> {deadlineDate}</p>
                        {!isExpired && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h5 className="text-sm font-semibold text-gray-700 mb-2">Contribute to this Campaign:</h5>
                            <div className="flex items-center gap-4 mb-2">
                              <label htmlFor={`contributionAmount-${campaign.address}`} className="text-sm font-medium text-gray-700 whitespace-nowrap">Amount (ETH):</label>
                              <input
                                id={`contributionAmount-${campaign.address}`}
                                type="text"
                                value={inputValues[campaign.address] ?? ""}
                                onChange={(e) =>
                                  setInputValues((prev) => ({
                                    ...prev,
                                    [campaign.address]: e.target.value,
                                  }))
                                }
                                placeholder="0.01"
                                className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                              />
                            </div>
                            <button
                              onClick={() => contribute(campaign.address)}
                              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50"
                              disabled={
                                !inputValues[campaign.address] ||
                                parseFloat(inputValues[campaign.address]) <= 0
                              }
                            >
                              Contribute ETH
                            </button>
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