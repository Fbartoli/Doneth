"use client";
import UpdateAccountMetadata from "../../components/UpdateAccountMetadata";
import { useSessionClient } from "@lens-protocol/react";
import { useWalletClient } from "wagmi";
import { useSelectedAccount } from "../../contexts/SelectedAccountContext";

export default function EditProfilePage() {
  const { data: sessionClient } = useSessionClient();
  const { data: walletClient } = useWalletClient();
  const { account } = useSelectedAccount();

  if (!sessionClient || !walletClient || !account) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">No profile selected.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)]">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
          <UpdateAccountMetadata sessionClient={sessionClient} walletClient={walletClient} account={account} />
        </div>
      </main>

    </div>
  );
} 