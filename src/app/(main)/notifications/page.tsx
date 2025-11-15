"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Settings } from "lucide-react";
import GlassButton from "@/components/ui/glass-button";
import NotificationCard from "@/components/notifications/NotificationCard";
import FilterBar from "@/components/notifications/FilterBar";
import LoadingState from "@/components/notifications/LoadingState";
import ErrorState from "@/components/notifications/ErrorState";
import EmptyState from "@/components/notifications/EmptyState";
import { NotificationDetailDialog } from "@/components/notifications/NotificationDetailDialog";
import { notificationAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { Notification, NotificationsListResponse } from "@/lib/api";
import type { ApiResponse } from "@/lib/types";
import type {
  NotificationItem,
  FilterType,
} from "@/components/notifications/types";
import {
  mapNotificationType,
  getNotificationIcon,
} from "@/components/notifications/utils";

// Constants
const PAGE_SIZE = 50;
const STALE_TIME_MS = 1000 * 60; // 1 minute

// Helper: Determine which notification types to fetch based on filter
const getNotificationTypes = (
  filter: FilterType
): { systemType?: number; userType?: number } => {
  if (filter === "system") {
    return { systemType: 0 };
  }
  if (filter === "social") {
    return { userType: 1 };
  }
  // For "all", "unread", and other filters, fetch both SYSTEM and USER
  return { systemType: 0, userType: 1 };
};

// Helper: Merge and sort notifications from multiple API responses
const mergeNotifications = (
  responses: ApiResponse<NotificationsListResponse>[]
): NotificationsListResponse => {
  const allNotifications: Notification[] = [];
  let totalCount = 0;

  responses.forEach((response) => {
    if (response.data?.data) {
      allNotifications.push(...response.data.data);
    }
    if (response.data?.metaData) {
      totalCount += response.data.metaData.totalCount;
    }
  });

  // Sort by createdAt (newest first)
  allNotifications.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return {
    data: allNotifications,
    metaData: {
      totalCount,
      pageSize: PAGE_SIZE,
      currentPage: 1,
      totalPages: Math.ceil(totalCount / PAGE_SIZE),
      hasNext: allNotifications.length >= PAGE_SIZE,
      hasPrevious: false,
    },
  };
};

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<FilterType>("all");
  const [localNotifications, setLocalNotifications] = useState<
    NotificationItem[]
  >([]);
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    number | null
  >(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Handle query param to open notification detail from toast click
  useEffect(() => {
    const notificationId = searchParams.get("id");
    if (notificationId) {
      const id = parseInt(notificationId, 10);
      if (!isNaN(id)) {
        setSelectedNotificationId(id);
        setIsDetailDialogOpen(true);
        // Clean up URL without reloading page
        window.history.replaceState({}, "", "/notifications");
      }
    }
  }, [searchParams]);

  // Fetch notifications from API
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notifications", user?.id, filter],
    queryFn: async () => {
      if (!user?.id) {
        return null;
      }

      const userId = parseInt(user.id, 10);
      if (isNaN(userId)) {
        console.error("Invalid user ID:", user.id);
        return null;
      }

      const { systemType, userType } = getNotificationTypes(filter);

      // Build API call promises
      const promises: Promise<ApiResponse<NotificationsListResponse>>[] = [];

      if (systemType !== undefined) {
        promises.push(
          notificationAPI.getNotifications({
            userId,
            type: systemType,
            page: 1,
            pageSize: PAGE_SIZE,
          })
        );
      }

      if (userType !== undefined) {
        promises.push(
          notificationAPI.getNotifications({
            userId,
            type: userType,
            page: 1,
            pageSize: PAGE_SIZE,
          })
        );
      }

      // Fetch all notifications in parallel
      const responses = await Promise.all(promises);
      return mergeNotifications(responses);
    },
    enabled: !!user?.id,
    staleTime: STALE_TIME_MS,
  });

  // Transform API notifications to component format
  const notifications = useMemo<NotificationItem[]>(() => {
    if (!data?.data) {
      return localNotifications;
    }

    const transformed = data.data.map(
      (notif: Notification): NotificationItem => ({
        id: notif.id,
        title: notif.title,
        description: notif.message,
        date: notif.createdAt,
        type: mapNotificationType(notif.type),
        read: notif.isRead,
        icon: getNotificationIcon(notif.type),
        href: notif.href || undefined,
      })
    );

    // Merge with local state (for optimistic updates)
    const localMap = new Map(localNotifications.map((n) => [n.id, n]));
    return transformed.map((notif) => localMap.get(notif.id) || notif);
  }, [data, localNotifications]);

  // Fetch unread count from API
  const { data: unreadCountData } = useQuery({
    queryKey: ["notifications-unread-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const userId = parseInt(user.id, 10);
      if (isNaN(userId)) return null;

      const response = await notificationAPI.getUnreadCount(userId);
      return response.data ?? 0;
    },
    enabled: !!user?.id,
    staleTime: STALE_TIME_MS,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Use API unread count if available, otherwise fallback to local calculation
  const unreadCount = useMemo(() => {
    if (unreadCountData !== null && unreadCountData !== undefined) {
      return unreadCountData;
    }
    return notifications.filter((n) => !n.read).length;
  }, [unreadCountData, notifications]);

  // Filter notifications based on selected filter
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (filter === "all") return true;
      if (filter === "unread") return !notification.read;
      // Map "social" filter to both "social" and "user" types
      if (filter === "social") {
        return notification.type === "social" || notification.type === "user";
      }
      return notification.type === filter;
    });
  }, [notifications, filter]);

  // Handlers
  const markAsRead = useCallback(
    async (id: number) => {
      // Optimistic update
      setLocalNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      try {
        await notificationAPI.markAsRead(id);

        // Invalidate queries to refresh data
        if (user?.id) {
          queryClient.invalidateQueries({
            queryKey: ["notifications-unread-count", user.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["notifications", user.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["notification-detail", id],
          });
        }

        // toast.success("Notification marked as read", {
        //   duration: 2000,
        // });
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        // Revert optimistic update on error
        setLocalNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: false } : n))
        );
        toast.error("Failed to mark notification as read", {
          description:
            error instanceof Error ? error.message : "Please try again",
        });
      }
    },
    [user?.id, queryClient]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    const userId = parseInt(user.id, 10);
    if (isNaN(userId)) return;

    // Optimistic update
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    const toastId = toast.loading("Marking all notifications as read...");

    try {
      await notificationAPI.markAllAsRead(userId);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count", user.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["notifications", user.id],
      });

      toast.success("All notifications marked as read", {
        id: toastId,
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      // Revert optimistic update on error
      setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: false })));
      toast.error("Failed to mark all notifications as read", {
        id: toastId,
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }
  }, [user?.id, queryClient]);

  const deleteNotification = useCallback(
    (id: number) => {
      setLocalNotifications((prev) => prev.filter((n) => n.id !== id));
      // Invalidate unread count to refresh
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["notifications-unread-count", user.id],
        });
      }
      // TODO: Call API to delete notification
    },
    [user?.id, queryClient]
  );

  const handleViewDetail = useCallback((id: number) => {
    setSelectedNotificationId(id);
    setIsDetailDialogOpen(true);
  }, []);

  const handleDetailDialogClose = useCallback((open: boolean) => {
    setIsDetailDialogOpen(open);
    if (!open) {
      setSelectedNotificationId(null);
    }
  }, []);

  return (
    <div className="min-h-screen pt-32">
      <div className="container max-w-5xl mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="font-dela-gothic text-3xl md:text-4xl lg:text-5xl leading-tight">
              <span className="bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-cyan-200">
                Notifications
              </span>
            </h1>
            <motion.p
              key={unreadCount}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="font-poppins text-gray-300 mt-2"
            >
              {unreadCount > 0 ? (
                <span>
                  You have{" "}
                  <span className="text-cyan-400 font-semibold">
                    {unreadCount}
                  </span>{" "}
                  unread notification{unreadCount > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-cyan-400/80">All caught up!</span>
              )}
            </motion.p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {unreadCount > 0 && (
              <GlassButton
                variant="ghost"
                size="md"
                onClick={markAllAsRead}
                className="text-xs sm:text-sm bg-white/10 border border-white/20 hover:bg-white/15"
              >
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Mark all read</span>
                <span className="sm:hidden">Mark all</span>
              </GlassButton>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <FilterBar filter={filter} onFilterChange={setFilter} />

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState onRetry={() => refetch()} />
          ) : filteredNotifications.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              }}
              initial="hidden"
              animate="show"
            >
              {filteredNotifications.map((notification, index) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  index={index}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center py-8"
          >
            <GlassButton variant="ghost" size="lg">
              Load More Notifications
            </GlassButton>
          </motion.div>
        )}
      </div>

      {/* Notification Detail Dialog */}
      <NotificationDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={handleDetailDialogClose}
        notificationId={selectedNotificationId}
        onMarkAsRead={markAsRead}
      />
    </div>
  );
}
