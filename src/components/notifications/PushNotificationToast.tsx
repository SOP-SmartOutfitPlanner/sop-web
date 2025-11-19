 "use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Bell, X } from "lucide-react";

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
  string
> = {
  info: "from-cyan-500/30 to-blue-500/20 border-cyan-400/40",
  success: "from-emerald-500/25 to-lime-500/15 border-emerald-400/40",
  warning: "from-amber-500/30 to-orange-500/15 border-amber-400/40",
  error: "from-rose-500/30 to-red-500/20 border-rose-400/40",
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
  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 60, opacity: 0 }}
      transition={{ type: "spring", damping: 18, stiffness: 240 }}
      className="relative w-[340px] sm:w-[380px]"
    >
      <div
        className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br from-slate-950/90 to-slate-900/85 ${variantStyles[variant]} shadow-[0_45px_120px_-40px_rgba(14,165,233,0.55)]`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.12),transparent_45%)] opacity-80" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-40" />

        <div className="relative flex gap-4 p-5 pr-6">
          {actorAvatarUrl ? (
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[18px] border border-white/15 shadow-[0_18px_45px_-18px_rgba(14,165,233,0.75)]">
              <Image
                src={actorAvatarUrl}
                alt={actorName ?? "Actor avatar"}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/10 ${iconColor[variant]} shadow-[0_18px_35px_-18px_currentColor] ring-1 ring-white/15`}
            >
              <Bell className="h-6 w-6" />
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[15px] font-semibold text-white">{title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-white/55">
                  {actorName && <span>{actorName}</span>}
                  {metaLabel && (
                    <>
                      <span className="text-white/30">•</span>
                      <span>{metaLabel}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={onDismiss}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {message && (
              <p className="mt-2 text-sm leading-relaxed text-slate-200/90">
                {message}
              </p>
            )}

            {actionHref && (
              <a
                href={actionHref}
                onClick={onDismiss}
                className="mt-4 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/80 transition hover:border-white/40 hover:bg-white/10"
              >
                {actionLabel}
              </a>
            )}

            <div className="mt-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.35em] text-white/60">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                Live Alert
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

