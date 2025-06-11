"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStoreEarnings,
  calculateStoreEarnings,
} from "@/lib/actions/storeEarningsActions";

export function useStoreEarnings(mongoUser) {
  const queryClient = useQueryClient();

  const {
    data: earningsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["storeEarnings", mongoUser?._id],
    queryFn: async () => {
      if (!mongoUser?._id) return null;

      try {
        const result = await getStoreEarnings();
        return result.error ? null : result;
      } catch (error) {
        console.error("Error fetching store earnings:", error);
        return null;
      }
    },
    enabled: Boolean(mongoUser?._id),
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for more frequent automatic refresh)
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes when component is mounted
  });

  const refreshEarnings = async () => {
    try {
      // Force recalculation
      const result = await calculateStoreEarnings();
      if (!result.error) {
        // Update the cache with new data
        queryClient.setQueryData(["storeEarnings", mongoUser?._id], result);
      }
      return result;
    } catch (error) {
      console.error("Error refreshing store earnings:", error);
      return { error: error.message };
    }
  };

  const invalidateEarnings = () => {
    queryClient.invalidateQueries(["storeEarnings", mongoUser?._id]);
  };

  return {
    earningsData,
    isLoading,
    error,
    refetch,
    refreshEarnings,
    invalidateEarnings,
  };
}
