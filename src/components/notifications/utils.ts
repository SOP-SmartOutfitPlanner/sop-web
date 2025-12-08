import {
  Bell,
  Heart,
  MessageCircle,
  FileText,
  FolderOpen,
  CreditCard,
  UserPlus,
  Users,
} from "lucide-react";
import type { NotificationType } from "@/lib/api";

// Notification type mapping
export const mapNotificationType = (type: NotificationType): string => {
  return type.toLowerCase();
};

// Get icon component based on notification type
export const getNotificationIcon = (type: string) => {
  const normalizedType = type.toLowerCase();

  switch (normalizedType) {
    case "social":
    case "user":
      return Users;
    case "system":
    default:
      return Bell;
  }
};

/**
 * Get notification icon based on href and title context
 * This provides more specific icons based on the notification content
 *
 * @param href - The notification href (e.g., /posts/123, /collections/456)
 * @param type - The notification type (SYSTEM or USER)
 * @param title - Optional title for additional context
 */
export const getNotificationIconFromHref = (
  href?: string,
  type?: string,
  title?: string
) => {
  // System notifications
  if (type?.toLowerCase() === "system") {
    // Subscription notifications
    if (title?.toLowerCase().includes("subscription")) {
      return CreditCard;
    }
    return Bell;
  }

  // User notifications - determine by href pattern
  if (href) {
    // Post notifications
    if (href.includes("/posts/")) {
      // Could be like or comment - check title for more specific icon
      if (title?.toLowerCase().includes("like")) {
        return Heart;
      }
      if (title?.toLowerCase().includes("comment")) {
        return MessageCircle;
      }
      // Default for new post notifications
      return FileText;
    }

    // Collection notifications
    if (href.includes("/collections/")) {
      if (title?.toLowerCase().includes("like")) {
        return Heart;
      }
      if (title?.toLowerCase().includes("comment")) {
        return MessageCircle;
      }
      return FolderOpen;
    }

    // Follow notifications (if implemented in future)
    if (href.includes("/profile/") || href.includes("/users/")) {
      return UserPlus;
    }
  }

  // Default based on type
  return type?.toLowerCase() === "user" ? Users : Bell;
};

// Get notification type color classes
export const getTypeColor = (type: string): string => {
  const normalizedType = type.toLowerCase();

  switch (normalizedType) {
    case "social":
    case "user":
      return "from-pink-500/20 to-purple-500/20 border-pink-400/30";
    case "system":
    default:
      return "from-blue-500/20 to-cyan-500/20 border-blue-400/30";
  }
};

// Get left border color for notification type
export const getLeftBorderColor = (type: string): string => {
  const normalizedType = type.toLowerCase();

  switch (normalizedType) {
    case "social":
    case "user":
      return "border-l-pink-400";
    case "system":
    default:
      return "border-l-blue-400";
  }
};

// Get notification type icon color
export const getTypeIconColor = (type: string): string => {
  const normalizedType = type.toLowerCase();

  switch (normalizedType) {
    case "ai":
      return "text-purple-400";
    case "social":
    case "user":
      return "text-pink-400";
    case "system":
    default:
      return "text-blue-400";
  }
};

// Format date to relative time
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
