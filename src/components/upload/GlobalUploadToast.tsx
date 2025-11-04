"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { useUploadStore } from "@/store/upload-store";
import { useGlobalEditModal } from "@/hooks/useGlobalEditModal";
import { toast } from "sonner";

export function GlobalUploadToast() {
  const { tasks, activeTaskId } = useUploadStore();
  const activeTask = tasks.find((task) => task.id === activeTaskId);
  const { openEditModal } = useGlobalEditModal();

  // Show success toast - DON'T remove task (it contains cache data!)
  useEffect(() => {
    if (activeTask?.status === "success") {
      // Show success toast with edit action
      toast.success(`✅ "${activeTask.fileName}" added to wardrobe!`, {
        duration: 5000,
        position: "bottom-right",
        action: activeTask.createdItemId
          ? {
              label: "Edit",
              onClick: () => {
                if (activeTask.createdItemId) {
                  openEditModal(activeTask.createdItemId);
                }
              },
            }
          : undefined,
      });

      // ⚠️ DON'T remove success tasks - they contain createdItemData for cache!
      // Tasks will be cleaned up when limit is reached (max 10 recent tasks)
    }
  }, [activeTask?.status, activeTask?.fileName, activeTask?.createdItemId, openEditModal]);

  // Only show toast for uploading/analyzing states
  const isVisible =
    activeTask &&
    (activeTask.status === "uploading" || activeTask.status === "analyzing");

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-[9999] pointer-events-auto"
        >
          <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-blue-500/20 p-6 min-w-[360px]">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="p-3 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/30 ring-1 ring-blue-400/40"
              >
                {activeTask.status === "uploading" ? (
                  <Loader2 className="w-4 h-4 text-blue-300" />
                ) : (
                  <Sparkles className="w-4 h-4 text-blue-300" />
                )}
              </motion.div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {activeTask.status === "uploading"
                    ? "Uploading Image"
                    : "Analyzing Image"}
                  {activeTask.isRetrying && (
                    <span className="text-xs text-yellow-400">
                      {/* (Retry {activeTask.retryCount}/5) */}
                    </span>
                  )}
                </h3>
                {/* <p className="text-sm text-white/60 truncate">
                  {activeTask.fileName}
                </p> */}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${activeTask.progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 rounded-full shadow-lg shadow-blue-500/50"
              />

              {/* Shimmer effect */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            </div>

            {/* Progress percentage */}
            {/* <div className="mt-3 text-right">
              <motion.span
                key={activeTask.progress}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-sm font-semibold text-blue-400"
              >
                {Math.round(activeTask.progress)}%
              </motion.span>
            </div> */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
