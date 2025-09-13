import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type EC2Instance } from "@/lib/types/ec2-types";

interface EC2InstanceListProps {
  instances: EC2Instance[];
  onInstanceAction: (instanceId: string, action: string) => void;
  isLoading?: boolean;
}

/**
 * EC2InstanceList Component
 *
 * Displays a list of EC2 instances with their details and available actions.
 * Includes filtering and sorting controls.
 */
export function EC2InstanceList({
  instances,
  onInstanceAction,
  isLoading = false,
}: EC2InstanceListProps) {
  const getStatusColor = (state: EC2Instance["state"]) => {
    switch (state) {
      case "running":
        return "bg-green-500";
      case "stopped":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      case "stopping":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusAnimation = (state: EC2Instance["state"]) => {
    return state === "running" ? "animate-pulse" : "";
  };

  const getInstanceActions = (state: EC2Instance["state"]) => {
    switch (state) {
      case "running":
        return [
          { label: "Connect", action: "connect" },
          { label: "Stop", action: "stop" },
          { label: "⋯", action: "menu" },
        ];
      case "stopped":
        return [
          { label: "Start", action: "start" },
          { label: "Terminate", action: "terminate" },
          { label: "⋯", action: "menu" },
        ];
      default:
        return [{ label: "⋯", action: "menu" }];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Instances</span>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              </svg>
              Filter
            </Button>
            <Button variant="ghost" size="sm">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
              </svg>
              Sort
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {instances.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="w-12 h-12 mx-auto text-muted-foreground mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
              />
            </svg>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No instances found
            </h3>
            <p className="text-muted-foreground">
              {isLoading
                ? "Loading instances..."
                : "No EC2 instances found in this region. Launch your first instance to get started."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {instances.map((instance) => (
              <div
                key={instance.id}
                className={`p-4 hover:bg-muted/50 transition-colors ${
                  instance.state === "stopped" ? "opacity-75" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(
                        instance.state
                      )} ${getStatusAnimation(instance.state)}`}
                    ></div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        {instance.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {instance.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {instance.instanceType}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {instance.state}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-muted-foreground">
                      Public IP: {instance.publicIp || "-"}
                    </span>
                    <span className="text-muted-foreground">
                      Private IP: {instance.privateIp}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getInstanceActions(instance.state).map((action, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        onClick={() =>
                          onInstanceAction(instance.id, action.action)
                        }
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
