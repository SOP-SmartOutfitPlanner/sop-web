"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCircle2 } from "lucide-react";
import type { FilterType } from "./types";

interface EmptyStateProps {
  filter: FilterType;
}

const EmptyState = memo<EmptyStateProps>(({ filter }) => {
  const isAllCaughtUp = filter === "all";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-20"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2
        }}
        className="mb-6"
      >
        {isAllCaughtUp ? (
          <CheckCircle2 className="w-20 h-20 mx-auto text-cyan-400/60" />
        ) : (
          <Bell className="w-20 h-20 mx-auto text-gray-600" />
        )}
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="font-bricolage text-xl text-gray-300 mb-2"
      >
        {isAllCaughtUp ? "All caught up!" : "No notifications found"}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="font-poppins text-gray-500 text-sm"
      >
        {isAllCaughtUp 
          ? "You're all set! No new notifications." 
          : "Try changing your filter to see more notifications"}
      </motion.p>
    </motion.div>
  );
});

EmptyState.displayName = "EmptyState";

export default EmptyState;


