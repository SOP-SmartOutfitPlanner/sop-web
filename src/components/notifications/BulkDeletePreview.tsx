import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { NotificationItem } from "./types";
import { getTypeColor, getTypeIconColor } from "./utils";

interface BulkDeletePreviewProps {
  notifications: NotificationItem[];
  selectedCount: number;
}

export function BulkDeletePreview({
  notifications,
  selectedCount,
}: BulkDeletePreviewProps) {
  const previewNotifications = notifications.slice(0, 10);
  const remainingCount = selectedCount - 10;

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-400/30">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
            <X className="w-3 h-3 text-red-400" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-200 mb-1">
            This action cannot be undone
          </p>
          <p className="text-xs text-red-300/80">
            All selected notifications will be permanently removed from your
            account.
          </p>
        </div>
      </div>

      {/* Preview List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-200">
            Preview ({Math.min(selectedCount, 10)} of {selectedCount})
          </p>
          {remainingCount > 0 && (
            <span className="text-xs text-slate-400">
              {remainingCount} more below
            </span>
          )}
        </div>
        <div className="max-h-[320px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {previewNotifications.length > 0 ? (
            <>
              {previewNotifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/40 hover:border-slate-600/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeColor(
                          notification.type
                        )} border`}
                      >
                        <Icon
                          className={`w-4 h-4 ${getTypeIconColor(
                            notification.type
                          )}`}
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white line-clamp-1">
                          {notification.title}
                        </p>
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300">
                          {notification.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {notification.description}
                      </p>
                      {notification.actorName && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <span>From:</span>
                          <span className="font-medium text-slate-400">
                            {notification.actorName}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {remainingCount > 0 && (
                <div className="pt-2 pb-1 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 border border-slate-700/40">
                    <span className="text-xs font-semibold text-slate-300">
                      +{remainingCount} more notification
                      {remainingCount > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">No notifications to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

