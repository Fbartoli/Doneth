"use client";
import React from 'react';

interface CreateCampaignCardProps {
  createCampaign: () => Promise<void>;
  txHash?: string;
}

export default function CreateCampaignCard({ createCampaign, txHash }: CreateCampaignCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Create New Campaign</h2>
      <button
        onClick={createCampaign}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Create Campaign
      </button>
      {txHash && (
        <div className="mt-2 text-sm text-green-600">Creation Tx: {txHash}</div>
      )}
    </div>
  );
} 