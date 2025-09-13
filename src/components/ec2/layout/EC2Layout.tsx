import { Button } from "@/components/ui/button";
import { EC2Header } from "./EC2Header";
import { EC2StatsCards } from "../stats/EC2StatsCards";
import { EC2InstanceList, EC2Instance } from "../instances/EC2InstanceList";
import { EC2Sidebar } from "../sidebar/EC2Sidebar";

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
  stats: {
    runningInstances: number;
    stoppedInstances: number;
    totalVCPUs: number;
    monthlyCost: number;
  };
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
}: EC2LayoutProps) {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <EC2Header
        selectedRegion={selectedRegion}
        onRegionChange={onRegionChange}
        onNavigateToDashboard={onNavigateToDashboard}
        onSignOut={onSignOut}
        user={user}
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
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 12h16m-8-8l8 8-8 8" />
                </svg>
                Refresh
              </Button>
              <Button size="sm" onClick={onLaunchInstance}>
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
              <EC2StatsCards stats={stats} />
            </div>

            {/* Instance List */}
            <div className="xl:col-span-3">
              <EC2InstanceList
                instances={instances}
                onInstanceAction={onInstanceAction}
              />
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1">
              <EC2Sidebar
                resourceLimits={resourceLimits}
                recentActivities={recentActivities}
                onQuickAction={onQuickAction}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
