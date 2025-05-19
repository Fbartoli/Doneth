"use client";
import React from "react";
import { evmAddress } from "@lens-protocol/client";
import { useGroups, useAuthenticatedUser } from "@lens-protocol/react";

export default function GroupList() {
  const { data: user } = useAuthenticatedUser();
  const { data: groups, loading, error } = useGroups({
    filter: {
      managedBy: { address: evmAddress(user!.address) },
    },
  });

  return (
    <div className="w-full mt-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">My Campaign Groups</h3>
      {loading && <p className="text-gray-600">Loading groups...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && groups.items.length === 0 && (
        <p className="text-gray-600">No groups found.</p>
      )}
      <ul className="space-y-2">
        {groups?.items.map((g) => (
          <li key={g.address} className="bg-white p-4 rounded shadow">
            <div className="font-medium text-gray-900">{g.metadata?.name ?? g.address}</div>
            <div className="text-xs text-gray-500 break-all">{g.address}</div>
            <div className="text-xs text-gray-500 break-all">{g.metadata?.description}</div>
            <div className="text-xs text-gray-500 break-all">{g.metadata?.id}</div>
            <div className="text-xs text-gray-500 break-all">{g.timestamp}</div>
            <div className="text-xs text-gray-500 break-all">{g.feed?.address}</div>
            
          </li>
        ))}
      </ul>
    </div>
  );
} 