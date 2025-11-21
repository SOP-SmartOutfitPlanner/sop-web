import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationAPI } from "@/lib/api";

interface UseUnreadCountOptions {
  poll?: boolean;
  intervalMs?: number;
}

export function useUnreadCount(
  userId?: string,
  options: UseUnreadCountOptions = {}
) {
  const { poll = false, intervalMs = 30_000 } = options;
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
    enabled: Boolean(numericUserId) && poll,
    initialData: cachedData,
    staleTime: 60_000,
    refetchInterval: poll ? intervalMs : false,
    refetchOnWindowFocus: poll,
    refetchOnReconnect: poll,
    refetchOnMount: poll,
  });
}


