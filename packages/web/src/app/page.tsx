"use client";
import { useWalletClient, useAccount } from 'wagmi'
import { usePonderQuery } from "@ponder/react";
import { Campaign } from "./ponder/ponder.schema";
import { handleOperationWith, signMessageWith } from "@lens-protocol/client/viem";
import { evmAddress, Role, Account, never } from "@lens-protocol/client";
import { useAccountsAvailable, useAuthenticatedUser, useLoginAction } from "@lens-protocol/react";
import { createAccountWithUsername, fetchAccount } from '@lens-protocol/client/actions';
import { account } from '@lens-protocol/metadata';
import { immutable, StorageClient } from "@lens-chain/storage-client";
import { lens } from "viem/chains";
import React, { useState } from 'react';

import CampaignTable from "../components/CampaignTable";
import FullPageLoader from "../components/FullPageLoader";
import { gt } from 'ponder';

const storageClient = StorageClient.create();

export default function Home() {
  const { address } = useAccount()
  const { data: authenticatedUser } = useAuthenticatedUser();
  const [expandedCampaignAddress, setExpandedCampaignAddress] = useState<string | null>(null);

  const { isLoading: ponderIsLoading, error: ponderError, data: campaignsData } = usePonderQuery({
    queryFn: (db) => {
      const now = Math.floor(Date.now() / 1000);
      return db.select()
        .from(Campaign)
        .where(gt(Campaign.deadline, BigInt(now)))
        .limit(10)
    }
  });

  const isAppLoading =
    authenticatedUser === undefined ||
    (authenticatedUser && ponderIsLoading);

  return (
    <>
      {isAppLoading && <FullPageLoader />}
      
      {/* Campaigns & Wallet Interaction Section */}
      <section className="py-16 md:py-24 bg-neutral-bg-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 w-full max-w-5xl mx-auto">
            {!address && (
              <div className="w-full bg-neutral-bg p-8 rounded-xl shadow-xl text-center">
                <h2 className="text-3xl font-bold font-display text-neutral-text-dark mb-4">Ready to Get Started?</h2>
                <p className="text-lg text-neutral-text mb-6">Connect your wallet to view active campaigns and make a secure donation.</p>
                {/* ConnectKitButton could be placed here or rely on header */}
                <p className="text-sm text-neutral-text-light">Please use the &quot;Connect Wallet&quot; button in the header.</p>
              </div>
            )}

            {address && !authenticatedUser && (
              <LoginOptions address={address} />
            )}

            <div className="w-full">
              {authenticatedUser && (
                <>
                  <h2 className="text-3xl md:text-4xl font-bold font-display text-neutral-text-dark mb-8 text-center">Active Campaigns</h2>
                  {ponderIsLoading && <p className="text-center text-neutral-text">Loading campaigns...</p>}
                  {ponderError && <p className="text-center text-feedback-error">Error loading campaigns: {ponderError.message}</p>}
                  {campaignsData && campaignsData.length > 0 && (
                    <CampaignTable
                      campaigns={campaignsData}
                      expandedCampaignAddress={expandedCampaignAddress}
                      setExpandedCampaignAddress={setExpandedCampaignAddress}
                    />
                  )}
                  {campaignsData && campaignsData.length === 0 && (
                     <p className="text-center text-neutral-text text-lg bg-neutral-bg p-8 rounded-xl shadow-md">No active campaigns at the moment. Please check back soon!</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function LoginOptions({ address }: { address: string }) {
  const { data } = useAccountsAvailable({ managedBy: evmAddress(address) });
  const { execute } = useLoginAction();
  const { data: walletData } = useWalletClient();

  const shorten = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  const handleCreateProfile = async () => {
    const authenticated = await execute({
      onboardingUser: {
        app: evmAddress("0x167cD03A0dc9eB30A94caAcf3dea05e0f351cBAc"),
        wallet: evmAddress(address),
      },
      signMessage: signMessageWith(walletData!),
    });

    if (authenticated.isErr()) {
      return console.error(authenticated.error);
    }

    const sessionClient = authenticated.value;

    const metadata = account({ name: 'New user' });
    const { uri } = await storageClient.uploadFile(
      new File([JSON.stringify(metadata)], 'metadata.json', { type: 'application/json' }),
      { acl: immutable(lens.id) },
    );
    await createAccountWithUsername(sessionClient, {
      metadataUri: uri,
      username: { localName: `user-${Date.now()}` },
    })
      .andThen(handleOperationWith(walletData!))
      .andThen(sessionClient.waitForTransaction)
      .andThen((txHash) => fetchAccount(sessionClient, { txHash }))
      .andThen((account) =>
        sessionClient.switchAccount({
          account: account?.address ?? never("Account not found"),
        })
      )
      .match(() => { }, (error) => { throw error; });
  };

  function LoginWith({ account, role: _role }: { account: Account; role: Role }) {
    return (
      <div className="bg-neutral-bg border border-neutral-bg-light rounded-lg shadow-lg hover:shadow-xl p-6 flex flex-col items-center text-center transition-shadow">
        <div className="text-lg font-medium text-neutral-text-dark mb-1">
          {account.username?.value ?? shorten(account.address)}
        </div>
        <div className="text-xs text-neutral-text-light break-all mb-4">{shorten(account.address)}</div>
        <div className="text-xs text-neutral-text-light break-all mb-4">Role: {_role}</div>
        <button
          type="button"
          className="w-full bg-brand-primary hover:bg-brand-primary-dark text-black font-semibold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary-light"
          onClick={() => {
            let loginSpecificDetails;
            if (_role === Role.AccountOwner) {
              loginSpecificDetails = {
                accountOwner: {
                  account: account.address,
                  owner: account.owner,
                },
              };
            } else {
              loginSpecificDetails = {
                accountManager: {
                  account: account.address,
                  manager: walletData!.account.address,
                },
              };
            }
            execute({
              ...loginSpecificDetails,
              signMessage: signMessageWith(walletData!),
            });
          }}
        >
          Select Profile
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-neutral-bg p-8 rounded-xl shadow-xl">
      <h3 className="text-2xl font-bold font-display text-neutral-text-dark mb-6 text-center">Connect with Lens Protocol</h3>
      <p className="text-neutral-text text-center mb-6">
        {data?.items?.length ? 'Select one of your Lens profiles to continue or create a new one.' : 'No Lens profiles found for this wallet. You can create one below.'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {data?.items?.map((item) => (
          <LoginWith
            key={item.account.address}
            account={item.account}
            role={item.__typename === 'AccountOwned' ? Role.AccountOwner : Role.AccountManager}
          />
        ))}
      </div>
      
      <div className="bg-neutral-bg-lightest border-2 border-dashed border-brand-secondary-light rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-brand-secondary transition-colors">
        <h4 className="text-xl font-semibold text-neutral-text-dark mb-3">New to Lens?</h4>
        <p className="text-neutral-text mb-4">Create a new Lens profile to manage your identity and contributions.</p>
        <button
          type="button"
          className="bg-brand-secondary hover:bg-brand-secondary-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-secondary-light"
          onClick={handleCreateProfile}
        >
          Create Lens Profile
        </button>
      </div>
    </div>
  )
}