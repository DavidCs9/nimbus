import { Button } from "@/components/ui/button";

interface EC2HeaderProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  onNavigateToDashboard: () => void;
  onSignOut: () => void;
  user?: {
    name?: string;
    email?: string;
  };
}

/**
 * EC2Header Component
 *
 * Header section for the EC2 console containing navigation, branding,
 * region selector, and user controls.
 */
export function EC2Header({
  selectedRegion,
  onRegionChange,
  onNavigateToDashboard,
  onSignOut,
  user,
}: EC2HeaderProps) {
  return (
    <header className="border-b bg-card flex-shrink-0">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToDashboard}
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
              onChange={(e) => onRegionChange(e.target.value)}
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
          <Button variant="outline" size="sm" onClick={onSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
