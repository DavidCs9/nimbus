/**
 * EC2 Query Hooks for TanStack Query
 *
 * Optimized React Query hooks for EC2 data management with:
 * - Intelligent caching and background refetching
 * - Optimistic updates for instant UI feedback
 * - Error handling and retry logic
 * - Type-safe interfaces
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { ec2Service } from "@/lib/services/ec2-service";
import { authService } from "@/lib/auth-service";
import type {
  EC2Instance,
  EC2Stats,
  EC2Region,
  EC2InstanceFilters,
  EC2InstanceActionResponse,
} from "@/lib/types/ec2-types";

// Query key factory for consistent key management
export const ec2QueryKeys = {
  all: ["ec2"] as const,
  instances: (region: string, filters?: EC2InstanceFilters) =>
    ["ec2", "instances", region, filters] as const,
  stats: (region: string) => ["ec2", "stats", region] as const,
  regions: () => ["ec2", "regions"] as const,
  instanceStatus: (instanceIds: string[]) =>
    ["ec2", "instance-status", instanceIds] as const,
} as const;

/**
 * Hook to setup EC2 service with current credentials and region
 */
function useEC2ServiceSetup(region: string, idToken?: string) {
  return useQuery({
    queryKey: ["ec2", "service-setup", region, !!idToken],
    queryFn: async () => {
      if (!idToken) throw new Error("No authentication token available");

      const credentialProvider = await authService.createCredentialProvider(
        idToken
      );
      ec2Service.setCredentials(credentialProvider);

      if (ec2Service["config"].region !== region) {
        ec2Service.updateConfig({ region });
      }

      return { region, configured: true };
    },
    enabled: !!idToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: false, // Don't retry auth setup
  });
}

/**
 * Hook to fetch EC2 instances with intelligent caching
 */
export function useEC2Instances(
  region: string,
  idToken?: string,
  filters?: EC2InstanceFilters
) {
  // Setup service first
  const serviceSetup = useEC2ServiceSetup(region, idToken);

  return useQuery({
    queryKey: ec2QueryKeys.instances(region, filters),
    queryFn: async (): Promise<EC2Instance[]> => {
      return await ec2Service.describeInstances(filters);
    },
    enabled: !!idToken && serviceSetup.isSuccess,
    staleTime: 1000 * 30, // 30 seconds - instances change frequently
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60, // Refetch every minute for real-time updates
    refetchIntervalInBackground: true,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    select: (data) => {
      // Sort instances by name for consistent UI
      return data.sort((a, b) => {
        const nameA = a.name || a.id;
        const nameB = b.name || b.id;
        return nameA.localeCompare(nameB);
      });
    },
  });
}

/**
 * Hook to fetch EC2 statistics with optimized caching
 */
export function useEC2Stats(
  region: string,
  idToken?: string,
  instances?: EC2Instance[]
) {
  // Setup service first
  const serviceSetup = useEC2ServiceSetup(region, idToken);

  return useQuery({
    queryKey: ec2QueryKeys.stats(region),
    queryFn: async (): Promise<EC2Stats> => {
      // Use provided instances if available, otherwise fetch fresh data
      if (instances) {
        return ec2Service.calculateStatsFromInstances(instances);
      }
      return await ec2Service.getInstanceStats();
    },
    enabled: !!idToken && serviceSetup.isSuccess,
    staleTime: 1000 * 60, // 1 minute - stats derived from instances
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
    refetchIntervalInBackground: true,
  });
}

/**
 * Hook to fetch available AWS regions (cached globally)
 */
export function useEC2Regions(idToken?: string) {
  // Setup service first (use default region for regions query)
  const serviceSetup = useEC2ServiceSetup("us-east-1", idToken);

  return useQuery({
    queryKey: ec2QueryKeys.regions(),
    queryFn: async (): Promise<EC2Region[]> => {
      return await ec2Service.getAvailableRegions();
    },
    enabled: !!idToken && serviceSetup.isSuccess,
    staleTime: 1000 * 60 * 60, // 1 hour - regions rarely change
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * Combined hook to fetch both instances and stats efficiently
 */
export function useEC2Data(
  region: string,
  idToken?: string,
  filters?: EC2InstanceFilters
) {
  // Setup service first
  const serviceSetup = useEC2ServiceSetup(region, idToken);

  // Fetch instances
  const instancesQuery = useQuery({
    queryKey: ec2QueryKeys.instances(region, filters),
    queryFn: async (): Promise<EC2Instance[]> => {
      return await ec2Service.describeInstances(filters);
    },
    enabled: !!idToken && serviceSetup.isSuccess,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60,
    refetchIntervalInBackground: true,
    select: (data: EC2Instance[]) => {
      return data.sort((a, b) => {
        const nameA = a.name || a.id;
        const nameB = b.name || b.id;
        return nameA.localeCompare(nameB);
      });
    },
  });

  // Calculate stats from instances data using useMemo for automatic reactivity
  const stats = useMemo(() => {
    if (!instancesQuery.data) {
      return {
        runningInstances: 0,
        stoppedInstances: 0,
        totalInstances: 0,
        totalVCPUs: 0,
        estimatedMonthlyCost: 0,
        instancesByType: {},
        instancesByRegion: {},
      };
    }
    return ec2Service.calculateStatsFromInstances(instancesQuery.data);
  }, [instancesQuery.data]);

  // Create a mock stats query object to maintain API compatibility
  const statsQuery = {
    data: stats,
    isLoading: instancesQuery.isLoading,
    isError: instancesQuery.isError,
    error: instancesQuery.error,
    refetch: instancesQuery.refetch,
    isSuccess: instancesQuery.isSuccess,
    isFetching: instancesQuery.isFetching,
  };

  return {
    instances: instancesQuery,
    stats: statsQuery,
    isLoading: serviceSetup.isLoading || instancesQuery.isLoading,
    isError: serviceSetup.isError || instancesQuery.isError,
    error: serviceSetup.error || instancesQuery.error,
    refetch: () => {
      instancesQuery.refetch();
      // Stats will automatically update via useMemo when instances change
    },
  };
}

/**
 * Hook for EC2 instance status with real-time updates
 */
export function useEC2InstanceStatus(
  instanceIds: string[],
  region: string,
  idToken?: string
) {
  // Setup service first
  const serviceSetup = useEC2ServiceSetup(region, idToken);

  return useQuery({
    queryKey: ec2QueryKeys.instanceStatus(instanceIds),
    queryFn: async () => {
      if (instanceIds.length === 0) return [];
      return await ec2Service.getInstanceStatuses(instanceIds);
    },
    enabled: !!idToken && serviceSetup.isSuccess && instanceIds.length > 0,
    staleTime: 1000 * 15, // 15 seconds - status changes quickly
    gcTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 30, // Every 30 seconds for real-time status
    refetchIntervalInBackground: true,
  });
}

/**
 * Mutation hook for starting EC2 instances with optimistic updates
 */
export function useStartInstance(region: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      instanceId: string
    ): Promise<EC2InstanceActionResponse> => {
      return await ec2Service.startInstance(instanceId);
    },
    onMutate: async (instanceId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ec2QueryKeys.instances(region),
      });

      // Snapshot previous value
      const previousInstances = queryClient.getQueryData<EC2Instance[]>(
        ec2QueryKeys.instances(region)
      );

      // Optimistically update instance state
      if (previousInstances) {
        const optimisticInstances = previousInstances.map((instance) =>
          instance.id === instanceId
            ? { ...instance, state: "pending" as const }
            : instance
        );
        queryClient.setQueryData(
          ec2QueryKeys.instances(region),
          optimisticInstances
        );
        // Stats will automatically update via useMemo in useEC2Data
      }

      return { previousInstances };
    },
    onError: (err, instanceId, context) => {
      // Rollback on error
      if (context?.previousInstances) {
        queryClient.setQueryData(
          ec2QueryKeys.instances(region),
          context.previousInstances
        );
      }
    },
    onSuccess: (data, instanceId) => {
      // Update with actual response data
      const instances = queryClient.getQueryData<EC2Instance[]>(
        ec2QueryKeys.instances(region)
      );

      if (instances && data.success) {
        const updatedInstances = instances.map((instance) =>
          instance.id === instanceId
            ? { ...instance, state: data.currentState || "running" }
            : instance
        );
        queryClient.setQueryData(
          ec2QueryKeys.instances(region),
          updatedInstances
        );
        // Stats will automatically update via useMemo in useEC2Data
      }
    },
    onSettled: () => {
      // Always refetch to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: ec2QueryKeys.instances(region),
      });
      // No need to invalidate stats separately - they're calculated from instances
    },
  });
}

/**
 * Mutation hook for stopping EC2 instances with optimistic updates
 */
export function useStopInstance(region: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      instanceId,
      force = false,
    }: {
      instanceId: string;
      force?: boolean;
    }): Promise<EC2InstanceActionResponse> => {
      return await ec2Service.stopInstance(instanceId, force);
    },
    onMutate: async ({ instanceId }) => {
      await queryClient.cancelQueries({
        queryKey: ec2QueryKeys.instances(region),
      });

      const previousInstances = queryClient.getQueryData<EC2Instance[]>(
        ec2QueryKeys.instances(region)
      );

      if (previousInstances) {
        const optimisticInstances = previousInstances.map((instance) =>
          instance.id === instanceId
            ? { ...instance, state: "stopping" as const }
            : instance
        );
        queryClient.setQueryData(
          ec2QueryKeys.instances(region),
          optimisticInstances
        );
        // Stats will automatically update via useMemo in useEC2Data
      }

      return { previousInstances };
    },
    onError: (err, variables, context) => {
      if (context?.previousInstances) {
        queryClient.setQueryData(
          ec2QueryKeys.instances(region),
          context.previousInstances
        );
      }
    },
    onSuccess: (data, { instanceId }) => {
      const instances = queryClient.getQueryData<EC2Instance[]>(
        ec2QueryKeys.instances(region)
      );

      if (instances && data.success) {
        const updatedInstances = instances.map((instance) =>
          instance.id === instanceId
            ? { ...instance, state: data.currentState || "stopped" }
            : instance
        );
        queryClient.setQueryData(
          ec2QueryKeys.instances(region),
          updatedInstances
        );
        // Stats will automatically update via useMemo in useEC2Data
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ec2QueryKeys.instances(region),
      });
      // No need to invalidate stats separately - they're calculated from instances
    },
  });
}

/**
 * Mutation hook for rebooting EC2 instances with optimistic updates
 */
export function useRebootInstance(region: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      instanceId: string
    ): Promise<EC2InstanceActionResponse> => {
      return await ec2Service.rebootInstance(instanceId);
    },
    onMutate: async (instanceId) => {
      await queryClient.cancelQueries({
        queryKey: ec2QueryKeys.instances(region),
      });

      const previousInstances = queryClient.getQueryData<EC2Instance[]>(
        ec2QueryKeys.instances(region)
      );

      if (previousInstances) {
        const optimisticInstances = previousInstances.map((instance) =>
          instance.id === instanceId
            ? { ...instance, state: "pending" as const }
            : instance
        );
        queryClient.setQueryData(
          ec2QueryKeys.instances(region),
          optimisticInstances
        );
        // Stats will automatically update via useMemo in useEC2Data
      }

      return { previousInstances };
    },
    onError: (err, instanceId, context) => {
      if (context?.previousInstances) {
        queryClient.setQueryData(
          ec2QueryKeys.instances(region),
          context.previousInstances
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ec2QueryKeys.instances(region),
      });
      // No need to invalidate stats separately - they're calculated from instances
    },
  });
}

/**
 * Mutation hook for terminating EC2 instances with optimistic updates
 */
export function useTerminateInstance(region: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      instanceId: string
    ): Promise<EC2InstanceActionResponse> => {
      return await ec2Service.terminateInstance(instanceId);
    },
    onMutate: async (instanceId) => {
      await queryClient.cancelQueries({
        queryKey: ec2QueryKeys.instances(region),
      });

      const previousInstances = queryClient.getQueryData<EC2Instance[]>(
        ec2QueryKeys.instances(region)
      );

      if (previousInstances) {
        const optimisticInstances = previousInstances.map((instance) =>
          instance.id === instanceId
            ? { ...instance, state: "shutting-down" as const }
            : instance
        );
        queryClient.setQueryData(
          ec2QueryKeys.instances(region),
          optimisticInstances
        );
        // Stats will automatically update via useMemo in useEC2Data
      }

      return { previousInstances };
    },
    onError: (err, instanceId, context) => {
      if (context?.previousInstances) {
        queryClient.setQueryData(
          ec2QueryKeys.instances(region),
          context.previousInstances
        );
      }
    },
    onSuccess: (data, instanceId) => {
      const instances = queryClient.getQueryData<EC2Instance[]>(
        ec2QueryKeys.instances(region)
      );

      if (instances && data.success) {
        const updatedInstances = instances.map((instance) =>
          instance.id === instanceId
            ? { ...instance, state: data.currentState || "terminated" }
            : instance
        );
        queryClient.setQueryData(
          ec2QueryKeys.instances(region),
          updatedInstances
        );
        // Stats will automatically update via useMemo in useEC2Data
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ec2QueryKeys.instances(region),
      });
      // No need to invalidate stats separately - they're calculated from instances
    },
  });
}

/**
 * Hook to refetch all EC2 data for a region
 */
export function useRefreshEC2Data(region: string) {
  const queryClient = useQueryClient();

  return {
    refresh: () => {
      queryClient.invalidateQueries({
        queryKey: ec2QueryKeys.instances(region),
      });
      // Stats will automatically update when instances refresh
    },
    refreshInstances: () => {
      queryClient.invalidateQueries({
        queryKey: ec2QueryKeys.instances(region),
      });
    },
    refreshStats: () => {
      // Since stats are calculated from instances, just refresh instances
      queryClient.invalidateQueries({
        queryKey: ec2QueryKeys.instances(region),
      });
    },
  };
}
