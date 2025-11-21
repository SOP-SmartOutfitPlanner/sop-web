import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { onMessage } from "firebase/messaging";
import { useAuthStore } from "@/store/auth-store";
import type { NotificationPlacement } from "antd/es/notification/interface";
import { getFirebaseMessaging } from "@/lib/firebase";
import { PushNotificationToast } from "@/components/notifications/PushNotificationToast";

const TOAST_DURATION_SECONDS = 5;

type NotificationVariant = "info" | "success" | "warning" | "error";

const getNotificationVariant = (type?: string): NotificationVariant => {
  const normalizedType = type?.toLowerCase();
  switch (normalizedType) {
    case "social":
    case "user":
    case "achievement":
      return "success";
    case "calendar":
      return "warning";
    case "system":
    default:
      return "info";
  }
};

const mapPlacementToToastPosition = (
  placement: NotificationPlacement
):
  | "top-center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center" => {
  switch (placement) {
    case "topLeft":
      return "top-left";
    case "topRight":
      return "top-right";
    case "bottomLeft":
      return "bottom-left";
    case "bottomRight":
      return "bottom-right";
    case "bottom":
      return "bottom-center";
    case "top":
    default:
      return "top-center";
  }
};

const navigateToNotificationDetail = (
  notificationId: number,
  router: ReturnType<typeof useRouter>
) => {
  router.push(`/notifications?id=${notificationId}`);
};

export function useRealtimeNotifications(
  placement: NotificationPlacement = "topRight"
) {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleIncomingNotification = useCallback(
    (payload: {
      id?: number;
      title: string;
      message: string;
      type?: string;
      href?: string;
      actorName?: string;
      actorAvatarUrl?: string;
      metaLabel?: string;
    }) => {
      const variant = getNotificationVariant(payload.type);

      toast.custom(
        (id) => (
          <PushNotificationToast
            title={payload.title}
            message={payload.message}
            metaLabel={payload.metaLabel}
            variant={variant}
            actorName={payload.actorName}
            actorAvatarUrl={payload.actorAvatarUrl}
            actionHref={payload.href}
            onDismiss={() => toast.dismiss(id)}
          />
        ),
        {
          duration: TOAST_DURATION_SECONDS * 1000,
          position: mapPlacementToToastPosition(placement),
          className: "glass-toast",
        }
      );

      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["notifications", user.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["notifications-unread-count", user.id],
        });
      }
    },
    [placement, queryClient, user?.id]
  );

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    const userId = parseInt(user.id, 10);
    if (isNaN(userId)) {
      console.error("[RealtimeNotifications] Invalid userId:", user?.id);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    (async () => {
      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        console.warn("[RealtimeNotifications] Firebase messaging not supported");
        return;
      }

      console.log(
        "[RealtimeNotifications] Subscribed to Firebase messages for user:",
        userId
      );
      unsubscribe = onMessage(messaging, (payload) => {
        console.log("[RealtimeNotifications] FCM payload:", payload);
        const data = payload.data || {};

        const notificationPayload = {
          id: data.notificationId ? Number(data.notificationId) : undefined,
          title:
            data.title ?? payload.notification?.title ?? "New notification",
          message: data.message ?? payload.notification?.body ?? "",
          type: data.type ?? "SYSTEM",
          href:
            data.href && data.href !== "string" ? data.href : undefined,
          actorName: data.actorDisplayName,
          actorAvatarUrl:
            data.imageUrl ?? payload.notification?.image ?? undefined,
          metaLabel: data.category ?? data.metaLabel,
        };

        if (!notificationPayload.title && !notificationPayload.message) {
          console.warn(
            "[RealtimeNotifications] Skipping FCM payload without content"
          );
          return;
        }

        handleIncomingNotification(notificationPayload);

        if (notificationPayload.id) {
          navigateToNotificationDetail(notificationPayload.id, router);
        }
      });
    })();

    return () => {
      if (unsubscribe) {
        console.log(
          "[RealtimeNotifications] Unsubscribed Firebase messages for user:",
          userId
        );
        unsubscribe();
      }
    };
  }, [isAuthenticated, user?.id, handleIncomingNotification, router]);

  return null;
}

