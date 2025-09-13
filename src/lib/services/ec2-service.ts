/**
 * EC2 Service Layer for Nimbus Console
 *
 * Comprehensive AWS EC2 service implementation following OOP principles.
 * Handles all EC2 operations including instance management, monitoring, and error handling.
 */

import {
  EC2Client,
  DescribeInstancesCommand,
  StartInstancesCommand,
  StopInstancesCommand,
  RebootInstancesCommand,
  TerminateInstancesCommand,
  DescribeInstanceStatusCommand,
  CreateTagsCommand,
  DescribeRegionsCommand,
  type Instance,
} from "@aws-sdk/client-ec2";

import { awsConfigManager } from "@/lib/aws-config";
import {
  type EC2Instance,
  type EC2Stats,
  type EC2InstanceState,
  type EC2InstanceActionRequest,
  type EC2InstanceActionResponse,
  type EC2ServiceError,
  type EC2InstanceFilters,
  type EC2ServiceConfig,
  type EC2Region,
  type EC2TagRequest,
  type EC2InstanceStatus,
} from "@/lib/types/ec2-types";

/**
 * EC2 Service Class
 *
 * Provides comprehensive EC2 management functionality with proper error handling,
 * retry logic, and TypeScript type safety.
 */
export class EC2Service {
  private client: EC2Client;
  private config: EC2ServiceConfig;

  constructor(config?: Partial<EC2ServiceConfig>) {
    this.config = {
      region: config?.region || awsConfigManager.getEC2Config().region,
      maxRetries: config?.maxRetries || 3,
      timeout: config?.timeout || 30000,
      enableRetry: config?.enableRetry ?? true,
    };

    // Initialize EC2 client with configuration
    this.client = new EC2Client({
      ...awsConfigManager.getEC2ClientConfig(this.config.region),
      maxAttempts: this.config.maxRetries,
    });
  }

  /**
   * Updates the service configuration and reinitializes the client
   */
  public updateConfig(newConfig: Partial<EC2ServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.client = new EC2Client({
      ...awsConfigManager.getEC2ClientConfig(this.config.region),
      maxAttempts: this.config.maxRetries,
    });
  }

  /**
   * Fetches all EC2 instances with optional filtering
   */
  public async describeInstances(
    filters?: EC2InstanceFilters
  ): Promise<EC2Instance[]> {
    try {
      const command = new DescribeInstancesCommand({
        Filters: this.buildFilters(filters),
      });

      const response = await this.client.send(command);
      const instances: EC2Instance[] = [];

      if (response.Reservations) {
        for (const reservation of response.Reservations) {
          if (reservation.Instances) {
            for (const instance of reservation.Instances) {
              const transformedInstance = this.transformInstance(instance);
              if (transformedInstance) {
                instances.push(transformedInstance);
              }
            }
          }
        }
      }

      return instances;
    } catch (error) {
      throw this.handleError(error, "describeInstances");
    }
  }

  /**
   * Gets detailed status information for instances
   */
  public async getInstanceStatuses(
    instanceIds: string[]
  ): Promise<EC2InstanceStatus[]> {
    try {
      const command = new DescribeInstanceStatusCommand({
        InstanceIds: instanceIds,
        IncludeAllInstances: true,
      });

      const response = await this.client.send(command);
      const statuses: EC2InstanceStatus[] = [];

      if (response.InstanceStatuses) {
        for (const status of response.InstanceStatuses) {
          if (status.InstanceId && status.InstanceState?.Name) {
            statuses.push({
              instanceId: status.InstanceId,
              instanceState: status.InstanceState.Name as EC2InstanceState,
              systemStatus: status.SystemStatus?.Status || "not-applicable",
              instanceStatus: status.InstanceStatus?.Status || "not-applicable",
              statusChecks: {
                system: status.SystemStatus?.Status === "ok",
                instance: status.InstanceStatus?.Status === "ok",
              },
            });
          }
        }
      }

      return statuses;
    } catch (error) {
      throw this.handleError(error, "getInstanceStatuses");
    }
  }

  /**
   * Starts one or more stopped instances
   */
  public async startInstance(
    instanceId: string
  ): Promise<EC2InstanceActionResponse> {
    return this.performInstanceAction({
      instanceId,
      action: "start",
    });
  }

  /**
   * Stops one or more running instances
   */
  public async stopInstance(
    instanceId: string,
    force = false
  ): Promise<EC2InstanceActionResponse> {
    return this.performInstanceAction({
      instanceId,
      action: "stop",
      force,
    });
  }

  /**
   * Reboots one or more instances
   */
  public async rebootInstance(
    instanceId: string
  ): Promise<EC2InstanceActionResponse> {
    return this.performInstanceAction({
      instanceId,
      action: "reboot",
    });
  }

  /**
   * Terminates one or more instances
   */
  public async terminateInstance(
    instanceId: string
  ): Promise<EC2InstanceActionResponse> {
    return this.performInstanceAction({
      instanceId,
      action: "terminate",
    });
  }

  /**
   * Performs the specified action on an instance
   */
  private async performInstanceAction(
    request: EC2InstanceActionRequest
  ): Promise<EC2InstanceActionResponse> {
    try {
      // Get current state before action
      const instances = await this.describeInstances();
      const targetInstance = instances.find((i) => i.id === request.instanceId);
      const previousState = targetInstance?.state;

      let command;
      switch (request.action) {
        case "start":
          command = new StartInstancesCommand({
            InstanceIds: [request.instanceId],
          });
          break;
        case "stop":
          command = new StopInstancesCommand({
            InstanceIds: [request.instanceId],
            Force: request.force,
          });
          break;
        case "reboot":
          command = new RebootInstancesCommand({
            InstanceIds: [request.instanceId],
          });
          break;
        case "terminate":
          command = new TerminateInstancesCommand({
            InstanceIds: [request.instanceId],
          });
          break;
        default:
          throw new Error(`Unsupported action: ${request.action}`);
      }

      await this.client.send(command);

      // Get new state after action
      const updatedInstances = await this.describeInstances();
      const updatedInstance = updatedInstances.find(
        (i) => i.id === request.instanceId
      );
      const currentState = updatedInstance?.state;

      return {
        instanceId: request.instanceId,
        action: request.action,
        success: true,
        previousState,
        currentState,
        message: `Instance ${request.action} operation completed successfully`,
      };
    } catch (error) {
      return {
        instanceId: request.instanceId,
        action: request.action,
        success: false,
        error: this.handleError(
          error,
          `performInstanceAction:${request.action}`
        ).message,
      };
    }
  }

  /**
   * Creates or updates tags on instances
   */
  public async createTags(request: EC2TagRequest): Promise<void> {
    try {
      const tags = Object.entries(request.tags).map(([key, value]) => ({
        Key: key,
        Value: value,
      }));

      const command = new CreateTagsCommand({
        Resources: request.instanceIds,
        Tags: tags,
      });

      await this.client.send(command);
    } catch (error) {
      throw this.handleError(error, "createTags");
    }
  }

  /**
   * Gets aggregated statistics for EC2 instances
   */
  public async getInstanceStats(): Promise<EC2Stats> {
    try {
      const instances = await this.describeInstances();

      const stats: EC2Stats = {
        runningInstances: 0,
        stoppedInstances: 0,
        totalInstances: instances.length,
        totalVCPUs: 0,
        estimatedMonthlyCost: 0,
        instancesByType: {},
        instancesByRegion: {},
      };

      for (const instance of instances) {
        // Count by state
        if (instance.state === "running") {
          stats.runningInstances++;
        } else if (instance.state === "stopped") {
          stats.stoppedInstances++;
        }

        // Count by type
        stats.instancesByType[instance.instanceType] =
          (stats.instancesByType[instance.instanceType] || 0) + 1;

        // Count by region (using AZ to infer region)
        const region = instance.availabilityZone.slice(0, -1);
        stats.instancesByRegion[region] =
          (stats.instancesByRegion[region] || 0) + 1;

        // Estimate VCPUs and costs (simplified calculation)
        const vcpus = this.estimateVCPUs(instance.instanceType);
        stats.totalVCPUs += vcpus;

        if (instance.state === "running") {
          stats.estimatedMonthlyCost += this.estimateMonthlyCost(
            instance.instanceType
          );
        }
      }

      return stats;
    } catch (error) {
      throw this.handleError(error, "getInstanceStats");
    }
  }

  /**
   * Gets available AWS regions
   */
  public async getAvailableRegions(): Promise<EC2Region[]> {
    try {
      const command = new DescribeRegionsCommand({});
      const response = await this.client.send(command);

      const regions: EC2Region[] = [];
      if (response.Regions) {
        for (const region of response.Regions) {
          if (region.RegionName && region.Endpoint) {
            regions.push({
              regionName: region.RegionName,
              displayName: this.getRegionDisplayName(region.RegionName),
              endpoint: region.Endpoint,
              enabled: region.OptInStatus !== "not-opted-in",
            });
          }
        }
      }

      return regions.sort((a, b) => a.displayName.localeCompare(b.displayName));
    } catch (error) {
      throw this.handleError(error, "getAvailableRegions");
    }
  }

  /**
   * Transforms AWS Instance to our EC2Instance format
   */
  private transformInstance(instance: Instance): EC2Instance | null {
    if (!instance.InstanceId || !instance.State?.Name) {
      return null;
    }

    // Extract instance name from tags
    const nameTag = instance.Tags?.find((tag) => tag.Key === "Name");
    const name = nameTag?.Value || instance.InstanceId;

    // Build tags object
    const tags: Record<string, string> = {};
    if (instance.Tags) {
      for (const tag of instance.Tags) {
        if (tag.Key && tag.Value) {
          tags[tag.Key] = tag.Value;
        }
      }
    }

    // Extract security groups
    const securityGroups =
      instance.SecurityGroups?.map((sg) => sg.GroupName || sg.GroupId || "") ||
      [];

    return {
      id: instance.InstanceId,
      name,
      instanceType: instance.InstanceType || "unknown",
      state: instance.State.Name as EC2InstanceState,
      publicIp: instance.PublicIpAddress,
      privateIp: instance.PrivateIpAddress || "",
      availabilityZone: instance.Placement?.AvailabilityZone || "",
      securityGroups,
      keyName: instance.KeyName,
      launchTime: instance.LaunchTime || new Date(),
      tags,
      vpc: instance.VpcId
        ? {
            id: instance.VpcId,
            subnetId: instance.SubnetId || "",
          }
        : undefined,
    };
  }

  /**
   * Builds AWS filters from our filter options
   */
  private buildFilters(filters?: EC2InstanceFilters) {
    const awsFilters = [];

    if (filters?.states?.length) {
      awsFilters.push({
        Name: "instance-state-name",
        Values: filters.states,
      });
    }

    if (filters?.instanceTypes?.length) {
      awsFilters.push({
        Name: "instance-type",
        Values: filters.instanceTypes,
      });
    }

    if (filters?.vpcId) {
      awsFilters.push({
        Name: "vpc-id",
        Values: [filters.vpcId],
      });
    }

    if (filters?.availabilityZone) {
      awsFilters.push({
        Name: "availability-zone",
        Values: [filters.availabilityZone],
      });
    }

    if (filters?.tags) {
      for (const [key, value] of Object.entries(filters.tags)) {
        awsFilters.push({
          Name: `tag:${key}`,
          Values: [value],
        });
      }
    }

    return awsFilters;
  }

  /**
   * Estimates VCPUs for an instance type (simplified)
   */
  private estimateVCPUs(instanceType: string): number {
    // Simplified mapping - in production, use DescribeInstanceTypes API
    const vcpuMap: Record<string, number> = {
      "t2.nano": 1,
      "t2.micro": 1,
      "t2.small": 1,
      "t2.medium": 2,
      "t2.large": 2,
      "t3.nano": 2,
      "t3.micro": 2,
      "t3.small": 2,
      "t3.medium": 2,
      "t3.large": 2,
      "m5.large": 2,
      "m5.xlarge": 4,
      "m5.2xlarge": 8,
      "m5.4xlarge": 16,
      "c5.large": 2,
      "c5.xlarge": 4,
      "c5.2xlarge": 8,
      "c5.4xlarge": 16,
    };
    return vcpuMap[instanceType] || 2;
  }

  /**
   * Estimates monthly cost for an instance type (simplified)
   */
  private estimateMonthlyCost(instanceType: string): number {
    // Simplified pricing - in production, use AWS Pricing API
    const priceMap: Record<string, number> = {
      "t2.nano": 4.18,
      "t2.micro": 8.35,
      "t2.small": 16.7,
      "t2.medium": 33.41,
      "t2.large": 66.82,
      "t3.nano": 3.8,
      "t3.micro": 7.59,
      "t3.small": 15.18,
      "t3.medium": 30.37,
      "t3.large": 60.74,
      "m5.large": 69.35,
      "m5.xlarge": 138.7,
      "m5.2xlarge": 277.4,
      "m5.4xlarge": 554.8,
      "c5.large": 61.32,
      "c5.xlarge": 122.64,
      "c5.2xlarge": 245.28,
      "c5.4xlarge": 490.56,
    };
    return priceMap[instanceType] || 50; // Default estimate
  }

  /**
   * Gets user-friendly region display name
   */
  private getRegionDisplayName(regionName: string): string {
    const regionMap: Record<string, string> = {
      "us-east-1": "US East (N. Virginia)",
      "us-east-2": "US East (Ohio)",
      "us-west-1": "US West (N. California)",
      "us-west-2": "US West (Oregon)",
      "eu-west-1": "Europe (Ireland)",
      "eu-west-2": "Europe (London)",
      "eu-central-1": "Europe (Frankfurt)",
      "ap-southeast-1": "Asia Pacific (Singapore)",
      "ap-southeast-2": "Asia Pacific (Sydney)",
      "ap-northeast-1": "Asia Pacific (Tokyo)",
    };
    return regionMap[regionName] || regionName;
  }

  /**
   * Handles and transforms AWS errors into our error format
   */
  private handleError(error: unknown, operation: string): EC2ServiceError {
    const errorObj = error as {
      name?: string;
      message?: string;
      $metadata?: { httpStatusCode?: number };
    };

    const ec2Error: EC2ServiceError = {
      code: errorObj.name || "UnknownError",
      message: errorObj.message || "An unknown error occurred",
      retryable: false,
      statusCode: errorObj.$metadata?.httpStatusCode,
    };

    // Determine if error is retryable
    if (
      errorObj.name === "ThrottlingException" ||
      errorObj.name === "RequestLimitExceeded" ||
      errorObj.$metadata?.httpStatusCode === 429 ||
      errorObj.$metadata?.httpStatusCode === 503
    ) {
      ec2Error.retryable = true;
    }

    // Add operation context
    ec2Error.message = `${operation}: ${ec2Error.message}`;

    console.error(`EC2Service Error [${operation}]:`, {
      code: ec2Error.code,
      message: ec2Error.message,
      statusCode: ec2Error.statusCode,
      retryable: ec2Error.retryable,
    });

    return ec2Error;
  }
}

// Export singleton instance
export const ec2Service = new EC2Service();
