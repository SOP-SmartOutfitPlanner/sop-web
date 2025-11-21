"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Bell, X, ArrowUpRight } from "lucide-react";

interface PushNotificationToastProps {
  title: string;
  message?: string;
  metaLabel?: string;
  variant?: "info" | "success" | "warning" | "error";
  onDismiss?: () => void;
  actorName?: string;
  actorAvatarUrl?: string;
  actionHref?: string;
  actionLabel?: string;
}

const variantStyles: Record<
  NonNullable<PushNotificationToastProps["variant"]>,
  { gradient: string; border: string; shadow: string; glow: string }
> = {
  info: {
    gradient: "from-cyan-500/30 to-blue-500/20",
    border: "border-cyan-400/50",
    shadow: "shadow-[0_45px_120px_-40px_rgba(14,165,233,0.6)]",
    glow: "shadow-cyan-500/20",
  },
  success: {
    gradient: "from-emerald-500/30 to-lime-500/20",
    border: "border-emerald-400/50",
    shadow: "shadow-[0_45px_120px_-40px_rgba(16,185,129,0.6)]",
    glow: "shadow-emerald-500/20",
  },
  warning: {
    gradient: "from-amber-500/30 to-orange-500/20",
    border: "border-amber-400/50",
    shadow: "shadow-[0_45px_120px_-40px_rgba(245,158,11,0.6)]",
    glow: "shadow-amber-500/20",
  },
  error: {
    gradient: "from-rose-500/30 to-red-500/20",
    border: "border-rose-400/50",
    shadow: "shadow-[0_45px_120px_-40px_rgba(244,63,94,0.6)]",
    glow: "shadow-rose-500/20",
  },
};

const iconColor: Record<
  NonNullable<PushNotificationToastProps["variant"]>,
  string
> = {
  info: "text-cyan-300",
  success: "text-emerald-300",
  warning: "text-amber-300",
  error: "text-rose-300",
};

export function PushNotificationToast({
  title,
  message,
  metaLabel,
  variant = "info",
  onDismiss,
  actorName,
  actorAvatarUrl,
  actionHref,
  actionLabel = "View detail",
}: PushNotificationToastProps) {
  const variantStyle = variantStyles[variant];

  return (
    <motion.div
      initial={{ x: 100, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 100, opacity: 0, scale: 0.9 }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 300,
        mass: 0.8,
      }}
      whileHover={{ scale: 1.02 }}
      className="relative w-[360px] sm:w-[420px] max-w-[calc(100vw-2rem)]"
    >
      <motion.div
        className={`relative overflow-hidden rounded-3xl border-2 bg-gradient-to-br from-slate-950/95 to-slate-900/90 ${variantStyle.gradient} ${variantStyle.border} ${variantStyle.shadow} ring-1 ring-white/10`}
        whileHover={{ boxShadow: variantStyle.shadow }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

        <div className="relative flex gap-4 sm:gap-5 p-5 sm:p-6">
          {actorAvatarUrl ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
              className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 shadow-xl ring-2 ring-white/10"
            >
              <Image
                src={actorAvatarUrl}
                alt={actorName ?? "Actor avatar"}
                fill
                sizes="64px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
              className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white/15 to-white/5 ${iconColor[variant]} shadow-xl ring-2 ring-white/10`}
            >
              <Bell className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2} />
            </motion.div>
          )}

          <div className="flex-1 min-w-0 space-y-3.5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-2">
                <motion.h3
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-base sm:text-lg font-bold text-white leading-tight line-clamp-2 drop-shadow-sm"
                >
                  {title}
                </motion.h3>
                {(actorName || metaLabel) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap items-center gap-2.5 text-[10px] uppercase tracking-wider"
                  >
                    {actorName && (
                      <span className="font-semibold text-white/75 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                        {actorName}
                      </span>
                    )}
                    {metaLabel && (
                      <>
                        {actorName && <span className="text-white/30">•</span>}
                        <span className="px-2.5 py-1 rounded-md bg-white/8 border border-white/15 text-white/70 font-medium">
                          {metaLabel}
                        </span>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
              {onDismiss && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{
                    scale: 1.15,
                    rotate: 90,
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  }}
                  whileTap={{ scale: 0.85 }}
                  onClick={onDismiss}
                  className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-white/25 bg-white/8 text-white/80 transition-all hover:bg-white/20 hover:text-white hover:border-white/40 hover:shadow-md hover:shadow-white/10 shrink-0"
                  aria-label="Dismiss notification"
                  title="Dismiss"
                >
                  <X className="h-4 w-4 sm:h-4.5 sm:w-4.5" strokeWidth={2.5} />
                </motion.button>
              )}
            </div>

            {/* Message */}
            {message && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-sm sm:text-base leading-relaxed text-slate-200 line-clamp-2"
              >
                {message}
              </motion.p>
            )}

            {/* Action Button */}
            {actionHref && (
              <motion.a
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05, x: 2 }}
                whileTap={{ scale: 0.95 }}
                href={actionHref}
                onClick={onDismiss}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/12 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:border-white/50 hover:bg-white/20 hover:text-white hover:shadow-lg hover:shadow-white/15 active:scale-95"
              >
                <span>{actionLabel}</span>
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </motion.a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
