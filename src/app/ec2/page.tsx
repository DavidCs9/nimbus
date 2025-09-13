"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * EC2 Management Page
 *
 * Interface for managing Amazon EC2 instances.
 * Allows users to view, monitor, and manage their virtual servers.
 */
export default function EC2Page() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState("us-east-1");

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
          <p className="text-muted-foreground">Loading EC2 Console...</p>
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

  const navigateToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b bg-card flex-shrink-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToDashboard}
              className="p-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </Button>
            <div className="inline-flex items-center justify-center w-8 h-8 bg-orange-500/10 rounded-lg">
              <svg
                className="w-4 h-4 text-orange-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 16V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM5 4h14v12H5V4zm2 6h2v4H7v-4zm4-2h2v6h-2V8zm4-2h2v8h-2V6z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">EC2</h1>
              <p className="text-xs text-muted-foreground">
                Amazon Elastic Compute Cloud
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="text-sm bg-background border border-border rounded-md px-2 py-1 text-foreground"
              >
                <option value="us-east-1">US East (N. Virginia)</option>
                <option value="us-west-2">US West (Oregon)</option>
                <option value="eu-west-1">Europe (Ireland)</option>
                <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
              </select>
            </div>
            <span className="text-sm text-muted-foreground">
              {user?.name || user?.email || "User"}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-6 overflow-auto">
        <div className="h-full max-w-7xl mx-auto">
          {/* Action Bar */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">
                EC2 Instances
              </h2>
              <p className="text-muted-foreground">
                Manage your virtual servers in the {selectedRegion} region
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 12h16m-8-8l8 8-8 8" />
                </svg>
                Refresh
              </Button>
              <Button size="sm">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Launch Instance
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Quick Stats */}
            <div className="xl:col-span-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Running Instances
                      </p>
                      <p className="text-2xl font-bold text-green-500">3</p>
                    </div>
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Stopped Instances
                      </p>
                      <p className="text-2xl font-bold text-red-500">1</p>
                    </div>
                    <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Total vCPUs
                      </p>
                      <p className="text-2xl font-bold text-blue-500">8</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Monthly Cost Est.
                      </p>
                      <p className="text-2xl font-bold text-purple-500">$127</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-purple-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Instance List */}
            <div className="xl:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Instances</span>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                        </svg>
                        Filter
                      </Button>
                      <Button variant="ghost" size="sm">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
                        </svg>
                        Sort
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {/* Instance Item */}
                    <div className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <div>
                            <h4 className="font-medium text-foreground">
                              web-server-01
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              i-0abc123def456789a
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            t3.medium
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Running
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-muted-foreground">
                            Public IP: 54.123.45.67
                          </span>
                          <span className="text-muted-foreground">
                            Private IP: 10.0.1.123
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            Connect
                          </Button>
                          <Button variant="ghost" size="sm">
                            Stop
                          </Button>
                          <Button variant="ghost" size="sm">
                            ⋯
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Another Instance */}
                    <div className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <div>
                            <h4 className="font-medium text-foreground">
                              api-server-01
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              i-0def456abc123789b
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            t3.large
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Running
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-muted-foreground">
                            Public IP: 54.234.56.78
                          </span>
                          <span className="text-muted-foreground">
                            Private IP: 10.0.1.124
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            Connect
                          </Button>
                          <Button variant="ghost" size="sm">
                            Stop
                          </Button>
                          <Button variant="ghost" size="sm">
                            ⋯
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Stopped Instance */}
                    <div className="p-4 hover:bg-muted/50 transition-colors opacity-75">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div>
                            <h4 className="font-medium text-foreground">
                              database-backup
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              i-0ghi789jkl012345c
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            t3.small
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Stopped
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-muted-foreground">
                            Public IP: -
                          </span>
                          <span className="text-muted-foreground">
                            Private IP: 10.0.1.125
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            Start
                          </Button>
                          <Button variant="ghost" size="sm">
                            Terminate
                          </Button>
                          <Button variant="ghost" size="sm">
                            ⋯
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1">
              <div className="space-y-4">
                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      Launch Instance
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
                      </svg>
                      Create Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 12v7H5v-7H3v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z" />
                      </svg>
                      Import Key Pair
                    </Button>
                  </CardContent>
                </Card>

                {/* Resource Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Resource Limits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">
                          Running Instances
                        </span>
                        <span className="text-foreground">3/20</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: "15%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">
                          vCPU Usage
                        </span>
                        <span className="text-foreground">8/50</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: "16%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">
                          Elastic IPs
                        </span>
                        <span className="text-foreground">2/5</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: "40%" }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <p className="text-foreground font-medium">
                        Instance Started
                      </p>
                      <p className="text-muted-foreground">web-server-01</p>
                      <p className="text-xs text-muted-foreground">
                        2 hours ago
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-foreground font-medium">
                        Instance Launched
                      </p>
                      <p className="text-muted-foreground">api-server-01</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-foreground font-medium">
                        Instance Stopped
                      </p>
                      <p className="text-muted-foreground">database-backup</p>
                      <p className="text-xs text-muted-foreground">
                        3 days ago
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
