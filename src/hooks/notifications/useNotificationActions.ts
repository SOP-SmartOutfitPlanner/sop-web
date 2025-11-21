import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { InfiniteData, QueryKey } from "@tanstack/react-query";
import { notificationAPI } from "@/lib/api";
import type { NotificationsListResponse } from "@/lib/api";

type NotificationsQuerySnapshot = Array<
  [QueryKey, InfiniteData<NotificationsListResponse | null> | undefined]
>;

export function useNotificationActions(userId: string | undefined) {
  const queryClient = useQueryClient();
  const numericUserId = useMemo(() => {
    if (!userId) return undefined;
    const parsed = parseInt(userId, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, [userId]);

  const updateUnreadCache = useCallback(
    (updater: (prev: number) => number) => {
      if (!userId) return;
      queryClient.setQueryData<number>(
        ["notifications-unread-count", userId],
        (prev) => {
          const base = typeof prev === "number" ? prev : 0;
          const next = updater(base);
          return next < 0 ? 0 : next;
        }
      );
    },
    [queryClient, userId]
  );

  const setUnreadCache = useCallback(
    (value: number) => {
      if (!userId) return;
      queryClient.setQueryData<number>(
        ["notifications-unread-count", userId],
        Math.max(0, value)
      );
    },
    [queryClient, userId]
  );

  const applyNotificationUpdate = useCallback(
    (
      updater: (
        page: NotificationsListResponse | null
      ) => NotificationsListResponse | null
    ): NotificationsQuerySnapshot => {
      if (!userId) return [];

      const queries = queryClient.getQueriesData<
        InfiniteData<NotificationsListResponse | null>
      >({
        queryKey: ["notifications", userId],
      });

      const snapshots: NotificationsQuerySnapshot = queries.map(
        ([key, value]) => [key, value]
      );

      snapshots.forEach(([key, value]) => {
        if (!value) return;
        const updatedPages = value.pages.map((page) => updater(page));
        queryClient.setQueryData<
          InfiniteData<NotificationsListResponse | null>
        >(key, {
          ...value,
          pages: updatedPages,
        });
      });

      return snapshots;
    },
    [userId, queryClient]
  );

  const markAsRead = useCallback(
    async (id: number) => {
      const rollbackEntries = applyNotificationUpdate((page) => {
        if (!page) return page;
        let changed = false;
        const updatedData = page.data.map((notif) => {
          if (notif.id !== id || notif.isRead) return notif;
          changed = true;
          return {
            ...notif,
            isRead: true,
            readAt: notif.readAt ?? new Date().toISOString(),
          };
        });

        if (!changed) return page;

        return {
          ...page,
          data: updatedData,
        };
      });

      try {
        await notificationAPI.markAsRead(id);

        if (userId) {
          queryClient.invalidateQueries({
            queryKey: ["notifications", userId],
          });
          queryClient.invalidateQueries({
            queryKey: ["notification-detail", id],
          });
        }

        updateUnreadCache((prev) => prev - 1);
      } catch (error) {
        rollbackEntries.forEach(([key, value]) => {
          queryClient.setQueryData(key, value);
        });
        console.error("Failed to mark notification as read:", error);
        toast.error("Failed to mark notification as read", {
          description:
            error instanceof Error ? error.message : "Please try again",
        });
      }
    },
    [applyNotificationUpdate, queryClient, userId]
  );

  const markAllAsRead = useCallback(async () => {
    if (!numericUserId || !userId) return;

    const optimisticTimestamp = new Date().toISOString();
    const rollbackEntries = applyNotificationUpdate((page) => {
      if (!page) return page;
      let changed = false;
      const updatedData = page.data.map((notif) => {
        if (notif.isRead) return notif;
        changed = true;
        return {
          ...notif,
          isRead: true,
          readAt: notif.readAt ?? optimisticTimestamp,
        };
      });

      if (!changed) return page;

      return {
        ...page,
        data: updatedData,
      };
    });

    const toastId = toast.loading("Marking all notifications as read...");

    try {
      await notificationAPI.markAllAsRead(numericUserId);
      queryClient.invalidateQueries({
        queryKey: ["notifications", userId],
      });

      toast.success("All notifications marked as read", {
        id: toastId,
        duration: 2000,
      });

      setUnreadCache(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      rollbackEntries.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      toast.error("Failed to mark all notifications as read", {
        id: toastId,
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }
  }, [userId, queryClient, applyNotificationUpdate]);

  const deleteNotification = useCallback(
    async (id: number, options?: { unreadDelta?: number }) => {
      const rollbackEntries = applyNotificationUpdate((page) => {
        if (!page) return page;
        const filteredData = page.data.filter((notif) => notif.id !== id);
        if (filteredData.length === page.data.length) return page;

        return {
          ...page,
          data: filteredData,
          metaData: page.metaData
            ? {
                ...page.metaData,
                totalCount: Math.max(0, page.metaData.totalCount - 1),
              }
            : page.metaData,
        };
      });

      const toastId = toast.loading("Removing notification...");

      try {
        const response = await notificationAPI.deleteNotifications([id]);
        toast.success(
          response.message || "Notification removed successfully",
          {
            id: toastId,
            description:
              response.data?.deletedCount && response.data.requestedCount
                ? `${response.data.deletedCount}/${response.data.requestedCount} deleted`
                : undefined,
            duration: 2500,
          }
        );

        const unreadDelta = options?.unreadDelta ?? 0;
        if (unreadDelta !== 0) {
          updateUnreadCache((prev) => prev + unreadDelta);
        }

        return true;
      } catch (error) {
        rollbackEntries.forEach(([key, value]) => {
          queryClient.setQueryData(key, value);
        });
        toast.error("Failed to delete notification", {
          id: toastId,
          description:
            error instanceof Error ? error.message : "Please try again",
        });
        return false;
      }
    },
    [userId, queryClient, applyNotificationUpdate]
  );

  const deleteNotificationsBulk = useCallback(
    async (ids: number[], options?: { unreadDelta?: number }) => {
      if (ids.length === 0) return false;

      const idsSet = new Set(ids);
      const rollbackEntries = applyNotificationUpdate((page) => {
        if (!page) return page;
        const filteredData = page.data.filter((notif) => !idsSet.has(notif.id));
        if (filteredData.length === page.data.length) return page;

        return {
          ...page,
          data: filteredData,
          metaData: page.metaData
            ? {
                ...page.metaData,
                totalCount: Math.max(
                  0,
                  page.metaData.totalCount -
                    (page.data.length - filteredData.length)
                ),
              }
            : page.metaData,
        };
      });

      const toastId = toast.loading(
        `Deleting ${ids.length} notification${ids.length > 1 ? "s" : ""}...`
      );

      try {
        const response = await notificationAPI.deleteNotifications(ids);
        const deletedCount = response.data?.deletedCount ?? ids.length;
        toast.success(
          deletedCount === ids.length
            ? `Successfully deleted ${deletedCount} notification${
                deletedCount > 1 ? "s" : ""
              }`
            : `Deleted ${deletedCount} of ${ids.length} notification${
                ids.length > 1 ? "s" : ""
              }`,
          {
            id: toastId,
            duration: 3000,
            description:
              deletedCount < ids.length
                ? "Some notifications may have already been deleted"
                : undefined,
          }
        );

        const unreadDelta = options?.unreadDelta ?? 0;
        if (unreadDelta !== 0) {
          updateUnreadCache((prev) => prev + unreadDelta);
        }

        return true;
      } catch (error) {
        rollbackEntries.forEach(([key, value]) => {
          queryClient.setQueryData(key, value);
        });
        toast.error("Failed to delete notifications", {
          id: toastId,
          description:
            error instanceof Error ? error.message : "Please try again",
        });
        return false;
      }
    },
    [applyNotificationUpdate, queryClient, updateUnreadCache, userId]
  );

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteNotificationsBulk,
  };
}

