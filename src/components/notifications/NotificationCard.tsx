"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Check, Trash2, Clock } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import type { NotificationItem } from "./types";
import {
  getNotificationIcon,
  getTypeColor,
  getTypeIconColor,
  getLeftBorderColor,
  formatDate,
} from "./utils";

interface NotificationCardProps {
  notification: NotificationItem;
  index: number;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onViewDetail?: (id: number) => void;
}

const NotificationCard = memo<NotificationCardProps>(
  ({ notification, index, onMarkAsRead, onDelete, onViewDetail }) => {
    const Icon = notification.icon;

    const handleClick = () => {
      if (onViewDetail) {
        onViewDetail(notification.id);
      } else {
        onMarkAsRead(notification.id);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: index * 0.03,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        whileHover={{
          y: -2,
          transition: { duration: 0.2 },
        }}
        layout
        className="mb-4"
      >
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          }}
          aria-label={`${notification.read ? "Read" : "Unread"} notification: ${notification.title}`}
          className="focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-xl sm:rounded-2xl"
        >
          <GlassCard
            padding="1.5rem"
            blur="10px"
            brightness={notification.read ? 1.05 : 1.15}
            borderRadius="16px"
            className={`p-4 sm:p-6 backdrop-blur-md transition-all duration-300 cursor-pointer relative group border-l-4 rounded-xl sm:rounded-2xl ${getLeftBorderColor(
              notification.type
            )} ${
              notification.read
                ? "bg-slate-900/20 border-r border-t border-b border-white/5 hover:bg-slate-800/30 hover:border-white/15 opacity-70"
                : "bg-white/10 border-r border-t border-b border-cyan-400/30 hover:bg-white/15 hover:border-cyan-400/50 shadow-lg shadow-cyan-500/10 hover:shadow-xl hover:shadow-cyan-500/20 hover:scale-[1.01]"
            }`}
            onClick={handleClick}
          >
          {/* Unread indicator dot */}
          {!notification.read && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: index * 0.03 + 0.2,
                type: "spring",
                stiffness: 500,
                damping: 25,
              }}
              className="absolute top-4 left-4 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-cyan-400 rounded-full z-10 ring-2 ring-cyan-400/40 shadow-lg shadow-cyan-400/50"
            >
              <motion.span
                className="absolute inset-0 bg-cyan-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.8, 0, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.span>
          )}

          <div className="flex items-start gap-3 sm:gap-4">
            {/* Icon */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br ${getTypeColor(
                notification.type
              )} border shrink-0 shadow-lg sm:shadow-xl flex items-center justify-center mt-0.5 relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
              <Icon
                className={`w-4 h-4 sm:w-5 sm:h-5 ${getTypeIconColor(
                  notification.type
                )} relative z-10`}
              />
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 sm:gap-4 mb-2.5">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <h3
                    className={`font-bricolage text-base sm:text-lg leading-tight line-clamp-2 ${
                      notification.read
                        ? "text-slate-300 font-semibold"
                        : "text-white font-bold"
                    }`}
                    title={notification.title}
                  >
                    {notification.title}
                  </h3>
                </div>

                {/* Action buttons - only show on hover */}
                <motion.div
                  initial={{ opacity: 0, x: -10, scale: 0.9 }}
                  whileHover={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 sm:gap-2 shrink-0 pointer-events-auto"
                >
                  {!notification.read && (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                      }}
                      whileHover={{ scale: 1.1, y: -1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 sm:p-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 hover:border-cyan-400/50 rounded-lg transition-all backdrop-blur-sm shadow-sm hover:shadow-md"
                      title="Mark as read"
                      aria-label="Mark notification as read"
                    >
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                    </motion.button>
                  )}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(notification.id);
                    }}
                    whileHover={{ scale: 1.1, y: -1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 sm:p-2.5 bg-slate-800/40 hover:bg-red-500/20 border border-slate-700/30 hover:border-red-400/50 rounded-lg transition-all text-gray-400 hover:text-red-400 backdrop-blur-sm shadow-sm hover:shadow-md"
                    title="Delete notification"
                    aria-label="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </motion.button>
                </motion.div>
              </div>

              <p
                className={`font-poppins text-sm sm:text-base mb-3 leading-relaxed line-clamp-2 ${
                  notification.read ? "text-slate-400" : "text-slate-300"
                }`}
                title={notification.description}
              >
                {notification.description}
              </p>

              <div
                className={`flex items-center gap-1.5 sm:gap-2 text-xs font-poppins ${
                  notification.read ? "text-slate-500" : "text-slate-400"
                }`}
              >
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <time dateTime={notification.date} className="shrink-0">
                  {formatDate(notification.date)}
                </time>
              </div>
            </div>
          </div>
        </GlassCard>
        </div>
      </motion.div>
    );
  }
);

NotificationCard.displayName = "NotificationCard";

export default NotificationCard;
