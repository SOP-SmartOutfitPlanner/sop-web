"use client";

import { memo, type ComponentType } from "react";
import { motion } from "framer-motion";
import {
  Filter,
  Inbox,
  BellRing,
  Shield,
  UserRound,
  Loader2,
} from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import type { FilterType } from "./types";

interface FilterOption {
  value: FilterType;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

const FILTER_OPTIONS: FilterOption[] = [
  {
    value: "all",
    label: "All",
    description: "Every notification",
    icon: Inbox,
  },
  {
    value: "unread",
    label: "Unread",
    description: "Needs attention",
    icon: BellRing,
  },
  {
    value: "system",
    label: "System",
    description: "Product updates",
    icon: Shield,
  },
  {
    value: "user",
    label: "User",
    description: "Direct mentions",
    icon: UserRound,
  },
];

interface FilterBarProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  filterCounts?: Partial<Record<FilterType, number>>;
  isLoading?: boolean;
}

const FilterBar = memo<FilterBarProps>(
  ({ filter, onFilterChange, filterCounts, isLoading }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <GlassCard
          padding="1.25rem"
          blur="10px"
          brightness={1.05}
          borderRadius="24px"
          className="backdrop-blur-md border border-white/10 shadow-2xl shadow-cyan-900/15"
        >
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <div className="flex items-center gap-2 text-sm font-poppins text-slate-300">
              <Filter className="h-4 w-4 text-cyan-300" />
              Filter feed
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-200">
                <Loader2 className="h-3 w-3 animate-spin" />
                updating
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {FILTER_OPTIONS.map((option, index) => {
              const Icon = option.icon;
              const isActive = filter === option.value;
              const count = filterCounts?.[option.value];

              return (
                <motion.button
                  key={option.value}
                  onClick={() => onFilterChange(option.value)}
                  type="button"
                  aria-pressed={isActive}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${
                    isActive
                      ? "bg-white/15 border-cyan-300/60 shadow-lg shadow-cyan-500/20"
                      : "bg-white/5 border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${
                        isActive
                          ? "bg-cyan-500/20 border-cyan-400/60 text-cyan-100"
                          : "bg-slate-900/40 border-white/10 text-slate-200"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p
                        className={`font-semibold ${
                          isActive ? "text-white" : "text-slate-200"
                        }`}
                      >
                        {option.label}
                      </p>
                      <p className="text-xs text-slate-400">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>
    );
  }
);

FilterBar.displayName = "FilterBar";

export default FilterBar;
