"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Filter } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import type { FilterType } from "./types";

const FILTER_OPTIONS = ["all", "unread", "system", "social", "user"] as const;

interface FilterBarProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FilterBar = memo<FilterBarProps>(({ filter, onFilterChange }) => {
  return (
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
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm text-gray-400 font-poppins mr-2 shrink-0 hidden sm:inline">
            Filter:
          </span>
          {FILTER_OPTIONS.map((filterType, index) => (
            <motion.button
              key={filterType}
              onClick={() => onFilterChange(filterType as FilterType)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-poppins font-medium transition-all relative ${
                filter === filterType
                  ? "bg-cyan-500/30 text-cyan-100 border border-cyan-400/60 shadow-md shadow-cyan-500/20 font-semibold"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/10 hover:border-white/20 border border-transparent"
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              {filter === filterType && (
                <motion.span
                  layoutId="activeFilter"
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-cyan-400 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
});

FilterBar.displayName = "FilterBar";

export default FilterBar;
