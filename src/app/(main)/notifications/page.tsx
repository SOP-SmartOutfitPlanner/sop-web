"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Check,
  Trash2,
  Settings,
  Filter,
  Clock,
  Sparkles,
  Calendar,
} from "lucide-react";
import GlassButton from "@/components/ui/glass-button";
import GlassCard from "@/components/ui/glass-card";

// Mock data - Replace with real API data later
const mockNotifications = [
  {
    id: 1,
    title: "New AI Suggestion Available",
    description:
      "We've created a perfect outfit combination for your upcoming meeting based on the weather forecast.",
    date: "2024-12-15T10:30:00",
    type: "ai",
    read: false,
    icon: Sparkles,
  },
  {
    id: 3,
    title: "Event Reminder",
    description:
      "You have a 'Business Meeting' scheduled for tomorrow at 2:00 PM. Don't forget to prepare your outfit!",
    date: "2024-12-14T18:00:00",
    type: "calendar",
    read: true,
    icon: Calendar,
  },
  {
    id: 5,
    title: "Weather Alert",
    description:
      "Rain expected tomorrow. We recommend bringing an umbrella and choosing waterproof clothing.",
    date: "2024-12-14T08:00:00",
    type: "weather",
    read: true,
    icon: Sparkles,
  },
  {
    id: 6,
    title: "Wardrobe Milestone",
    description:
      "Congratulations! You've added 50 items to your wardrobe. Keep building your perfect collection!",
    date: "2024-12-13T12:00:00",
    type: "achievement",
    read: true,
    icon: Sparkles,
  },
];

type FilterType =
  | "all"
  | "unread"
  | "ai"
  | "social"
  | "calendar"
  | "weather"
  | "achievement";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<FilterType>("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    return notification.type === filter;
  });

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ai":
        return "from-purple-500/20 to-pink-500/20 border-purple-400/30";
      case "social":
        return "from-blue-500/20 to-cyan-500/20 border-blue-400/30";
      case "calendar":
        return "from-orange-500/20 to-yellow-500/20 border-orange-400/30";
      case "weather":
        return "from-cyan-500/20 to-blue-500/20 border-cyan-400/30";
      case "achievement":
        return "from-green-500/20 to-emerald-500/20 border-green-400/30";
      default:
        return "from-gray-500/20 to-slate-500/20 border-gray-400/30";
    }
  };

  const getTypeIconColor = (type: string) => {
    switch (type) {
      case "ai":
        return "text-purple-400";
      case "social":
        return "text-blue-400";
      case "calendar":
        return "text-orange-400";
      case "weather":
        return "text-cyan-400";
      case "achievement":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

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
            <p className="font-poppins text-gray-300 mt-2">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${
                    unreadCount > 1 ? "s" : ""
                  }`
                : "All caught up!"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <GlassButton
                variant="ghost"
                size="md"
                onClick={markAllAsRead}
                className="text-sm"
              >
                <Check className="w-4 h-4" />
                Mark all read
              </GlassButton>
            )}
            <GlassButton variant="ghost" size="md" className="text-sm">
              <Settings className="w-4 h-4" />
              Settings
            </GlassButton>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard
            padding="1rem"
            blur="10px"
            brightness={1.1}
            borderRadius="16px"
            className="backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400 font-poppins mr-2">
                Filter:
              </span>
              {[
                "all",
                "unread",
                "ai",
                "social",
                "calendar",
                "weather",
                "achievement",
              ].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType as FilterType)}
                  className={`px-4 py-1.5 rounded-full text-sm font-poppins font-medium transition-all ${
                    filter === filterType
                      ? "bg-blue-500/30 text-blue-200 border border-blue-400/50"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/10"
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="font-poppins text-gray-400 text-lg">
                No notifications found
              </p>
              <p className="font-poppins text-gray-500 text-sm mt-2">
                {filter !== "all"
                  ? "Try changing your filter"
                  : "You're all caught up!"}
              </p>
            </motion.div>
          ) : (
            filteredNotifications.map((notification, index) => {
              const Icon = notification.icon;
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <GlassCard
                    padding="1.5rem"
                    blur="10px"
                    brightness={notification.read ? 1.05 : 1.15}
                    borderRadius="16px"
                    className={`backdrop-blur-md transition-all cursor-pointer ${
                      notification.read
                        ? "bg-white/5 border border-white/10"
                        : "bg-blue-500/10 border-2 border-blue-400/50 shadow-lg shadow-blue-500/20"
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`w-14 h-14 rounded-xl bg-linear-to-br ${getTypeColor(
                          notification.type
                        )} border shrink-0 shadow-lg flex items-center justify-center`}
                      >
                        <Icon
                          className={`w-6 h-6 ${getTypeIconColor(
                            notification.type
                          )}`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`font-bricolage font-bold text-base ${
                                notification.read
                                  ? "text-gray-300"
                                  : "text-white"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1.5 hover:bg-blue-500/30 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4 text-blue-400" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1.5 hover:bg-red-500/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                        <p
                          className={`font-poppins text-sm mb-3 leading-relaxed ${
                            notification.read
                              ? "text-gray-400"
                              : "text-gray-200"
                          }`}
                        >
                          {notification.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-poppins">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDate(notification.date)}</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })
          )}
        </div>

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
    </div>
  );
}
