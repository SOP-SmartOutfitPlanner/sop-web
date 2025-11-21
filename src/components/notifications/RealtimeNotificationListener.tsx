"use client";

import { useEffect } from "react";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { requestNotificationPermission } from "@/lib/utils/device-token";

/**
 * Component to listen for realtime notifications
 * Should be added to the root layout
 * Uses Ant Design notification displayed from top with glassmorphism style
 *
 * Glassmorphism styles are applied via CSS in globals.css
 */
export function RealtimeNotificationListener() {
  useEffect(() => {
    console.log(
      "🔔 RealtimeNotificationListener mounted - Starting to listen for notifications"
    );
  }, []);

  useEffect(() => {
    const ensurePermission = async () => {
      if (typeof window === "undefined" || !("Notification" in window)) {
        return;
      }

      if (Notification.permission !== "granted") {
        await requestNotificationPermission();
      }
    };

    void ensurePermission();
  }, []);

  useRealtimeNotifications("bottomLeft");

  return null;
}
