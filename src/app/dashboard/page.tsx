"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Dashboard Page
 *
 * Main dashboard interface for authenticated users.
 * Displays a welcome message and will include AWS service management features.
 */
export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
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
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (redirect is in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <svg
                className="w-4 h-4 text-primary-foreground"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M13 3L4 14h7v7l9-11h-7V3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-foreground">
              Nimbus Console
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.name || user?.email || "User"}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome to Nimbus Console
            </h2>
            <p className="text-muted-foreground text-lg">
              Your minimal AWS management interface. Get started by exploring
              your cloud resources.
            </p>
          </div>

          {/* Welcome Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <span>Getting Started</span>
              </CardTitle>
              <CardDescription>
                Welcome to your AWS management dashboard. Here you can monitor
                and manage your cloud resources.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-card">
                    <h3 className="font-semibold text-foreground mb-2">
                      AWS Lambda
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your serverless functions
                    </p>
                    <div className="mt-3">
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        Coming Soon
                      </span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <h3 className="font-semibold text-foreground mb-2">
                      Amazon S3
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Browse and manage your storage buckets
                    </p>
                    <div className="mt-3">
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        Coming Soon
                      </span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <h3 className="font-semibold text-foreground mb-2">
                      DynamoDB
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Monitor your NoSQL databases
                    </p>
                    <div className="mt-3">
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Current Status:</strong> You are successfully
                    authenticated with AWS Cognito. More AWS service
                    integrations will be added soon.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your authentication details and session information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">
                    Email:
                  </span>
                  <span className="text-sm text-foreground">
                    {user?.email || "Not available"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">
                    Name:
                  </span>
                  <span className="text-sm text-foreground">
                    {user?.name || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    User ID:
                  </span>
                  <span className="text-sm text-foreground font-mono">
                    {user?.id || "Not available"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
