"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePonderQuery } from "@ponder/react";
import { Campaign } from "../../ponder/ponder.schema";
import { formatEther, parseEther, zeroAddress } from 'viem';
import FullPageLoader from '../../../components/FullPageLoader';
import { eq } from 'ponder';
import { evmAddress } from "@lens-protocol/client";
import { usePosts, useFeed, useGroup, useCreatePost } from "@lens-protocol/react";
import React, { useState } from 'react';
import { useWalletClient, useWriteContract } from 'wagmi';
import { campaignAbi } from '../../abis/campaignAbi';
import { handleOperationWith } from '@lens-protocol/client/viem';
import { textOnly } from '@lens-protocol/metadata';
import { immutable, StorageClient } from '@lens-chain/storage-client';
import { lens } from 'viem/chains';

const storageClient = StorageClient.create();
// interface CampaignPageParams { // Not strictly needed for page components
// address: string;
// }

export default function CampaignPage() {
  const params = useParams();
  const { data: wallet } = useWalletClient();
  const { execute, loading: isPosting, error: postError } = useCreatePost(handleOperationWith(wallet));
  const campaignAddress = params.address as string;

  const { data: campaignQueryResult, isLoading: isCampaignLoading, error: campaignError } = usePonderQuery({
    queryFn: (db) => db.select().from(Campaign).where(eq(Campaign.address, campaignAddress as `0x${string}`)).limit(1),
  });

  const campaign = campaignQueryResult?.[0];

  // Conditionally prepare the group argument for useGroup
  const groupAddressForHook = (isCampaignLoading || !campaign || !campaignAddress) ? undefined : evmAddress(campaign.name as `0x${string}`);

  const { data: group, loading: isGroupLoading, error: groupError } = useGroup({
    group: groupAddressForHook,
  });


  const { data: feed } = useFeed({
    feed: group?.feed?.address,
  });

  const feedAddress = feed?.address ? evmAddress(feed?.address) : undefined;

  const { data: posts } = usePosts({
    filter: {
      feeds: [{ feed: feedAddress }],
    },
  });

  const [contributionAmount, setContributionAmount] = useState<string>("");
  const [postContent, setPostContent] = useState<string>("");
  const { writeContract, isPending: isContributing, error: contributionHookError } = useWriteContract();


  if (isCampaignLoading || (campaign && isGroupLoading && groupAddressForHook)) {
    return <FullPageLoader />;
  }

  const errorMessage = campaignError?.message || (groupError && typeof groupError === 'object' && 'message' in groupError ? (groupError as Error).message : undefined) || "An unknown error occurred.";

  if (campaignError || (groupError && groupAddressForHook)) { // Only consider groupError if the hook was supposed to run
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <p className="text-red-500 dark:text-red-400 text-xl mb-4">
          Error loading campaign: {errorMessage}
        </p>
        <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!campaign) { // Handles case where campaign is not found after loading and no error
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <p className="text-gray-700 dark:text-gray-300 text-xl mb-4">Campaign not found.</p>
        <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  // At this point, 'campaign' is guaranteed to be available.
  const now = Math.floor(Date.now() / 1000);
  const deadlineTimestamp = typeof campaign.deadline === 'bigint' ? Number(campaign.deadline) : campaign.deadline;
  const isExpired = deadlineTimestamp ? deadlineTimestamp < now : false;
  const deadlineDate = deadlineTimestamp ? new Date(deadlineTimestamp * 1000).toLocaleString() : 'N/A';

  const handleContribute = async () => {
    if (!campaign || !campaign.address) {
      alert("Campaign details are not available to contribute.");
      return;
    }
    if (!contributionAmount || isNaN(parseFloat(contributionAmount)) || parseFloat(contributionAmount) <= 0) {
      alert("Please enter a valid, positive amount to contribute.");
      return;
    }
    try {
      const value = parseEther(contributionAmount as `${number}`);
      await writeContract({
        address: campaign.address as `0x${string}`,
        abi: campaignAbi,
        functionName: "contribute",
        value: value,
        args: [zeroAddress as `0x${string}`],
      });
      setContributionAmount(""); // Clear input on successful call
    } catch (error) {
      // This catch block might primarily catch errors if writeContract itself throws synchronously
      // or if parseEther fails. Asynchronous errors from the hook are usually in `contributionHookError`.
      console.error("Contribution setup failed:", error);
      alert(`Contribution setup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const createPost = async () => {
    if (!postContent.trim()) {
      alert("Post content cannot be empty.");
      return;
    }
    const metadata = textOnly({
      content: postContent,
    });

    const { uri } = await storageClient.uploadFile(
      new File([JSON.stringify(metadata)], 'metadata.json', { type: 'application/json' }),
      { acl: immutable(lens.id) },
    );
    const result = await execute({
      contentUri: uri,
      feed: feedAddress,
    });

    if (result.isErr()) {
      alert(result.error.message);
    }
    
    setPostContent("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-[family-name:var(--font-geist-sans)] py-12 px-4 sm:px-6 lg:px-8">
      <main className="container mx-auto max-w-3xl">
        <div className="mb-8">
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
            &larr; Back to All Campaigns
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 truncate" title={campaign.name ?? "Campaign"}>
              {group?.metadata?.name ?? campaign.name ?? "Campaign Details"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Managed by: {campaign.beneficiary}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Goal</h3>
                <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{formatEther(campaign.goal ?? BigInt(0))} GHO</p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Contributions</h3>
                <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{formatEther(campaign.totalContributions ?? BigInt(0))} GHO</p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</h3>
                {isExpired ? 
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100">Expired</span> : 
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100">Active</span>}
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Deadline</h3>
                <p className="text-lg text-gray-800 dark:text-gray-100">{deadlineDate}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Description</h3>
                <p className="text-lg text-gray-800 dark:text-gray-100">{group?.metadata?.description}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2"><strong>Collector Address:</strong> {campaign.address}</p>
            
  

            {!isExpired && (
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Contribute to this Campaign</h2>
                <div className="space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
                  <div className="flex-grow">
                    <label htmlFor={`contributionAmount-${campaign.address}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount (GHO):
                    </label>
                    <input
                      id={`contributionAmount-${campaign.address}`}
                      type="number"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      placeholder="e.g., 0.1"
                      min="0"
                      step="any"
                      className="block w-full px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm focus:outline-none transition-colors duration-150"
                      disabled={isContributing}
                    />
                  </div>
                  <button
                    onClick={handleContribute}
                    className="w-full md:w-auto shrink-0 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-md shadow-sm hover:shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      isContributing ||
                      !contributionAmount ||
                      isNaN(parseFloat(contributionAmount)) ||
                      parseFloat(contributionAmount) <= 0
                    }
                  >
                    {isContributing ? 'Contributing...' : 'Contribute GHO'}
                  </button>
                </div>
                {contributionHookError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    Error: {(contributionHookError as Error)?.message || "Failed to contribute."}
                  </p>
                )}
              </div>
            )}

            {/* Posts feed */}
            <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Campaign Updates & Discussion</h2>
              
              {/* New Post Input */}
              <div className="mb-8 bg-white dark:bg-gray-800 shadow rounded-lg p-5">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Create a new post</h3>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What&apos;s on your mind?"
                  rows={3}
                  className="w-full p-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150"
                  disabled={isPosting}
                />
                <button
                  onClick={createPost}
                  className="mt-3 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isPosting || !postContent.trim()}
                >
                  {isPosting ? 'Posting...' : 'Post Update'}
                </button>
                {postError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">Error: {postError.message}</p>}
              </div>

              {/* Display Posts */}
              {(!posts || posts.items.length === 0) && !isGroupLoading && feedAddress && (
                 <p className="text-gray-600 dark:text-gray-400">No posts yet in this campaign&apos;s feed. Be the first to share an update!</p>
              )}
              {posts?.items.map((post) => {
                if (post.__typename === 'Post') {
                  return (
                    <div key={post.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 mb-4">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={post.author?.address}>
                            {post.author?.address ?? 'Unknown Author'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {post.timestamp ? new Date(post.timestamp).toLocaleString() : 'Date N/A'}
                          </p>
                        </div>
                      </div>
                      {post.metadata && 'content' in post.metadata && typeof (post.metadata).content === 'string' && (
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {(post.metadata).content}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              })}
              {isGroupLoading && <p>Loading posts...</p> }


            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 