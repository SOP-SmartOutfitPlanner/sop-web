"use client";

import { memo, type ComponentType } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCircle2, Shield, UserRound } from "lucide-react";
import type { FilterType } from "./types";

interface EmptyStateConfig {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

const EMPTY_STATE_COPY: Record<FilterType, EmptyStateConfig> = {
  all: {
    title: "All caught up!",
    description: "You're all set. We'll let you know when something new arrives.",
    icon: CheckCircle2,
  },
  unread: {
    title: "No unread notifications",
    description: "Nice work! Everything has been reviewed.",
    icon: Bell,
  },
  system: {
    title: "No system updates",
    description: "We'll notify you when SOP has important news.",
    icon: Shield,
  },
  user: {
    title: "No direct mentions yet",
    description: "Your community is quiet for now. Check back later.",
    icon: UserRound,
  },
};

interface EmptyStateProps {
  filter: FilterType;
}

const EmptyState = memo<EmptyStateProps>(({ filter }) => {
  const copy = EMPTY_STATE_COPY[filter] ?? EMPTY_STATE_COPY.all;
  const Icon = copy.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-16"
      role="status"
      aria-live="polite"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/5"
      >
        <Icon className="h-12 w-12 text-cyan-200" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="font-bricolage text-2xl text-white mb-2"
      >
        {copy.title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="font-poppins text-slate-400 text-sm max-w-md mx-auto"
      >
        {copy.description}
      </motion.p>
    </motion.div>
  );
});

EmptyState.displayName = "EmptyState";

export default EmptyState;


