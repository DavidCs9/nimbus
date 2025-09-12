"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Home Page
 *
 * Main entry point that handles routing based on authentication state.
 * Redirects authenticated users to dashboard, unauthenticated users to login.
 */
export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // User is authenticated, redirect to dashboard
        router.replace("/dashboard");
      } else {
        // User is not authenticated, redirect to login
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-lg mb-4 animate-pulse">
          <svg
            className="w-6 h-6 text-primary-foreground"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M13 3L4 14h7v7l9-11h-7V3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Nimbus Console
        </h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
