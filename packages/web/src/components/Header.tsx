"use client";
import { ConnectKitButton } from "connectkit";

export default function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-800">Doneth</div>
        <ConnectKitButton />
      </div>
    </header>
  );
} 