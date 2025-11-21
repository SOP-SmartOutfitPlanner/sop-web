"use client";

/**
 * Device Token Utilities
 * Generate and manage device tokens for push notifications
 */

import { getToken } from "firebase/messaging";
import { toast } from "sonner";
import { getFirebaseMessaging } from "@/lib/firebase";

/**
 * Generate a unique device token
 * Uses a combination of browser fingerprinting and localStorage
 */
async function retrieveFcmToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const existingToken = localStorage.getItem("deviceToken");
  if (existingToken) {
    return existingToken;
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    return null;
  }

  if (!("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      localStorage.setItem("deviceToken", token);
    }

    return token ?? null;
  } catch (error) {
    console.error("Failed to retrieve FCM token:", error);
    return null;
  }
}

/**
 * Remove stored device token (used during logout)
 */
export function removeStoredDeviceToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem("deviceToken");
  if (token) {
    localStorage.removeItem("deviceToken");
  }
  return token;
}

/**
 * Request notification permission from user
 * Returns true if permission is granted or already granted
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("⚠️ Browser does not support notifications");
    return false;
  }

  const currentPermission = Notification.permission;
  // Check if permission is already granted
  if (currentPermission === "granted") {
    return true;
  }

  // Request permission
  if (currentPermission === "default") {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("❌ Error requesting notification permission:", error);
      return false;
    }
  }

  // Permission was previously denied
  return false;
}

/**
 * Register device token with backend (requires permission + FCM token)
 * This should be called after user login
 */
export async function registerDeviceForNotifications(
  userId: number,
  deviceToken: string
): Promise<void> {
  // Show loading toast
  try {
    // Import notification API dynamically to avoid circular dependencies
    const { notificationAPI } = await import("@/lib/api/notification-api");

    await notificationAPI.registerDeviceToken({
      userId,
      deviceToken,
    });
  } catch (error) {
    console.error("❌ Failed to register device token:", error);

    // Dismiss loading toast and show error toast
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to register device token";
    toast.error(errorMessage, {
      description: errorMessage,
      duration: 4000,
      className: "glass-toast",
    });
  }
}

export async function getDeviceToken(): Promise<string | null> {
  const token = await retrieveFcmToken();
  return token;
}
