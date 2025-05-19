import type { Metadata } from "next";
import './globals.css'; // Import global styles
import { Providers } from './provider/Web3Provider';
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Support Our Cause - Donate Today",
  description: "Make a difference with your contribution. Secure and transparent donations to support our mission.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans bg-neutral-bg-lightest text-neutral-text antialiased">
      <Providers>
        <body>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="py-8 bg-neutral-bg-light border-t border-neutral-200 text-neutral-text-light">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
              &copy; {new Date().getFullYear()} Doneth. All rights reserved. | Your Trusted Donation Platform
            </div>
          </footer>
        </body>
      </Providers>
    </html>
  );
}
