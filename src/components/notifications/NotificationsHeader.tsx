import { motion } from "framer-motion";
import { Check } from "lucide-react";
import GlassButton from "@/components/ui/glass-button";

interface NotificationsHeaderProps {
  unreadCount: number;
  filteredCount: number;
  filterDescription: string;
  onMarkAllAsRead: () => void;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  selectedCount: number;
  onBulkDelete: () => void;
}

export function NotificationsHeader({
  unreadCount,
  filteredCount,
  filterDescription,
  onMarkAllAsRead,
  isSelectionMode,
  onToggleSelectionMode,
  selectedCount,
  onBulkDelete,
}: NotificationsHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div>
        <h1 className="font-dela-gothic text-3xl md:text-4xl lg:text-5xl leading-tight">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-cyan-200">
            Notifications
          </span>
        </h1>
        <motion.p
          key={`${unreadCount}-${filteredCount}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="font-poppins text-white/90 mt-3 text-lg font-semibold drop-shadow"
        >
          {unreadCount > 0 ? (
            <>
              You have{" "}
              <span className="text-cyan-300 font-semibold">
                {unreadCount}
              </span>{" "}
              unread {unreadCount === 1 ? "update" : "updates"}. Showing{" "}
              {filteredCount} {filterDescription}.
            </>
          ) : filteredCount > 0 ? (
            <>
              Showing{" "}
              <span className="text-cyan-300 font-semibold">
                {filteredCount}
              </span>{" "}
              {filterDescription}.
            </>
          ) : (
            <span className="text-cyan-400/80">All caught up!</span>
          )}
        </motion.p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {unreadCount > 0 && !isSelectionMode && (
          <GlassButton
            variant="ghost"
            size="md"
            onClick={onMarkAllAsRead}
            className="text-xs sm:text-sm bg-white/10 border border-white/20 hover:bg-white/15"
          >
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Mark all read</span>
            <span className="sm:hidden">Mark all</span>
          </GlassButton>
        )}
        <GlassButton
          variant={isSelectionMode ? "primary" : "ghost"}
          size="md"
          onClick={onToggleSelectionMode}
          className={`text-xs sm:text-sm ${
            isSelectionMode
              ? "bg-cyan-500/30 border border-cyan-400/50"
              : "bg-white/10 border border-white/15"
          }`}
        >
          {isSelectionMode ? "Exit selection" : "Select"}
        </GlassButton>
        {isSelectionMode && (
          <GlassButton
            variant="ghost"
            size="md"
            onClick={onBulkDelete}
            disabled={selectedCount === 0}
            className={`text-xs sm:text-sm transition-all ${
              selectedCount > 0
                ? "bg-red-500/20 border border-red-400/40 hover:bg-red-500/30 hover:border-red-400/60 shadow-lg shadow-red-500/10"
                : "bg-slate-800/40 border border-slate-700/30 opacity-50 cursor-not-allowed"
            }`}
          >
            <span className="hidden sm:inline">
              Delete {selectedCount > 0 ? `(${selectedCount})` : ""}
            </span>
            <span className="sm:hidden">
              Delete {selectedCount > 0 ? `(${selectedCount})` : ""}
            </span>
          </GlassButton>
        )}
      </div>
    </motion.div>
  );
}

