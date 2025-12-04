import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationAPI } from "@/lib/api";

interface UseUnreadCountOptions {
  /** @deprecated Use enabled instead. Polling is no longer supported - count updates via push notifications */
  poll?: boolean;
  /** Enable fetching unread count. Defaults to true when userId is valid */
  enabled?: boolean;
}

export function useUnreadCount(
  userId?: string,
  options: UseUnreadCountOptions = {}
) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  const numericUserId = useMemo(() => {
    if (!userId) return undefined;
    const parsed = parseInt(userId, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, [userId]);

  const cachedData =
    userId !== undefined
      ? (queryClient.getQueryData<number>([
          "notifications-unread-count",
          userId,
        ]) ?? undefined)
      : undefined;

  return useQuery({
    queryKey: ["notifications-unread-count", userId],
    queryFn: async () => {
      if (!numericUserId) return null;
      const response = await notificationAPI.getUnreadCount(numericUserId);
      return response.data ?? 0;
    },
    enabled: Boolean(numericUserId) && enabled,
    initialData: cachedData,
    staleTime: Infinity, // Never stale - only invalidate on push notification
    refetchInterval: false, // No polling
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: cachedData === undefined, // Only fetch if no cached data
  });
}


