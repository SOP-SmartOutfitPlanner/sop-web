import { motion } from "framer-motion";
import GlassButton from "@/components/ui/glass-button";

interface SelectionModeBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  isAllSelected: boolean;
}

export function SelectionModeBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  isAllSelected,
}: SelectionModeBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-slate-900/40 to-slate-900/40 border border-cyan-400/30 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-cyan-100">
          {selectedCount} selected
        </span>
        {selectedCount > 0 && (
          <span className="text-xs text-slate-400">of {totalCount}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={onSelectAll}
          disabled={isAllSelected}
          className="text-xs bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50"
        >
          Select all
        </GlassButton>
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          disabled={selectedCount === 0}
          className="text-xs bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50"
        >
          Clear
        </GlassButton>
      </div>
    </motion.div>
  );
}

