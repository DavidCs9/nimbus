"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

/**
 * Query Client Configuration
 *
 * Optimized settings for the best UX:
 * - Fast background refetching for data freshness
 * - Smart caching to minimize network requests
 * - Optimistic error handling with retries
 * - Stale-while-revalidate pattern for instant UI updates
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Background refetch for data freshness
        staleTime: 1000 * 60 * 2, // 2 minutes - data is fresh
        gcTime: 1000 * 60 * 5, // 5 minutes - cache retention

        // Aggressive background updates for best UX
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,

        // Smart retry strategy
        retry: (failureCount, error: unknown) => {
          // Don't retry on 4xx errors (client errors)
          if (
            typeof error === "object" &&
            error !== null &&
            "status" in error
          ) {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500) return false;
          }
          // Retry up to 3 times for network/server errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Network mode for best offline experience
        networkMode: "online",
      },
      mutations: {
        // Mutation configuration for optimal UX
        gcTime: 1000 * 60 * 5, // 5 minutes cache for mutation results

        // Retry mutations on network errors
        retry: (failureCount, error: unknown) => {
          // Don't retry client errors
          if (
            typeof error === "object" &&
            error !== null &&
            "status" in error
          ) {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500) return false;
          }
          // Retry network errors once
          return failureCount < 1;
        },

        networkMode: "online",
      },
    },
  });
}

// Global variable to ensure single instance
let clientSingleton: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!clientSingleton) clientSingleton = createQueryClient();
    return clientSingleton;
  }
}

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Query Provider Component
 *
 * Provides TanStack Query context to the entire application.
 * Includes development tools for debugging queries in development mode.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // NOTE: Avoid useState when initializing the query client if you don't
  // have a suspense boundary between this and the code that may suspend
  // because React will throw away the client on the initial render if it suspends
  // and there is no boundary
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
          position="bottom"
        />
      )}
    </QueryClientProvider>
  );
}
