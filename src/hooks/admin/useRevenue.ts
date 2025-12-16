import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api/admin-api";
import type { GetRevenueParams } from "@/types/revenue";

/**
 * Hook to fetch revenue statistics
 */
export function useRevenue(params: GetRevenueParams = {}) {
  return useQuery({
    queryKey: ["admin", "revenue", params],
    queryFn: async () => {
      const response = await adminAPI.getRevenue(params);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
