"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { EC2Layout, type EC2Instance, type EC2Stats } from "@/components/ec2";
import { ec2Service } from "@/lib/services/ec2-service";
import { authService } from "@/lib/auth-service";

/**
 * EC2 Management Page
 *
 * Interface for managing Amazon EC2 instances.
 * Allows users to view, monitor, and manage their virtual servers.
 */
export default function EC2Page() {
  const { user, isAuthenticated, isLoading, tokens, signOut } = useAuth();
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState("us-east-1");
  const [instances, setInstances] = useState<EC2Instance[]>([]);
  const [stats, setStats] = useState<EC2Stats>({
    runningInstances: 0,
    stoppedInstances: 0,
    totalInstances: 0,
    totalVCPUs: 0,
    estimatedMonthlyCost: 0,
    instancesByType: {},
    instancesByRegion: {},
  });
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch EC2 data from the service
  const fetchEC2Data = useCallback(async () => {
    if (!isAuthenticated || !tokens?.idToken) return;

    setIsLoadingData(true);
    setError(null);

    try {
      // Configure credentials for the EC2 service
      const credentialProvider = await authService.createCredentialProvider(
        tokens.idToken
      );
      ec2Service.setCredentials(credentialProvider);

      // Update service region if needed
      if (ec2Service["config"].region !== selectedRegion) {
        ec2Service.updateConfig({ region: selectedRegion });
      }

      // Fetch instances and stats in parallel
      const [instancesData, statsData] = await Promise.all([
        ec2Service.describeInstances(),
        ec2Service.getInstanceStats(),
      ]);

      setInstances(instancesData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch EC2 data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch EC2 data");
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated, selectedRegion, tokens?.idToken]);

  // Mock data for offline development (remove when service is fully integrated)
  const mockResourceLimits = [
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
  ];

  const mockRecentActivities = [
    {
      action: "Data Refreshed",
      target: "EC2 Service",
      timestamp: "Just now",
    },
  ];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch EC2 data when authenticated and region changes
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchEC2Data();
    }
  }, [isAuthenticated, isLoading, selectedRegion, fetchEC2Data]);

  // Show loading while checking authentication
  if (isLoading || isLoadingData) {
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
    fetchEC2Data();
  };

  const handleLaunchInstance = () => {
    // TODO: Navigate to launch instance wizard
    console.log("Launching new instance...");
  };

  const handleInstanceAction = async (instanceId: string, action: string) => {
    try {
      setIsLoadingData(true);

      switch (action) {
        case "start":
          await ec2Service.startInstance(instanceId);
          break;
        case "stop":
          await ec2Service.stopInstance(instanceId);
          break;
        case "reboot":
          await ec2Service.rebootInstance(instanceId);
          break;
        case "terminate":
          await ec2Service.terminateInstance(instanceId);
          break;
        default:
          console.log(`Performing ${action} on instance ${instanceId}`);
          return;
      }

      // Refresh data after action
      await fetchEC2Data();
    } catch (err) {
      console.error(`Failed to ${action} instance ${instanceId}:`, err);
      setError(
        err instanceof Error ? err.message : `Failed to ${action} instance`
      );
    } finally {
      setIsLoadingData(false);
    }
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
      stats={stats}
      instances={instances}
      resourceLimits={mockResourceLimits}
      recentActivities={mockRecentActivities}
      isLoading={isLoadingData}
      error={error}
    />
  );
}
