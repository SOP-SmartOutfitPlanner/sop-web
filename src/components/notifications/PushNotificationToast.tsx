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
  { iconBg: string; iconColor: string }
> = {
  info: {
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-400",
  },
  success: {
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
  },
  warning: {
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
  },
  error: {
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-400",
  },
};

export function PushNotificationToast({
  title,
  message,
  variant = "info",
  onDismiss,
  actorAvatarUrl,
  actionHref,
}: PushNotificationToastProps) {
  const style = variantStyles[variant];

  const content = (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 400 }}
      className="w-[280px]"
    >
      <div className="flex items-center gap-3 rounded-xl bg-slate-900/95 border border-white/10 backdrop-blur-md px-3 py-2.5">
        {/* Icon/Avatar */}
        {actorAvatarUrl ? (
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
            <Image
              src={actorAvatarUrl}
              alt="Avatar"
              fill
              sizes="32px"
              className="object-cover"
            />
          </div>
        ) : (
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.iconBg} ${style.iconColor}`}
          >
            <Bell className="h-4 w-4" strokeWidth={2} />
          </div>
        )}

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-white/90 leading-tight line-clamp-1">
            {title}
          </p>
          {message && (
            <p
              className="text-[11px] text-white/50 leading-snug line-clamp-1 mt-0.5 [&>b]:font-semibold [&>b]:text-white/70 [&>strong]:font-semibold [&>strong]:text-white/70"
              dangerouslySetInnerHTML={{ __html: message }}
            />
          )}
        </div>

        {/* Close */}
        {onDismiss && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDismiss();
            }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
      </div>
    </motion.div>
  );

  if (actionHref) {
    return (
      <a href={actionHref} onClick={onDismiss} className="block">
        {content}
      </a>
    );
  }

  return content;
}
