/**
 * ColorSection Component
 * Display detected colors from AI analysis
 */

import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { FORM_ANIMATIONS } from "../form-config";

interface ColorSectionProps {
  colors: { name: string; hex: string }[];
}

export function ColorSection({ colors }: ColorSectionProps) {
  if (!colors || colors.length === 0) {
    return null;
  }

  return (
    <motion.div variants={FORM_ANIMATIONS.item}>
      <Label className="text-sm font-semibold text-gray-700 mb-3">
        Detected Colors
      </Label>
      <div className="flex gap-3 flex-wrap">
        {colors.map((color, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: index * 0.1,
              type: "spring",
            }}
            whileHover={{ scale: 1.1, y: -2 }}
            className="relative group"
          >
            <div
              className="w-14 h-14 rounded-xl border-2 border-gray-300 shadow-lg transition-all group-hover:shadow-xl group-hover:border-gray-400 cursor-pointer"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {color.name}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
