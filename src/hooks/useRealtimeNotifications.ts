import React, { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { notification } from "antd";
import { useRouter } from "next/navigation";
import { Bell, Sparkles, Users, Calendar } from "lucide-react";
import { notificationAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { Notification } from "@/lib/api";
import type { NotificationPlacement } from "antd/es/notification/interface";

// Constants
const POLLING_INTERVAL_MS = 10000; // 10 seconds
const PAGE_SIZE = 10;
const TOAST_DURATION_SECONDS = 5;
const NOTIFICATION_TYPE = 0; // Only SYSTEM notifications

// Types
type AntdNotificationType = "info" | "success" | "warning" | "error";
type NotificationApi = ReturnType<typeof notification.useNotification>[0];

// Helper: Get icon component based on notification type
const getNotificationIcon = (type: string) => {
  const normalizedType = type.toLowerCase();
  switch (normalizedType) {
    case "ai":
      return Sparkles;
    case "social":
    case "user":
      return Users;
    case "calendar":
      return Calendar;
    case "system":
    default:
      return Bell;
  }
};

// Helper: Check if href is valid
const isValidHref = (href: string | null | undefined): boolean => {
  return Boolean(href && href !== "string" && href.trim() !== "");
};

// Helper: Get notification type for antd
const getAntdNotificationType = (type: string): AntdNotificationType => {
  const normalizedType = type.toLowerCase();
  switch (normalizedType) {
    case "social":
    case "user":
    case "achievement":
      return "success";
    case "system":
    default:
      return "info";
  }
};

// Helper: Create action button for notification
const createActionButton = (href: string) => {
  return React.createElement(
    "button",
    {
      onClick: () => {
        if (href) {
          window.location.href = href;
        }
      },
      className: "px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white rounded text-sm transition-colors",
    },
    "Xem"
  );
};

// Helper: Navigate to notification detail
const navigateToNotificationDetail = (notificationId: number, router: ReturnType<typeof useRouter>) => {
  // Navigate to notifications page with query param to open detail dialog
  router.push(`/notifications?id=${notificationId}`);
};

// Helper: Show toast notification using Ant Design
const showNotificationToast = (
  notificationData: Notification,
  api: NotificationApi,
  placement: NotificationPlacement,
  router: ReturnType<typeof useRouter>
): void => {
  const Icon = getNotificationIcon(notificationData.type);
  const iconElement = React.createElement(Icon, { className: "w-5 h-5" });
  const notificationType = getAntdNotificationType(notificationData.type);

  const notificationConfig: Parameters<typeof api.info>[0] = {
    message: notificationData.title,
    description: notificationData.message,
    icon: iconElement,
    placement,
    duration: TOAST_DURATION_SECONDS,
    className: "glass-notification", // Add custom class for additional styling
    onClick: () => {
      // Navigate to notification detail when clicked
      navigateToNotificationDetail(notificationData.id, router);
    },
    btn: isValidHref(notificationData.href)
      ? createActionButton(notificationData.href)
      : undefined,
  };

  // Call appropriate notification method based on type
  const notificationMethods = {
    success: api.success,
    warning: api.warning,
    error: api.error,
    info: api.info,
  };

  const notify = notificationMethods[notificationType] || notificationMethods.info;
  notify(notificationConfig);
};

/**
 * Hook to listen for realtime notifications
 * Polls for new notifications and shows toast when new ones arrive
 */
export function useRealtimeNotifications(placement: NotificationPlacement = "top") {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [api, contextHolder] = notification.useNotification();
  const lastNotificationIdsRef = useRef<Set<number>>(new Set());
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (userId: number): Promise<Notification[]> => {
    try {
      const response = await notificationAPI.getNotifications({
        userId,
        type: NOTIFICATION_TYPE,
        page: 1,
        pageSize: PAGE_SIZE,
      });
      return response.data?.data ?? [];
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      return [];
    }
  }, []);

  // Initialize with current notifications
  const initializeNotificationIds = useCallback(
    async (userId: number) => {
      try {
        const notifications = await fetchNotifications(userId);
        if (notifications.length > 0) {
          const ids = new Set(notifications.map((n) => n.id));
          lastNotificationIdsRef.current = ids;
        }
      } catch (error) {
        console.error("Failed to initialize notification IDs:", error);
      }
    },
    [fetchNotifications]
  );

  // Check for new notifications and show toasts
  const checkNewNotifications = useCallback(
    async (userId: number) => {
      try {
        const notifications = await fetchNotifications(userId);

        if (notifications.length === 0) {
          return;
        }

        const currentIds = new Set(notifications.map((n) => n.id));
        const newNotifications = notifications.filter(
          (n) => !lastNotificationIdsRef.current.has(n.id)
        );

        if (newNotifications.length > 0) {
          // Show toast for each new notification
          newNotifications.forEach((notif) => {
            showNotificationToast(notif, api, placement, router);
          });

          // Update last known notification IDs
          lastNotificationIdsRef.current = currentIds;

          // Invalidate notifications query to refresh the list
          queryClient.invalidateQueries({
            queryKey: ["notifications", userId.toString()],
          });
        } else {
          // Still update IDs in case of reordering
          lastNotificationIdsRef.current = currentIds;
        }
      } catch (error) {
        console.error("Failed to check new notifications:", error);
      }
    },
    [fetchNotifications, queryClient, api, placement, router]
  );

  useEffect(() => {
    // Early return if not authenticated
    if (!isAuthenticated || !user?.id) {
      return;
    }

    const userId = parseInt(user.id, 10);
    if (isNaN(userId)) {
      console.error("Invalid userId for realtime notifications:", user.id);
      return;
    }

    // Initialize on mount
    initializeNotificationIds(userId);

    // Start polling
    pollingIntervalRef.current = setInterval(() => {
      checkNewNotifications(userId);
    }, POLLING_INTERVAL_MS);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, user?.id, initializeNotificationIds, checkNewNotifications]);

  return contextHolder;
}
