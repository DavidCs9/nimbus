import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResourceLimit {
  label: string;
  current: number;
  max: number;
  color: string;
}

interface RecentActivity {
  action: string;
  target: string;
  timestamp: string;
}

interface EC2SidebarProps {
  resourceLimits: ResourceLimit[];
  recentActivities: RecentActivity[];
  onQuickAction: (action: string) => void;
}

/**
 * EC2Sidebar Component
 *
 * Sidebar containing quick actions, resource limits, and recent activity.
 * Provides easy access to common EC2 operations and monitoring.
 */
export function EC2Sidebar({
  resourceLimits,
  recentActivities,
  onQuickAction,
}: EC2SidebarProps) {
  return (
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
            onClick={() => onQuickAction("launch")}
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
            onClick={() => onQuickAction("template")}
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
            onClick={() => onQuickAction("import-key")}
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

      {/* Resource Limits */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resource Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {resourceLimits.map((limit, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{limit.label}</span>
                <span className="text-foreground">
                  {limit.current}/{limit.max}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={`${limit.color} h-2 rounded-full`}
                  style={{
                    width: `${(limit.current / limit.max) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div key={index} className="text-sm">
              <p className="text-foreground font-medium">{activity.action}</p>
              <p className="text-muted-foreground">{activity.target}</p>
              <p className="text-xs text-muted-foreground">
                {activity.timestamp}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
