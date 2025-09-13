import { Card } from "@/components/ui/card";
import { type EC2Stats } from "@/lib/types/ec2-types";

interface EC2StatsCardsProps {
  stats: EC2Stats;
}

/**
 * EC2StatsCards Component
 *
 * Displays key metrics and statistics for EC2 instances in a grid of cards.
 * Shows running/stopped instances, vCPU usage, and cost estimates.
 */
export function EC2StatsCards({ stats }: EC2StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Running Instances
            </p>
            <p className="text-2xl font-bold text-green-500">
              {stats.runningInstances}
            </p>
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
            <p className="text-2xl font-bold text-red-500">
              {stats.stoppedInstances}
            </p>
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
            <p className="text-sm text-muted-foreground mb-1">Total vCPUs</p>
            <p className="text-2xl font-bold text-blue-500">
              {stats.totalVCPUs}
            </p>
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
            <p className="text-2xl font-bold text-purple-500">
              ${stats.estimatedMonthlyCost.toFixed(2)}
            </p>
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
  );
}
