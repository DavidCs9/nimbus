"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCognitoLogin = async () => {
    setIsLoading(true);

    // TODO: Implement Cognito authentication flow
    console.log("Initiating Cognito login...");

    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
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
          <p className="text-muted-foreground text-sm">
            Your minimal AWS management interface
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in with your AWS Cognito account to access your console
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* AWS Cognito Login Button */}
            <Button
              onClick={handleCognitoLogin}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5"
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
                  Connecting...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h3.025c.264-3.593 3.314-6.5 7.45-6.5 4.136 0 7.186 2.907 7.45 6.5H24c-.264-5.557-4.854-10-10.5-10zM2.025 14H5.05c.264 3.593 3.314 6.5 7.45 6.5 4.136 0 7.186-2.907 7.45-6.5H24c-.264 5.557-4.854 10-10.5 10C7.879 24 3.289 19.557 3.025 14z" />
                  </svg>
                  Continue with AWS Cognito
                </>
              )}
            </Button>

            {/* Additional Info */}
            <div className="mt-6 p-4 bg-muted rounded-md">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-card-foreground mb-1">
                    Secure Authentication
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Your authentication is handled securely through AWS Cognito.
                    You&apos;ll be redirected to complete the sign-in process.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground text-xs">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
