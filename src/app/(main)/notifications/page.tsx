"use client";

import { useState, useMemo, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check } from "lucide-react";
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
// Number of notifications to fetch per page.
// Keep this small to improve initial load UX; additional pages are loaded on scroll.
const PAGE_SIZE = 10;
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
  let hasNext = false;
  let currentPage = 1;
  let totalPages = 1;

  responses.forEach((response) => {
    const payload = response.data;

    if (payload?.data) {
      allNotifications.push(...payload.data);
    }

    if (payload?.metaData) {
      totalCount += payload.metaData.totalCount;
      hasNext = hasNext || payload.metaData.hasNext;
      currentPage = Math.max(currentPage, payload.metaData.currentPage);
      totalPages = Math.max(totalPages, payload.metaData.totalPages);
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
      currentPage,
      totalPages,
      hasNext,
      hasPrevious: currentPage > 1,
    },
  };
};

// Component that uses useSearchParams - must be wrapped in Suspense
function NotificationQueryHandler({
  onNotificationId,
}: {
  onNotificationId: (id: number) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const notificationId = searchParams.get("id");
    if (notificationId) {
      const id = parseInt(notificationId, 10);
      if (!isNaN(id)) {
        onNotificationId(id);
        // Clean up URL without reloading page
        window.history.replaceState({}, "", "/notifications");
      }
    }
  }, [searchParams, onNotificationId]);

  return null;
}

function NotificationsPageContent({
  initialNotificationId,
}: {
  initialNotificationId: number | null;
}) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>("all");
  const [localNotifications, setLocalNotifications] = useState<
    NotificationItem[]
  >([]);
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    number | null
  >(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Handle notification ID from query params
  useEffect(() => {
    if (initialNotificationId) {
      setSelectedNotificationId(initialNotificationId);
      setIsDetailDialogOpen(true);
    }
  }, [initialNotificationId]);

  // Fetch notifications from API
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<NotificationsListResponse | null, Error>({
    queryKey: ["notifications", user?.id, filter],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
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
            page: pageParam as number,
            pageSize: PAGE_SIZE,
          })
        );
      }

      if (userType !== undefined) {
        promises.push(
          notificationAPI.getNotifications({
            userId,
            type: userType,
            page: pageParam as number,
            pageSize: PAGE_SIZE,
          })
        );
      }

      // Fetch all notifications in parallel
      const responses = await Promise.all(promises);

      // Debug: log raw API responses and page size
      console.log("[Notifications] Fetch responses", {
        userId,
        filter,
        pageSize: PAGE_SIZE,
        pageParam,
        sources: responses.map((res) => ({
          totalCount: res.data?.metaData?.totalCount,
          pageSize: res.data?.metaData?.pageSize,
          currentPage: res.data?.metaData?.currentPage,
          hasNext: res.data?.metaData?.hasNext,
        })),
      });

      const merged = mergeNotifications(responses);

      console.log("[Notifications] Merged notifications summary", {
        totalCount: merged.metaData.totalCount,
        pageSize: merged.metaData.pageSize,
        currentPage: merged.metaData.currentPage,
        totalPages: merged.metaData.totalPages,
        hasNext: merged.metaData.hasNext,
        returnedCount: merged.data.length,
      });

      return merged;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.metaData) return undefined;
      return lastPage.metaData.hasNext
        ? lastPage.metaData.currentPage + 1
        : undefined;
    },
    enabled: !!user?.id,
    staleTime: STALE_TIME_MS,
  });

  // Transform API notifications to component format
  const notifications = useMemo<NotificationItem[]>(() => {
    const apiNotifications: Notification[] =
      data?.pages?.flatMap((page) => page?.data ?? []) ?? [];

    if (apiNotifications.length === 0) {
      return localNotifications;
    }

    // Deduplicate notifications by ID (in case multiple sources/pages return same item)
    const uniqueNotifications: Notification[] = Array.from(
      new Map(apiNotifications.map((notif) => [notif.id, notif])).values()
    ).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const transformed = uniqueNotifications.map(
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
    const finalNotifications = transformed.map(
      (notif) => localMap.get(notif.id) || notif
    );

    // Debug: log how many notifications are currently loaded (all pages combined)
    console.log("[Notifications] Total loaded notifications", {
      total: finalNotifications.length,
      pageSize: PAGE_SIZE,
    });

    return finalNotifications;
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

  // Infinite scroll: auto-load more when Load More section enters viewport
  useEffect(() => {
    if (!hasNextPage || !loadMoreRef.current) return;

    const element = loadMoreRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "0px 0px 200px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

        {/* Load More (also used as infinite scroll sentinel) */}
        {filteredNotifications.length > 0 && (
          <motion.div
            ref={loadMoreRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center py-8"
          >
            {hasNextPage ? (
              <GlassButton
                variant="ghost"
                size="lg"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="min-w-[220px]"
              >
                {isFetchingNextPage ? "Loading more..." : "Load More Notifications"}
              </GlassButton>
            ) : (
              <p className="text-sm text-cyan-300/70">
                You&apos;re all caught up on notifications.
              </p>
            )}
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

export default function NotificationsPage() {
  const [notificationIdFromQuery, setNotificationIdFromQuery] = useState<
    number | null
  >(null);

  return (
    <Suspense fallback={<div className="min-h-screen pt-32" />}>
      <NotificationQueryHandler
        onNotificationId={setNotificationIdFromQuery}
      />
      <NotificationsPageContent
        initialNotificationId={notificationIdFromQuery}
      />
    </Suspense>
  );
}
