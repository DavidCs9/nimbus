import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { EC2StatsCards } from "../stats/EC2StatsCards";
import { EC2InstanceList } from "../instances/EC2InstanceList";
import { EC2Sidebar } from "../sidebar/EC2Sidebar";
import {
  EC2StatsCardsSkeleton,
  EC2InstanceListSkeleton,
  EC2SidebarSkeleton,
} from "../skeletons/EC2Skeletons";
import { type EC2Instance, type EC2Stats } from "@/lib/types/ec2-types";

interface EC2LayoutProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  onNavigateToDashboard: () => void;
  onSignOut: () => void;
  onRefresh: () => void;
  onLaunchInstance: () => void;
  onInstanceAction: (instanceId: string, action: string) => void;
  onQuickAction: (action: string) => void;
  user?: {
    name?: string;
    email?: string;
  };
  stats: EC2Stats;
  instances: EC2Instance[];
  resourceLimits: Array<{
    label: string;
    current: number;
    max: number;
    color: string;
  }>;
  recentActivities: Array<{
    action: string;
    target: string;
    timestamp: string;
  }>;
  isLoadingData?: boolean;
  isPerformingAction?: boolean;
  error?: string | null;
}

/**
 * EC2Layout Component
 *
 * Main layout component that orchestrates all EC2 page sections.
 * Provides the overall structure and delegates functionality to child components.
 */
export function EC2Layout({
  selectedRegion,
  onRegionChange,
  onNavigateToDashboard,
  onSignOut,
  onRefresh,
  onLaunchInstance,
  onInstanceAction,
  onQuickAction,
  user,
  stats,
  instances,
  resourceLimits,
  recentActivities,
  isLoadingData = false,
  isPerformingAction = false,
  error = null,
}: EC2LayoutProps) {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <DashboardHeader
        user={user}
        onSignOut={onSignOut}
        onNavigateHome={onNavigateToDashboard}
        subtitle="Amazon Elastic Compute Cloud"
        selectedRegion={selectedRegion}
        onRegionChange={onRegionChange}
        showRegionSelector={true}
        icon="ec2"
      />

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
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoadingData}
              >
                <svg
                  className={`w-4 h-4 mr-2 ${
                    isLoadingData ? "animate-spin" : ""
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 12h16m-8-8l8 8-8 8" />
                </svg>
                {isLoadingData ? "Loading..." : "Refresh"}
              </Button>
              <Button
                size="sm"
                onClick={onLaunchInstance}
                disabled={isLoadingData}
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
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Error loading EC2 data
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Quick Stats */}
            <div className="xl:col-span-4">
              {isLoadingData && instances.length === 0 ? (
                <EC2StatsCardsSkeleton />
              ) : (
                <EC2StatsCards stats={stats} />
              )}
            </div>

            {/* Instance List */}
            <div className="xl:col-span-3">
              {isLoadingData && instances.length === 0 ? (
                <EC2InstanceListSkeleton count={5} />
              ) : (
                <EC2InstanceList
                  instances={instances}
                  onInstanceAction={onInstanceAction}
                  isLoading={isPerformingAction}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1">
              {isLoadingData && instances.length === 0 ? (
                <EC2SidebarSkeleton />
              ) : (
                <EC2Sidebar
                  resourceLimits={resourceLimits}
                  recentActivities={recentActivities}
                  onQuickAction={onQuickAction}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
