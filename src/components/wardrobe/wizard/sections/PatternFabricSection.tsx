/**
 * PatternFabricSection Component
 * Pattern and Fabric selection buttons
 */

import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { FORM_ANIMATIONS, PATTERNS, FABRICS } from "../form-config";

interface PatternFabricSectionProps {
  pattern: string;
  fabric: string;
  onPatternChange: (pattern: string) => void;
  onFabricChange: (fabric: string) => void;
}

export function PatternFabricSection({
  pattern,
  fabric,
  onPatternChange,
  onFabricChange,
}: PatternFabricSectionProps) {
  return (
    <motion.div variants={FORM_ANIMATIONS.item} className="space-y-5">
      {/* Pattern */}
      <div>
        <Label className="text-sm font-semibold text-white/90 mb-2">
          Pattern
        </Label>
        <div className="flex flex-wrap gap-2">
          {PATTERNS.map((p) => (
            <motion.button
              key={p}
              type="button"
              onClick={() => onPatternChange(p)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                pattern === p
                  ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 border border-blue-400/50"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20"
              }`}
            >
              {p}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Fabric */}
      <div>
        <Label className="text-sm font-semibold text-white/90 mb-2">
          Fabric
        </Label>
        <div className="flex flex-wrap gap-2">
          {FABRICS.map((f) => (
            <motion.button
              key={f}
              type="button"
              onClick={() => onFabricChange(f)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                fabric === f
                  ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 border border-blue-400/50"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20"
              }`}
            >
              {f}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
