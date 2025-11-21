"use client";

import Image from "next/image";
import { memo } from "react";
import { motion } from "framer-motion";
import { Check, Trash2, Clock, ArrowUpRight } from "lucide-react";
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
  onDeleteRequest: (id: number) => void;
  onViewDetail?: (id: number) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelectChange?: (id: number, selected: boolean) => void;
}

const NotificationCard = memo<NotificationCardProps>(
  ({
    notification,
    index,
    onMarkAsRead,
    onDeleteRequest,
    onViewDetail,
    selectable = false,
    selected = false,
    onSelectChange,
  }) => {
    const Icon = notification.icon;

    const handleClick = () => {
      if (selectable) {
        onSelectChange?.(notification.id, !selected);
        return;
      }
      if (onViewDetail) {
        onViewDetail(notification.id);
      } else {
        onMarkAsRead(notification.id);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: selected ? 0.98 : 1,
        }}
        transition={{
          duration: 0.4,
          delay: index * 0.03,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        whileHover={{
          y: selectable ? 0 : -2,
          transition: { duration: 0.2 },
        }}
        whileTap={selectable ? { scale: 0.97 } : undefined}
        layout
        className="mb-4"
      >
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          }}
          aria-label={`${notification.read ? "Read" : "Unread"} notification: ${
            notification.title
          }`}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded-3xl block w-full text-left cursor-pointer"
        >
          <GlassCard
            padding="1.5rem"
            blur="12px"
            brightness={notification.read ? 1.02 : 1.18}
            borderRadius="24px"
            className={`relative overflow-hidden border transition-all duration-300 group ${
              selected
                ? "border-cyan-400/60 bg-gradient-to-br from-cyan-500/15 via-slate-900/30 to-slate-900/20 shadow-xl shadow-cyan-500/30 ring-2 ring-cyan-400/40"
                : notification.read
                ? "border-white/5 bg-gradient-to-br from-slate-900/40 to-slate-900/20 hover:border-white/10 hover:bg-gradient-to-br hover:from-slate-900/50 hover:to-slate-900/30"
                : "border-cyan-400/40 bg-gradient-to-br from-cyan-500/5 via-slate-900/20 to-slate-900/10 shadow-xl shadow-cyan-900/25 hover:border-cyan-400/60 hover:from-cyan-500/10 hover:via-slate-900/25 hover:to-slate-900/15 hover:shadow-2xl hover:shadow-cyan-900/30"
            }`}
          >
            {selectable && (
              <>
                {/* Large checkbox on the left - easier to click */}

                {/* Status badge on the right */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all ${
                    selected
                      ? "bg-cyan-500/30 text-cyan-100 border-cyan-400/60 shadow-lg shadow-cyan-500/20"
                      : "bg-black/40 text-white/60 border-white/10"
                  }`}
                >
                  {selected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Selected</span>
                    </>
                  ) : (
                    <span>Select</span>
                  )}
                </motion.div>
              </>
            )}
            <div
              className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5 ${
                selectable ? "pl-12 sm:pl-14" : ""
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                transition={{ duration: 0.3 }}
                className={`relative flex h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-2xl border-2 ${getTypeColor(
                  notification.type
                )} shadow-xl shadow-black/40`}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 via-transparent to-black/70" />
                <Icon
                  className={`relative z-10 h-6 w-6 sm:h-7 sm:w-7 ${getTypeIconColor(
                    notification.type
                  )} drop-shadow-sm`}
                />
                {!notification.read && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-1.5 -right-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-cyan-500/50 ring-2 ring-slate-900/50"
                  >
                    New
                  </motion.span>
                )}
              </motion.div>

              <div className="flex-1 space-y-3.5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-2.5 min-w-0">
                    {/* Actor & Type Row */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {notification.actorName && (
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 border-white/20 overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center uppercase text-xs font-bold shadow-md">
                            {notification.actorAvatar ? (
                              <Image
                                src={notification.actorAvatar}
                                alt={notification.actorName}
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-slate-200">
                                {notification.actorName.charAt(0)}
                              </span>
                            )}
                          </div>
                          <span className="font-semibold text-sm text-slate-200 tracking-tight">
                            {notification.actorName}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-800/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300 border border-slate-700/50">
                          {notification.type}
                        </span>
                        {notification.read ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2.5 py-1 text-[10px] font-medium text-slate-400 border border-slate-700/50">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            Read
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2.5 py-1 text-[10px] font-semibold text-cyan-100 border border-cyan-400/30 shadow-sm shadow-cyan-500/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            Unread
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className={`font-bricolage text-lg sm:text-xl leading-tight line-clamp-2 ${
                        notification.read
                          ? "text-slate-300"
                          : "text-white font-semibold drop-shadow-sm"
                      }`}
                    >
                      {notification.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!notification.read && !selectable && (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.92 }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/50 bg-cyan-500/15 px-3.5 py-2 text-xs font-semibold text-cyan-100 transition-all hover:bg-cyan-500/25 hover:border-cyan-400/70 hover:shadow-md hover:shadow-cyan-500/20 active:scale-95"
                        aria-label="Mark notification as read"
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                        <span className="hidden sm:inline">Mark read</span>
                        <span className="sm:hidden">Read</span>
                      </motion.button>
                    )}
                    {!selectable && (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRequest(notification.id);
                        }}
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.92 }}
                        className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-2.5 text-slate-400 transition-all hover:border-red-400/70 hover:bg-red-500/20 hover:text-red-200 hover:shadow-md hover:shadow-red-500/10 active:scale-95"
                        aria-label="Delete notification"
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Description */}
                {notification.description && (
                  <p
                    className={`font-poppins text-sm sm:text-base leading-relaxed line-clamp-2 ${
                      notification.read ? "text-slate-400" : "text-slate-300"
                    }`}
                  >
                    {notification.description}
                  </p>
                )}

                {/* Footer: Timestamp & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/40 bg-slate-800/40 px-2.5 py-1.5 text-xs font-medium text-slate-400">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <time dateTime={notification.date}>
                        {formatDate(notification.date)}
                      </time>
                    </span>
                  </div>
                  {notification.href && !selectable && (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewDetail) {
                          onViewDetail(notification.id);
                        } else if (notification.href) {
                          window.open(notification.href, "_blank");
                        }
                      }}
                      whileHover={{ scale: 1.05, x: 2 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition-all hover:bg-cyan-500/20 hover:border-cyan-400/60 hover:shadow-md hover:shadow-cyan-500/10"
                    >
                      View detail
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </motion.button>
                  )}
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
