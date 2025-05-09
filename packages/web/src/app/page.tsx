"use client";
import { useWalletClient, useAccount } from 'wagmi'
import { usePonderQuery } from "@ponder/react";
import { Campaign } from "./ponder/ponder.schema";
import { handleOperationWith, signMessageWith } from "@lens-protocol/client/viem";
import { evmAddress, Role, Account } from "@lens-protocol/client";
import { desc, gt } from "ponder";
import { useAccountsAvailable, useAuthenticatedUser, useLogin, useSessionClient } from "@lens-protocol/react";
import { useSelectedAccount } from "../contexts/SelectedAccountContext";
import { createAccountWithUsername, fetchAccount } from '@lens-protocol/client/actions';
import { account } from '@lens-protocol/metadata';
import { immutable, StorageClient } from "@lens-chain/storage-client";

import { lens } from "viem/chains";

const storageClient = StorageClient.create();


export default function Home() {
  const { address } = useAccount()
  const { account: selectedAccount } = useSelectedAccount();
  const { data: authenticatedUser } = useAuthenticatedUser();
  console.log("authenticatedUser", authenticatedUser)

  const { isLoading: ponderIsLoading, error: ponderError } = usePonderQuery({
    queryFn: (db) => {
      const now = Math.floor(Date.now() / 1000);
      return db.select()
        .from(Campaign)
        .orderBy(desc(Campaign.totalContributions))
        .where(gt(Campaign.deadline, BigInt(now)))
        .limit(10)
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)]">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">


          {!selectedAccount && address && !authenticatedUser && (
            <LoginOptions address={address} />
          )}

          {!address && (
            <div className="w-full bg-white p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-xl font-semibold mb-2 text-gray-700">Welcome to Doneth</h2>
              <p className="text-gray-600">Please connect your wallet using the button in the top-right corner to continue.</p>
            </div>
          )}

          <div className="w-full">

            {ponderIsLoading && <p className="text-center text-gray-600">Loading campaigns...</p>}
            {ponderError && <p className="text-center text-red-600">Error loading campaigns: {ponderError.message}</p>}

          </div>
        </div>
      </main>


    </div>
  );
}

export function LoginOptions({ address }: { address: string }) {
  const { data } = useAccountsAvailable({ managedBy: evmAddress(address) });
  const { execute } = useLogin();
  const { data: sessionData } = useSessionClient();
  const { data: walletData } = useWalletClient();
  const { setAccount: setSelectedAccount } = useSelectedAccount();



  // Helper to shorten long addresses
  const shorten = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  const handleCreateProfile = async () => {
    // Trigger onboarding (creates a session & profile) then upload metadata & create account
    await execute({
      onboardingUser: {
        app: evmAddress("0x167cD03A0dc9eB30A94caAcf3dea05e0f351cBAc"),
        wallet: evmAddress(address),
      },
      signMessage: signMessageWith(walletData!),
    });

    const metadata = account({ name: 'New user' });
    const { uri } = await storageClient.uploadFile(
      new File([JSON.stringify(metadata)], 'metadata.json', { type: 'application/json' }),
      { acl: immutable(lens.id) },
    );

    await createAccountWithUsername(sessionData!, {
      metadataUri: uri,
      username: { localName: `user-${Date.now()}` },
    })
      .andThen(handleOperationWith(walletData!))
      .andThen(sessionData!.waitForTransaction)
      .andThen((txHash) => fetchAccount(sessionData!, { txHash }))
      .match(() => { }, (error) => { throw error; });
  };

  function LoginWith({ account, role: _role }: { account: Account; role: Role }) {
    return (
      <div className="bg-white border rounded-lg shadow hover:shadow-md p-6 flex flex-col items-center text-center">
        <div className="text-lg font-medium text-gray-800 mb-1">
          {account.username?.value ?? shorten(account.address)}
        </div>
        <div className="text-xs text-gray-500 break-all mb-4">{shorten(account.address)}</div>
        <div className="text-xs text-gray-500 break-all mb-4">{_role}</div>
        <button
          type="button"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
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
              // Assuming for Role.AccountManager or other manager roles
              // The connected wallet (walletData.account.address) acts as the manager
              loginSpecificDetails = {
                accountManager: {
                  account: account.address,
                  manager: walletData!.account.address,
                },
              };
            }

            setSelectedAccount(account)

            execute({
              ...loginSpecificDetails,
              signMessage: signMessageWith(walletData!),
            });
          }}
        >
          Select profile
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{data?.items?.length ? 'Select a Lens profile' : 'No Lens profiles found'}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data?.items?.map((item) => (
          <LoginWith
            key={item.account.address}
            account={item.account}
            role={item.__typename === 'AccountOwned' ? Role.AccountOwner : Role.AccountManager}
          />
        ))}

        {/* Card for creating a new profile */}
        <div className="bg-white border-dashed border-2 border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-green-500">
          <p className="text-gray-700 mb-4">Create new Lens profile</p>
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
            onClick={handleCreateProfile}
          >
            Create profile
          </button>
        </div>
      </div>
    </div>
  )
}