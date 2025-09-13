import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  // User information
  user?: {
    name?: string;
    email?: string;
  };

  // Navigation props
  onSignOut: () => void;
  onNavigateBack?: () => void; // For service pages like EC2

  // Page context props
  title?: string; // Page title (e.g., "Nimbus Console", "EC2")
  subtitle?: string; // Subtitle for service pages
  showBackButton?: boolean; // Whether to show back navigation

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
  onNavigateBack,
  title = "Nimbus Console",
  subtitle,
  showBackButton = false,
  selectedRegion,
  onRegionChange,
  showRegionSelector = false,
  icon = "main",
  customIconElement,
}: DashboardHeaderProps) {
  // Function to render the appropriate icon
  const renderIcon = () => {
    if (customIconElement) {
      return customIconElement;
    }

    const iconClasses = "w-4 h-4";

    switch (icon) {
      case "ec2":
        return (
          <div className="inline-flex items-center justify-center w-8 h-8 bg-orange-500/10 rounded-lg">
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
          <div className="inline-flex items-center justify-center w-8 h-8 bg-green-500/10 rounded-lg">
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
          <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-500/10 rounded-lg">
            <svg
              className={`${iconClasses} text-blue-500`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
          </div>
        );
      case "main":
      default:
        return (
          <div className="inline-flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <svg
              className={`${iconClasses} text-primary-foreground`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M13 3L4 14h7v7l9-11h-7V3z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <header className="border-b bg-card flex-shrink-0">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left side: Navigation and Branding */}
        <div className="flex items-center space-x-3">
          {/* Back button (for service pages) */}
          {showBackButton && onNavigateBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateBack}
              className="p-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </Button>
          )}

          {/* Icon */}
          {renderIcon()}

          {/* Title and subtitle */}
          <div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right side: Controls and User Info */}
        <div className="flex items-center space-x-4">
          {/* Region selector (for AWS services) */}
          {showRegionSelector && selectedRegion && onRegionChange && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => onRegionChange(e.target.value)}
                className="text-sm bg-background border border-border rounded-md px-2 py-1 text-foreground"
              >
                <option value="us-east-1">US East (N. Virginia)</option>
                <option value="us-west-1">US West (N. California)</option>
                <option value="us-west-2">US West (Oregon)</option>
                <option value="eu-west-1">Europe (Ireland)</option>
                <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
              </select>
            </div>
          )}

          {/* User greeting */}
          <span className="text-sm text-muted-foreground">
            {showBackButton
              ? user?.name || user?.email || "User"
              : `Welcome, ${user?.name || user?.email || "User"}`}
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
