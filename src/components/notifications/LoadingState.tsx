"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";

const LoadingState = memo(() => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-20"
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="mb-6"
      >
        <Bell className="w-20 h-20 mx-auto text-cyan-400/60" />
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="font-poppins text-gray-400 text-lg"
      >
        Loading notifications...
      </motion.p>
    </motion.div>
  );
});

LoadingState.displayName = "LoadingState";

export default LoadingState;


