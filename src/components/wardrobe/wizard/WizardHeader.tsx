/**
 * WizardHeader Component
 * Header section of the Add Item Wizard
 */

import { X, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { StatusType } from "./wizard-config";

interface WizardHeaderProps {
  status: StatusType;
  onClose: () => void;
}

const STEP_TITLES: Record<StatusType, string> = {
  idle: "Add New Item",
  preview: "Upload Photo",
  cropping: "Crop Image",
  analyzing: "AI Analysis",
  form: "Item Details",
  saved: "Item Saved",
};

const STEP_DESCRIPTIONS: Record<StatusType, string> = {
  idle: "Let's add a new item to your wardrobe",
  preview: "Add a photo of your item",
  cropping: "Adjust your photo for best results",
  analyzing: "Analyzing your item with AI...",
  form: "Review and edit the details",
  saved: "Your item has been saved successfully",
};

export function WizardHeader({ status, onClose }: WizardHeaderProps) {
  const isAnalyzing = status === "analyzing";

  return (
    <div className="relative flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-6 py-4">
      {/* Icon & Title */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={
            isAnalyzing
              ? {
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }
              : {}
          }
          transition={
            isAnalyzing
              ? {
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity },
                }
              : {}
          }
        >
          <Sparkles className="h-6 w-6 text-blue-400" />
        </motion.div>
        <div>
          <h2 className="text-xl font-bricolage font-semibold text-white">
            {STEP_TITLES[status]}
          </h2>
          <p className="text-sm text-white/60 font-poppins">
            {STEP_DESCRIPTIONS[status]}
          </p>
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
