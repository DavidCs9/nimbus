"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/ui/dashboard-header";

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

  const navigateToEC2 = () => {
    router.push("/ec2");
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <DashboardHeader user={user || undefined} onSignOut={handleSignOut} />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-6 overflow-auto">
        <div className="h-full max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome to Nimbus Console
            </h2>
            <p className="text-muted-foreground text-lg">
              Your minimal AWS management interface. Get started by exploring
              your cloud resources.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* AWS Services Section */}
            <div className="xl:col-span-3">
              <Card className="h-fit">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <span>AWS Services</span>
                  </CardTitle>
                  <CardDescription>
                    Monitor and manage your cloud resources across different AWS
                    services.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div
                      onClick={navigateToEC2}
                      className="group p-4 border rounded-xl bg-gradient-to-br from-card to-muted/20 hover:from-primary/5 hover:to-primary/10 transition-all duration-200 hover:border-primary/20 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-orange-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M21 16V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM5 4h14v12H5V4zm2 6h2v4H7v-4zm4-2h2v6h-2V8zm4-2h2v8h-2V6z" />
                          </svg>
                        </div>
                        <span className="text-xs bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                          Available
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">
                        Amazon EC2
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your virtual servers and compute instances
                      </p>
                    </div>

                    <div className="group p-4 border rounded-xl bg-gradient-to-br from-card to-muted/20 hover:from-primary/5 hover:to-primary/10 transition-all duration-200 hover:border-primary/20">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-purple-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M.5 17.5L12 22l11.5-4.5v-5L12 17 .5 12.5v5zM.5 12L12 16.5 23.5 12 12 7.5.5 12zM.5 6.5L12 11 23.5 6.5 12 2 .5 6.5z" />
                          </svg>
                        </div>
                        <span className="text-xs bg-secondary/80 text-secondary-foreground px-2 py-1 rounded-full">
                          Coming Soon
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">
                        AWS Lambda
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your serverless functions and monitor executions
                      </p>
                    </div>

                    <div className="group p-4 border rounded-xl bg-gradient-to-br from-card to-muted/20 hover:from-primary/5 hover:to-primary/10 transition-all duration-200 hover:border-primary/20">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 7H9V5a3 3 0 0 1 6 0v2zM5 7h2v12h10V7h2a1 1 0 0 1 1 1v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8a1 1 0 0 1 1-1z" />
                          </svg>
                        </div>
                        <span className="text-xs bg-secondary/80 text-secondary-foreground px-2 py-1 rounded-full">
                          Coming Soon
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">
                        Amazon S3
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Browse and manage your storage buckets and objects
                      </p>
                    </div>

                    <div className="group p-4 border rounded-xl bg-gradient-to-br from-card to-muted/20 hover:from-primary/5 hover:to-primary/10 transition-all duration-200 hover:border-primary/20">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                          </svg>
                        </div>
                        <span className="text-xs bg-secondary/80 text-secondary-foreground px-2 py-1 rounded-full">
                          Coming Soon
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">
                        DynamoDB
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Monitor your NoSQL databases and tables
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-foreground">
                        Connected
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Successfully authenticated with AWS Cognito. More service
                      integrations will be added soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Information Sidebar */}
            <div className="xl:col-span-1">
              <Card className="h-fit">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <span>Account</span>
                  </CardTitle>
                  <CardDescription>Your session information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Email
                      </label>
                      <p className="text-sm text-foreground mt-1 break-all">
                        {user?.email || "Not available"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Name
                      </label>
                      <p className="text-sm text-foreground mt-1">
                        {user?.name || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        User ID
                      </label>
                      <p className="text-xs text-foreground font-mono mt-1 break-all bg-muted/50 p-2 rounded">
                        {user?.id || "Not available"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
