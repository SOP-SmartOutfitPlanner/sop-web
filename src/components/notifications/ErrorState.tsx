"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import GlassButton from "@/components/ui/glass-button";

interface ErrorStateProps {
  onRetry: () => void;
}

const ErrorState = memo<ErrorStateProps>(({ onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-16"
    >
      <Bell className="w-16 h-16 mx-auto mb-4 text-red-600" />
      <p className="font-poppins text-red-400 text-lg">Failed to load notifications</p>
      <GlassButton variant="ghost" size="md" onClick={onRetry} className="mt-4">
        Retry
      </GlassButton>
    </motion.div>
  );
});

ErrorState.displayName = "ErrorState";

export default ErrorState;


