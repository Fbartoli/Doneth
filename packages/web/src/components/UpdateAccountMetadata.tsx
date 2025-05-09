"use client";
import React, { useState, useEffect } from "react";
import { account as accountMetadata } from "@lens-protocol/metadata";
import { immutable, StorageClient } from "@lens-chain/storage-client";
import { lens } from "viem/chains";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { setAccountMetadata } from "@lens-protocol/client/actions";
import type { SessionClient } from "@lens-protocol/react";
import type { WalletClient } from "viem";
import { Account } from "@lens-protocol/react";

// Shared storage client instance (can be imported elsewhere if created globally)
const storageClient = StorageClient.create();

interface UpdateAccountMetadataProps {
    sessionClient: SessionClient;
    walletClient: WalletClient;
    account: Account;
}

export default function UpdateAccountMetadata({ sessionClient, walletClient, account }: UpdateAccountMetadataProps) {
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [picture, setPicture] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Attempt to pre-fill with existing metadata if available
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore – activeAccount is not typed in current sdk types
        console.log(sessionClient)
        console.log(account)
        if (account) {
            setName(account.metadata?.name ?? "");
            setBio(account.metadata?.bio ?? "");
            setPicture(account.metadata?.picture ?? "");
        }
    }, [account]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);
        try {
            // 1. Create metadata object
            const metadata = accountMetadata({ name, bio, picture });

            // 2. Upload metadata JSON
            const metadataFile = new File([
                JSON.stringify(metadata),
            ], "metadata.json", { type: "application/json" });

            const { uri } = await storageClient.uploadFile(metadataFile, {
                acl: immutable(lens.id),
            });

            // 3. Set the new metadata URI on the account
            await setAccountMetadata(sessionClient, { metadataUri: uri })
                .andThen(handleOperationWith(walletClient))
                .andThen(sessionClient.waitForTransaction);

            setSuccess(true);
            setName("");
            setBio("");
            setPicture("");
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="edit-profile" className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Update Profile Metadata</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Name</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block text-gray-700 w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        placeholder="Your name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="bio">Bio</label>
                    <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="mt-1 block text-gray-700 w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        placeholder="Short bio"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="picture">Picture URL</label>
                    <input
                        id="picture"
                        type="url"
                        value={picture}
                        onChange={(e) => setPicture(e.target.value)}
                        className="mt-1 block text-gray-700 w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        placeholder="https://..."
                    />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                {success && <p className="text-green-600 text-sm">Metadata updated successfully!</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    {loading ? "Updating..." : "Update Metadata"}
                </button>
            </form>
        </div>
    );
} 