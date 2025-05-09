"use client";
import React, { createContext, useContext, useState } from "react";
import type { Account } from "@lens-protocol/client";

interface SelectedAccountContextValue {
  account: Account | null;
  setAccount: (acc: Account | null) => void;
}

const SelectedAccountContext = createContext<SelectedAccountContextValue | undefined>(undefined);

export function SelectedAccountProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  return (
    <SelectedAccountContext.Provider value={{ account, setAccount }}>
      {children}
    </SelectedAccountContext.Provider>
  );
}

export function useSelectedAccount() {
  const ctx = useContext(SelectedAccountContext);
  if (!ctx) throw new Error("useSelectedAccount must be used within SelectedAccountProvider");
  return ctx;
} 