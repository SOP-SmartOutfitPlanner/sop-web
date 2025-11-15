import { Bell, Sparkles, Users, Calendar } from "lucide-react";
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
