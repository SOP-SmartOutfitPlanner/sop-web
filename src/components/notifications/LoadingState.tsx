"use client";

import { memo } from "react";
import { motion } from "framer-motion";

const LoadingState = memo(() => {
  return (
    <div className="space-y-4 py-8">
      {Array.from({ length: 3 }).map((_, index) => (
        <motion.div
          key={index}
          className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md"
          animate={{
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/10" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-32 rounded-full bg-white/10" />
              <div className="h-6 w-2/3 rounded-full bg-white/10" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded-full bg-white/5" />
                <div className="h-3 w-11/12 rounded-full bg-white/5" />
              </div>
              <div className="h-6 w-40 rounded-full bg-white/10" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
});

LoadingState.displayName = "LoadingState";

export default LoadingState;


