import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  // User information
  user?: {
    name?: string;
    email?: string;
  };

  // Navigation props
  onSignOut: () => void;
  onNavigateHome?: () => void; // For navigating back to dashboard

  // Page context props
  subtitle?: string; // Subtitle for service pages

  // Service-specific props (e.g., for EC2)
  selectedRegion?: string;
  onRegionChange?: (region: string) => void;
  showRegionSelector?: boolean;

  // Icon customization
  icon?: "main" | "ec2" | "s3" | "lambda" | "custom";
  customIconElement?: React.ReactNode;
}

/**
 * DashboardHeader Component
 *
 * Unified header/navbar component for all dashboard pages.
 * Supports different contexts like main dashboard, EC2, S3, etc.
 * Provides consistent branding, navigation, and user controls.
 */
export function DashboardHeader({
  user,
  onSignOut,
  onNavigateHome,
  subtitle,
  selectedRegion = "us-west-1",
  onRegionChange = () => {},
  icon = "main",
  customIconElement,
}: DashboardHeaderProps) {
  // Function to render service-specific icon (smaller, separate from main branding)
  const renderServiceIcon = () => {
    if (icon === "main") {
      return null; // No service icon for main dashboard
    }

    if (customIconElement) {
      return customIconElement;
    }

    const iconClasses = "w-3 h-3";

    switch (icon) {
      case "ec2":
        return (
          <div className="inline-flex items-center justify-center w-6 h-6 bg-orange-500/10 rounded-md">
            <svg
              className={`${iconClasses} text-orange-500`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 16V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM5 4h14v12H5V4zm2 6h2v4H7v-4zm4-2h2v6h-2V8zm4-2h2v8h-2V6z" />
            </svg>
          </div>
        );
      case "s3":
        return (
          <div className="inline-flex items-center justify-center w-6 h-6 bg-green-500/10 rounded-md">
            <svg
              className={`${iconClasses} text-green-500`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 16V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM5 4h14v12H5V4zm2 6h2v4H7v-4zm4-2h2v6h-2V8zm4-2h2v8h-2V6z" />
            </svg>
          </div>
        );
      case "lambda":
        return (
          <div className="inline-flex items-center justify-center w-6 h-6 bg-blue-500/10 rounded-md">
            <svg
              className={`${iconClasses} text-blue-500`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <header className="border-b bg-card flex-shrink-0">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left side: Navigation and Branding */}
        <div className="flex items-center space-x-3">
          {/* Clickable Nimbus logo and name */}
          <button
            onClick={onNavigateHome}
            className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
          >
            <div className="inline-flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <svg
                className="w-4 h-4 text-primary-foreground"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M13 3L4 14h7v7l9-11h-7V3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-foreground">
              Nimbus Console
            </h1>
          </button>

          {/* Service icon (if not main dashboard) */}
          {renderServiceIcon()}

          {/* Subtitle for service pages */}
          {subtitle && (
            <div className="text-xs text-muted-foreground border-l pl-3 ml-1">
              {subtitle}
            </div>
          )}
        </div>

        {/* Right side: Controls and User Info */}
        <div className="flex items-center space-x-4">
          {/* Region selector (for AWS services) */}
          {selectedRegion && onRegionChange && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => onRegionChange(e.target.value)}
                className="text-sm bg-background border border-border rounded-md px-2 py-1 text-foreground"
              >
                <option value="us-east-1">US East 1 (N. Virginia)</option>
                <option value="us-west-1">US West 1 (N. California)</option>
                <option value="us-west-2">US West 2 (Oregon)</option>
                <option value="eu-west-1">EU West 1 (Ireland)</option>
                <option value="ap-southeast-1">
                  AP Southeast 1 (Singapore)
                </option>
              </select>
            </div>
          )}

          {/* User greeting */}
          <span className="text-sm text-muted-foreground">
            {icon === "main"
              ? `Welcome, ${user?.name || user?.email || "User"}`
              : user?.name || user?.email || "User"}
          </span>

          {/* Sign out button */}
          <Button variant="outline" size="sm" onClick={onSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
