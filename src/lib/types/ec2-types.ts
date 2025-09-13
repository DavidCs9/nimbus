/**
 * EC2 TypeScript Definitions for Nimbus Console
 *
 * Comprehensive type definitions for EC2 instances, operations, and AWS responses.
 * These types ensure type safety throughout the EC2 service layer.
 */

// AWS SDK EC2 types re-exports
export type {
  Instance,
  InstanceState,
  _InstanceType as InstanceType,
  Tag,
  SecurityGroup,
  Placement,
} from "@aws-sdk/client-ec2";

/**
 * EC2 Instance State Types
 */
export type EC2InstanceState =
  | "pending"
  | "running"
  | "shutting-down"
  | "terminated"
  | "stopping"
  | "stopped";

/**
 * EC2 Instance Status for Health Checks
 */
export interface EC2InstanceStatus {
  instanceId: string;
  instanceState: EC2InstanceState;
  systemStatus: string;
  instanceStatus: string;
  statusChecks: {
    system: boolean;
    instance: boolean;
  };
}

/**
 * Simplified EC2 Instance representation for UI components
 */
export interface EC2Instance {
  id: string;
  name: string;
  instanceType: string;
  state: EC2InstanceState;
  publicIp?: string;
  privateIp: string;
  availabilityZone: string;
  securityGroups: string[];
  keyName?: string;
  launchTime: Date;
  tags: Record<string, string>;
  vpc?: {
    id: string;
    subnetId: string;
  };
}

/**
 * EC2 Dashboard Statistics
 */
export interface EC2Stats {
  runningInstances: number;
  stoppedInstances: number;
  totalInstances: number;
  totalVCPUs: number;
  estimatedMonthlyCost: number;
  instancesByType: Record<string, number>;
  instancesByRegion: Record<string, number>;
}

/**
 * EC2 Instance Action Types
 */
export type EC2InstanceAction = "start" | "stop" | "reboot" | "terminate";

/**
 * EC2 Instance Action Request
 */
export interface EC2InstanceActionRequest {
  instanceId: string;
  action: EC2InstanceAction;
  force?: boolean; // For terminate action
}

/**
 * EC2 Instance Action Response
 */
export interface EC2InstanceActionResponse {
  instanceId: string;
  action: EC2InstanceAction;
  success: boolean;
  previousState?: EC2InstanceState;
  currentState?: EC2InstanceState;
  message?: string;
  error?: string;
}

/**
 * EC2 Region Information
 */
export interface EC2Region {
  regionName: string;
  displayName: string;
  endpoint: string;
  enabled: boolean;
}

/**
 * EC2 Service Error Types
 */
export interface EC2ServiceError {
  code: string;
  message: string;
  instanceId?: string;
  action?: EC2InstanceAction;
  retryable: boolean;
  statusCode?: number;
}

/**
 * EC2 Instance Filter Options for API calls
 */
export interface EC2InstanceFilters {
  states?: EC2InstanceState[];
  instanceTypes?: string[];
  tags?: Record<string, string>;
  vpcId?: string;
  availabilityZone?: string;
}

/**
 * EC2 Service Configuration
 */
export interface EC2ServiceConfig {
  region: string;
  maxRetries?: number;
  timeout?: number;
  enableRetry?: boolean;
}

/**
 * EC2 Pagination Options
 */
export interface EC2PaginationOptions {
  maxResults?: number;
  nextToken?: string;
}

/**
 * EC2 Instance List Response with Pagination
 */
export interface EC2InstanceListResponse {
  instances: EC2Instance[];
  nextToken?: string;
  totalCount?: number;
}

/**
 * EC2 Instance Type Definition
 */
export interface EC2InstanceTypeInfo {
  instanceType: string;
  vcpus: number;
  memory: number; // in GiB
  storage?: {
    size: number; // in GB
    type: "ebs" | "instance-store";
  };
  network: {
    performance: string;
    baseline: number; // Gbps
    burst?: number; // Gbps
  };
  pricePerHour?: number; // USD
}

/**
 * EC2 Tag management
 */
export interface EC2TagRequest {
  instanceIds: string[];
  tags: Record<string, string>;
}

/**
 * Hook-specific types for React components
 */
export interface UseEC2InstancesOptions {
  region?: string;
  filters?: EC2InstanceFilters;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export interface UseEC2InstancesResult {
  instances: EC2Instance[];
  isLoading: boolean;
  error: EC2ServiceError | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export interface UseEC2StatsResult {
  stats: EC2Stats | null;
  isLoading: boolean;
  error: EC2ServiceError | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

/**
 * EC2 Instance Creation Parameters (for future expansion)
 */
export interface EC2LaunchInstanceRequest {
  imageId: string;
  instanceType: string;
  keyName?: string;
  securityGroups?: string[];
  subnetId?: string;
  userData?: string;
  tags?: Record<string, string>;
  minCount?: number;
  maxCount?: number;
}
