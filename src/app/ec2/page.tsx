"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { EC2Layout } from "@/components/ec2";
import {
  useEC2Data,
  useStartInstance,
  useStopInstance,
  useRebootInstance,
  useTerminateInstance,
  useRefreshEC2Data,
} from "@/lib/hooks/useEC2Query";

/**
 * EC2 Management Page
 *
 * Interface for managing Amazon EC2 instances.
 * Allows users to view, monitor, and manage their virtual servers.
 * Now powered by TanStack Query for optimal performance and UX.
 */
export default function EC2Page() {
  const { user, isAuthenticated, isLoading, tokens, signOut } = useAuth();
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState("us-west-1");

  // TanStack Query hooks for EC2 data management
  const {
    instances: instancesQuery,
    stats: statsQuery,
    isLoading: isLoadingData,
    isError,
    error,
  } = useEC2Data(selectedRegion, tokens?.idToken);

  // Mutation hooks for EC2 operations with optimistic updates
  const startInstanceMutation = useStartInstance(selectedRegion);
  const stopInstanceMutation = useStopInstance(selectedRegion);
  const rebootInstanceMutation = useRebootInstance(selectedRegion);
  const terminateInstanceMutation = useTerminateInstance(selectedRegion);

  // Refresh utilities
  const { refresh: refreshEC2Data } = useRefreshEC2Data(selectedRegion);

  // Derived data with defaults (memoized for performance)
  const instances = useMemo(
    () => instancesQuery.data || [],
    [instancesQuery.data]
  );
  const stats = useMemo(
    () =>
      statsQuery.data || {
        runningInstances: 0,
        stoppedInstances: 0,
        totalInstances: 0,
        totalVCPUs: 0,
        estimatedMonthlyCost: 0,
        instancesByType: {},
        instancesByRegion: {},
      },
    [statsQuery.data]
  );

  // Error state (prioritize authentication errors)
  const errorMessage = useMemo(() => {
    if (isError && error) {
      return error instanceof Error
        ? error.message
        : "Failed to fetch EC2 data";
    }
    return null;
  }, [isError, error]);

  // Mock data for offline development (can be removed when fully integrated)
  const mockResourceLimits = useMemo(
    () => [
      {
        label: "Running Instances",
        current: stats.runningInstances,
        max: 20,
        color: "bg-blue-500",
      },
      {
        label: "vCPU Usage",
        current: stats.totalVCPUs,
        max: 50,
        color: "bg-green-500",
      },
      {
        label: "Elastic IPs",
        current: instances.filter((i) => i.publicIp).length,
        max: 5,
        color: "bg-orange-500",
      },
    ],
    [stats.runningInstances, stats.totalVCPUs, instances]
  );

  const mockRecentActivities = useMemo(
    () => [
      {
        action: "Data Refreshed",
        target: "EC2 Service",
        timestamp: "Just now",
      },
    ],
    []
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading only for authentication check (not for data loading)
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
  };

  const handleRefresh = () => {
    refreshEC2Data();
  };

  const handleLaunchInstance = () => {
    // TODO: Navigate to launch instance wizard
    console.log("Launching new instance...");
  };

  // Optimized instance action handlers using mutations
  const handleInstanceAction = async (instanceId: string, action: string) => {
    try {
      switch (action) {
        case "start":
          await startInstanceMutation.mutateAsync(instanceId);
          break;
        case "stop":
          await stopInstanceMutation.mutateAsync({ instanceId });
          break;
        case "reboot":
          await rebootInstanceMutation.mutateAsync(instanceId);
          break;
        case "terminate":
          await terminateInstanceMutation.mutateAsync(instanceId);
          break;
        default:
          console.log(`Performing ${action} on instance ${instanceId}`);
          return;
      }
    } catch (err) {
      console.error(`Failed to ${action} instance ${instanceId}:`, err);
      // Error handling is managed by the mutation hooks
    }
  };

  const handleQuickAction = (action: string) => {
    // TODO: Implement quick actions
    console.log(`Performing quick action: ${action}`);
  };

  // Determine loading state for individual operations
  const isPerformingAction =
    startInstanceMutation.isPending ||
    stopInstanceMutation.isPending ||
    rebootInstanceMutation.isPending ||
    terminateInstanceMutation.isPending;

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
      stats={stats}
      instances={instances}
      resourceLimits={mockResourceLimits}
      recentActivities={mockRecentActivities}
      isLoadingData={isLoadingData}
      isPerformingAction={isPerformingAction}
      error={errorMessage}
    />
  );
}
