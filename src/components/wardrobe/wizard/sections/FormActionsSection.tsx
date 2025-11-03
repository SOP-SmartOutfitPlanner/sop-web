/**
 * FormActionsSection Component
 * Cancel and Save buttons
 */

import { motion } from "framer-motion";
import { X, Save, Sparkles } from "lucide-react";
import { FORM_ANIMATIONS } from "../form-config";

interface FormActionsSectionProps {
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function FormActionsSection({
  isSaving,
  onCancel,
  onSave,
}: FormActionsSectionProps) {
  return (
    <motion.div variants={FORM_ANIMATIONS.item} className="flex gap-3 pt-2">
      <motion.button
        type="button"
        onClick={onCancel}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex-1 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 flex items-center justify-center gap-2"
      >
        <X className="w-5 h-5" />
        Cancel
      </motion.button>
      <motion.button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        whileHover={!isSaving ? { scale: 1.02 } : {}}
        whileTap={!isSaving ? { scale: 0.98 } : {}}
        className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
            Saving...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Save Item
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
