"use client";

import { motion } from "framer-motion";
import { Paperclip, Package } from "lucide-react";

interface AttachmentButtonProps {
  type: "items" | "outfit";
  count: number;
  onClick: () => void;
}

export function AttachmentButton({
  type,
  count,
  onClick,
}: AttachmentButtonProps) {
  const Icon = type === "outfit" ? Package : Paperclip;
  const label = type === "outfit" ? "Outfit" : "Items";

  return (
    <motion.button
      onClick={onClick}
      className="relative flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-br from-white/8 to-white/4 hover:from-white/12 hover:to-white/8 border border-white/10 hover:border-cyan-400/40 transition-all duration-300 group overflow-hidden backdrop-blur-sm mb-4"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Gradient glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all duration-300 shadow-lg shadow-cyan-500/10">
        <Icon className="w-4.5 h-4.5 text-cyan-300 group-hover:text-cyan-200 transition-colors" />
      </div>
      
      <div className="relative flex flex-col items-start">
        <span className="text-sm font-semibold font-bricolage text-white/90 group-hover:text-white transition-colors">
          {label}
        </span>
        <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
          {count} {count === 1 ? "item" : "items"}
        </span>
      </div>
    </motion.button>
  );
}
