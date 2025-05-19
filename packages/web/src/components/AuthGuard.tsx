"use client";
import { ReactNode, useEffect, useState } from "react";
import { useAuthenticatedUser } from "@lens-protocol/react";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const { data: authenticatedUser } = useAuthenticatedUser();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  // Handle loading state
  useEffect(() => {
    // Wait for user data to resolve
    if (authenticatedUser === undefined) return;

    if (!authenticatedUser) {
      router.replace("/");
    } else {
      setAllowed(true);
    }
  }, [authenticatedUser, router]);

  if (!allowed) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  return <>{children}</>;
} 