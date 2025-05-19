"use client";
import { ConnectKitButton } from "connectkit";
import React, { useState } from "react";
import { useAuthenticatedUser, useLogout } from "@lens-protocol/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// A simple X icon for the close button, or a more refined one can be used
const BurgerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

export default function Header() {
  const { data: authenticatedUser } = useAuthenticatedUser();
  const router = useRouter();
  const { execute: logout, error: logoutError } = useLogout();
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-neutral-bg shadow-md sticky top-0 z-50 border-b border-neutral-bg-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="text-3xl font-bold font-display text-brand-primary hover:text-brand-primary-dark transition-colors">
          Doneth
        </Link>
        
        {logoutError && <div className="text-feedback-error text-sm">Error: {logoutError.message}</div>}
        
        <nav className="flex items-center gap-4">
          {/* TODO: Add primary navigation links here if needed for unauthenticated users */}
          {/* Example: <Link href="/about" className="text-neutral-text hover:text-brand-primary">About</Link> */}
          
          {authenticatedUser && (
            <div className="relative">
              <button
                type="button"
                className="p-2 rounded-md text-neutral-text hover:bg-neutral-bg-light focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary"
                onClick={() => setOpen((o) => !o)}
                aria-label="User menu"
                aria-expanded={open}
              >
                <BurgerIcon />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 bg-neutral-bg border border-neutral-bg-light rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                  <Link
                    href="/edit-profile"
                    className="block px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg-light hover:text-brand-primary transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    Edit My Profile
                  </Link>
                  <Link
                    href="/create-campaign"
                    className="block px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg-light hover:text-brand-primary transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    Create Campaign
                  </Link>
                  <Link
                    href="/my-campaigns"
                    className="block px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg-light hover:text-brand-primary transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    My Campaigns
                  </Link>
                  <div className="border-t border-neutral-bg-light my-1"></div>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg-light hover:text-brand-primary transition-colors"
                    onClick={() => {
                      logout().then(() => router.push("/"));
                      setOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
          <ConnectKitButton />
        </nav>
      </div>
    </header>
  );
} 