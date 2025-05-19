"use client";

import MyGroupsList from "../../components/GroupList";
import AuthGuard from "../../components/AuthGuard";

export default function MyCampaignsPage() {
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)]">
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
            <MyGroupsList />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
} 