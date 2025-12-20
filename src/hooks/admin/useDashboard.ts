import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api/admin-api";
import {
  Overview,
  UserGrowth,
  ItemByCategory,
  WeeklyActivity,
} from "@/types/dashboard";

// Query keys for dashboard
export const dashboardKeys = {
  all: ["admin-dashboard"] as const,
  overview: () => [...dashboardKeys.all, "overview"] as const,
  userGrowth: () => [...dashboardKeys.all, "user-growth"] as const,
  itemsByCategory: () => [...dashboardKeys.all, "items-by-category"] as const,
  weeklyActivity: () => [...dashboardKeys.all, "weekly-activity"] as const,
};

/**
 * Hook to fetch dashboard overview stats
 */
export function useOverview() {
  return useQuery<Overview>({
    queryKey: dashboardKeys.overview(),
    queryFn: async () => {
      const response = await adminAPI.overView();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch user growth data
 */
export function useUserGrowth(year?: string) {
  return useQuery<UserGrowth[]>({
    queryKey: [...dashboardKeys.userGrowth(), year],
    queryFn: async () => {
      const response = await adminAPI.userGrowth(year);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!year, // Only fetch when year is provided
  });
}

/**
 * Hook to fetch items by category data
 */
export function useItemsByCategory() {
  return useQuery<ItemByCategory[]>({
    queryKey: dashboardKeys.itemsByCategory(),
    queryFn: async () => {
      const response = await adminAPI.ItemByCategory();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch weekly activity data
 */
export function useWeeklyActivity() {
  return useQuery<WeeklyActivity[]>({
    queryKey: dashboardKeys.weeklyActivity(),
    queryFn: async () => {
      const response = await adminAPI.WeeklyActivity();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Combined hook to fetch all dashboard data (except userGrowth which needs year param)
 */
export function useDashboard() {
  const overview = useOverview();
  const itemsByCategory = useItemsByCategory();
  const weeklyActivity = useWeeklyActivity();

  return {
    overview,
    itemsByCategory,
    weeklyActivity,
    isLoading:
      overview.isLoading ||
      itemsByCategory.isLoading ||
      weeklyActivity.isLoading,
    isError:
      overview.isError ||
      itemsByCategory.isError ||
      weeklyActivity.isError,
  };
}
