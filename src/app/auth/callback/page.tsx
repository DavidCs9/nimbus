"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/auth-service';
import type { User, AuthTokens } from '@/lib/auth-context';

/**
 * Authentication Callback Page
 * 
 * Handles the return from Cognito Hosted UI after authentication.
 * Exchanges the authorization code for tokens and redirects to the dashboard.
 */
export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        // Check for error in URL parameters
        if (errorParam) {
          const errorDescription = searchParams.get('error_description') || errorParam;
          throw new Error(`Authentication failed: ${errorDescription}`);
        }

        // Check for authorization code
        if (!code) {
          throw new Error('No authorization code received');
        }

        setStatus('loading');

        // Exchange code for tokens
        const { user, tokens } = await authService.handleCallback(code);

        // Set authentication state globally
        if (typeof window !== 'undefined') {
          const windowWithAuth = window as Window & { 
            __nimbus_setAuthenticated?: (user: User, tokens: AuthTokens) => void 
          };
          if (windowWithAuth.__nimbus_setAuthenticated) {
            windowWithAuth.__nimbus_setAuthenticated(user, tokens);
          }
        }

        setStatus('success');

        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          router.replace('/');
        }, 1000);

      } catch (error) {
        console.error('Authentication callback error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        setStatus('error');

        // Redirect to login after a delay on error
        setTimeout(() => {
          router.replace('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-lg mb-4">
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

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin h-8 w-8 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <p className="text-muted-foreground">
              Completing authentication...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Authentication Successful
              </h2>
              <p className="text-muted-foreground">
                Redirecting to your dashboard...
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Authentication Failed
              </h2>
              <p className="text-red-600 text-sm mb-4">
                {error}
              </p>
              <p className="text-muted-foreground text-sm">
                Redirecting to login page...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}