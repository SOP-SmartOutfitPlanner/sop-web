"use client";

import { motion } from "framer-motion";
import { CalendarCheck, CalendarDays, CalendarRange, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface OccasionStatsWidgetProps {
  todayCount: number;
  weekCount: number;
  monthCount: number;
  isLoading: boolean;
}

const stats = [
  {
    key: "today",
    label: "Today",
    icon: CalendarCheck,
    color: "from-blue-500 to-cyan-600",
    glowColor: "shadow-blue-500/30",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    key: "week",
    label: "This Week",
    icon: CalendarDays,
    color: "from-emerald-500 to-green-600",
    glowColor: "shadow-emerald-500/30",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
  {
    key: "month",
    label: "This Month",
    icon: CalendarRange,
    color: "from-violet-500 to-purple-600",
    glowColor: "shadow-violet-500/30",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
  },
];

export function OccasionStatsWidget({
  todayCount,
  weekCount,
  monthCount,
  isLoading,
}: OccasionStatsWidgetProps) {
  const counts = {
    today: todayCount,
    week: weekCount,
    month: monthCount,
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
          >
            <Skeleton className="h-12 w-12 rounded-xl bg-white/10" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-16 bg-white/10" />
              <Skeleton className="h-6 w-8 bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const count = counts[stat.key as keyof typeof counts];

        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`flex items-center gap-4 p-4 rounded-2xl ${stat.bgColor} border ${stat.borderColor} backdrop-blur-sm`}
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} ${stat.glowColor} shadow-lg`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{count}</span>
                <span className="text-sm text-white/40">
                  {count === 1 ? "event" : "events"}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
