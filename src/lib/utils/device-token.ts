/**
 * Device Token Utilities
 * Generate and manage device tokens for push notifications
 */

import { toast } from "sonner";

/**
 * Generate a unique device token
 * Uses a combination of browser fingerprinting and localStorage
 */
export function generateDeviceToken(): string {
  if (typeof window === "undefined") {
    return "";
  }

  // Check if we already have a device token stored
  const storedToken = localStorage.getItem("deviceToken");
  if (storedToken) {
    console.log("📱 Device token retrieved from storage:", storedToken);
    return storedToken;
  }

  // Generate a new device token
  // Format: timestamp-random-uuid
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const uuid = crypto.randomUUID?.() || `${Math.random().toString(36).substring(2, 9)}-${Math.random().toString(36).substring(2, 9)}`;
  
  const deviceToken = `${timestamp}-${random}-${uuid}`;
  
  // Store in localStorage for persistence
  localStorage.setItem("deviceToken", deviceToken);
  
  console.log("📱 New device token generated:", deviceToken);
  
  return deviceToken;
}

/**
 * Get device token (generate if not exists)
 */
export function getDeviceToken(): string {
  return generateDeviceToken();
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
  console.log("📱 Current notification permission:", currentPermission);

  // Check if permission is already granted
  if (currentPermission === "granted") {
    console.log("✅ Notification permission already granted");
    return true;
  }

  // Request permission
  if (currentPermission === "default") {
    try {
      console.log("📱 Requesting notification permission...");
      const permission = await Notification.requestPermission();
      console.log("📱 Notification permission result:", permission);
      return permission === "granted";
    } catch (error) {
      console.error("❌ Error requesting notification permission:", error);
      return false;
    }
  }

  // Permission was previously denied
  console.log("⚠️ Notification permission was previously denied");
  return false;
}

/**
 * Register device token with backend
 * This should be called after user login
 */
export async function registerDeviceForNotifications(
  userId: number,
  deviceToken: string
): Promise<void> {
  // Show loading toast
  const toastId = toast.loading("Đang đăng ký thiết bị cho thông báo...", {
    description: "Vui lòng đợi trong giây lát",
  });

  try {
    console.log("📱 Registering device token:", {
      userId,
      deviceToken,
    });
    
    // Import notification API dynamically to avoid circular dependencies
    const { notificationAPI } = await import("@/lib/api/notification-api");
    
    await notificationAPI.registerDeviceToken({
      userId,
      deviceToken,
    });
    
    console.log("✅ Device token registered successfully:", deviceToken);
    
    // Show success toast
    toast.success("Đăng ký thiết bị thành công!", {
      id: toastId,
      description: "Bạn sẽ nhận được thông báo khi có cập nhật mới",
      duration: 3000,
    });
  } catch (error) {
    console.error("❌ Failed to register device token:", error);
    
    // Dismiss loading toast and show error toast
    const errorMessage = error instanceof Error ? error.message : "Không thể đăng ký thiết bị";
    toast.error("Đăng ký thiết bị thất bại", {
      id: toastId,
      description: errorMessage,
      duration: 4000,
    });
    
    // Don't throw - notification registration failure shouldn't block login
  }
}

