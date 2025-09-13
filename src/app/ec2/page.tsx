"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EC2Layout, EC2Instance } from "@/components/ec2";

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

  // Mock data - replace with actual AWS API calls
  const mockStats = {
    runningInstances: 3,
    stoppedInstances: 1,
    totalVCPUs: 8,
    monthlyCost: 127,
  };

  const mockInstances: EC2Instance[] = [
    {
      id: "i-0abc123def456789a",
      name: "web-server-01",
      instanceType: "t3.medium",
      state: "running",
      publicIp: "54.123.45.67",
      privateIp: "10.0.1.123",
    },
    {
      id: "i-0def456abc123789b",
      name: "api-server-01",
      instanceType: "t3.large",
      state: "running",
      publicIp: "54.234.56.78",
      privateIp: "10.0.1.124",
    },
    {
      id: "i-0ghi789jkl012345c",
      name: "database-backup",
      instanceType: "t3.small",
      state: "stopped",
      privateIp: "10.0.1.125",
    },
  ];

  const mockResourceLimits = [
    {
      label: "Running Instances",
      current: 3,
      max: 20,
      color: "bg-blue-500",
    },
    {
      label: "vCPU Usage",
      current: 8,
      max: 50,
      color: "bg-green-500",
    },
    {
      label: "Elastic IPs",
      current: 2,
      max: 5,
      color: "bg-orange-500",
    },
  ];

  const mockRecentActivities = [
    {
      action: "Instance Started",
      target: "web-server-01",
      timestamp: "2 hours ago",
    },
    {
      action: "Instance Launched",
      target: "api-server-01",
      timestamp: "1 day ago",
    },
    {
      action: "Instance Stopped",
      target: "database-backup",
      timestamp: "3 days ago",
    },
  ];

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

  // Event handlers
  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleNavigateToDashboard = () => {
    router.push("/dashboard");
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    // TODO: Fetch instances for new region
  };

  const handleRefresh = () => {
    // TODO: Refresh instance data
    console.log("Refreshing instances...");
  };

  const handleLaunchInstance = () => {
    // TODO: Navigate to launch instance wizard
    console.log("Launching new instance...");
  };

  const handleInstanceAction = (instanceId: string, action: string) => {
    // TODO: Implement instance actions (start, stop, terminate, etc.)
    console.log(`Performing ${action} on instance ${instanceId}`);
  };

  const handleQuickAction = (action: string) => {
    // TODO: Implement quick actions
    console.log(`Performing quick action: ${action}`);
  };

  return (
    <EC2Layout
      selectedRegion={selectedRegion}
      onRegionChange={handleRegionChange}
      onNavigateToDashboard={handleNavigateToDashboard}
      onSignOut={handleSignOut}
      onRefresh={handleRefresh}
      onLaunchInstance={handleLaunchInstance}
      onInstanceAction={handleInstanceAction}
      onQuickAction={handleQuickAction}
      user={user || undefined}
      stats={mockStats}
      instances={mockInstances}
      resourceLimits={mockResourceLimits}
      recentActivities={mockRecentActivities}
    />
  );
}
