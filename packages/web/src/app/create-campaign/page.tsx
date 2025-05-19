"use client";
import CreateCampaignGroup from "../../components/CreateCampaignGroup";
import AuthGuard from "../../components/AuthGuard";
import { useSessionClient } from "@lens-protocol/react";
import { useWalletClient } from "wagmi";

export default function CreateCampaignPage() {
  const { data: sessionClient } = useSessionClient();
  const { data: walletClient } = useWalletClient();

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)]">
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
            {sessionClient && walletClient && (
              <CreateCampaignGroup sessionClient={sessionClient} walletClient={walletClient} />
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
} 