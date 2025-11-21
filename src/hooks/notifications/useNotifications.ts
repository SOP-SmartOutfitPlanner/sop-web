import { useMemo } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { notificationAPI } from "@/lib/api";
import type {
  Notification,
  NotificationsListResponse,
} from "@/lib/api";
import type {
  NotificationItem,
  FilterType,
} from "@/components/notifications/types";
import {
  mapNotificationType,
  getNotificationIcon,
} from "@/components/notifications/utils";
import { useUnreadCount } from "./useUnreadCount";

const PAGE_SIZE = 10;
const STALE_TIME_MS = 1000 * 60; // 1 minute

const getNotificationTypeParam = (filter: FilterType): number | undefined => {
  switch (filter) {
    case "system":
      return 0;
    case "user":
      return 1;
    default:
      return undefined;
  }
};

export function useNotifications(userId: string | undefined, filter: FilterType) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    refetch,
  } = useInfiniteQuery<NotificationsListResponse | null, Error>({
    queryKey: ["notifications", userId, filter],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (!userId) return null;

      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) {
        console.error("Invalid user ID:", userId);
        return null;
      }

      const typeParam = getNotificationTypeParam(filter);
      const response = await notificationAPI.getNotifications({
        userId: numericUserId,
        type: typeParam,
        page: pageParam as number,
        pageSize: PAGE_SIZE,
      });

      return response.data ?? null;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.metaData) return undefined;
      return lastPage.metaData.hasNext
        ? lastPage.metaData.currentPage + 1
        : undefined;
    },
    enabled: !!userId,
    staleTime: STALE_TIME_MS,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const notifications = useMemo<NotificationItem[]>(() => {
    const apiNotifications: Notification[] =
      data?.pages?.flatMap((page) => page?.data ?? []) ?? [];

    if (apiNotifications.length === 0) return [];

    // Deduplicate and sort by date
    const uniqueNotifications: Notification[] = Array.from(
      new Map(apiNotifications.map((notif) => [notif.id, notif])).values()
    ).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return uniqueNotifications.map(
      (notif: Notification): NotificationItem => ({
        id: notif.id,
        title: notif.title,
        description: notif.message,
        date: notif.createdAt,
        type: mapNotificationType(notif.type),
        read: notif.isRead,
        icon: getNotificationIcon(notif.type),
        href: notif.href || undefined,
        actorName: notif.actorDisplayName,
        actorAvatar: notif.actorAvatarUrl,
      })
    );
  }, [data]);

  const { data: unreadCountData } = useUnreadCount(userId, { poll: false });

  const unreadCount = useMemo(() => {
    if (unreadCountData !== null && unreadCountData !== undefined) {
      return unreadCountData;
    }
    return notifications.filter((n) => !n.read).length;
  }, [unreadCountData, notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (filter === "all") return true;
      if (filter === "unread") return !notification.read;
      return notification.type === filter;
    });
  }, [notifications, filter]);

  const filterCounts = useMemo(() => {
    const counts: Record<FilterType, number> = {
      all: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      system: 0,
      user: 0,
    };

    notifications.forEach((notification) => {
      const normalized = notification.type.toLowerCase();
      if (normalized === "system" || normalized === "user") {
        counts[normalized as "system" | "user"] += 1;
      }
    });

    return counts;
  }, [notifications]);

  return {
    notifications,
    filteredNotifications,
    filterCounts,
    unreadCount,
    isLoading,
    error,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    queryClient,
  };
}

