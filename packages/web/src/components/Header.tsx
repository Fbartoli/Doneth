"use client";
import { ConnectKitButton } from "connectkit";
import React, { useState } from "react";
import { useSessionClient } from "@lens-protocol/react";
import Link from "next/link";

export default function Header() {
  const { data: sessionData } = useSessionClient();
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-800">Doneth</div>
        <div className="flex items-center gap-4">
          {sessionData && (
            <div className="relative">
              {/* Burger Icon */}
              <button
                type="button"
                className="flex flex-col justify-between w-6 h-5 focus:outline-none"
                onClick={() => setOpen((o) => !o)}
              >
                <span className="block w-full h-0.5 bg-gray-800"></span>
                <span className="block w-full h-0.5 bg-gray-800"></span>
                <span className="block w-full h-0.5 bg-gray-800"></span>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg py-2 z-50">
                  <Link
                    href="/edit-profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setOpen(false)}
                  >
                    Edit my profile
                  </Link>
                </div>
              )}
            </div>
          )}
          <ConnectKitButton />
        </div>
      </div>
    </header>
  );
} 