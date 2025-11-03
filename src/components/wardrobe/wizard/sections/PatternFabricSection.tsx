/**
 * PatternFabricSection Component
 * Pattern and Fabric input fields
 */

import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FORM_ANIMATIONS } from "../form-config";

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
        <Label htmlFor="pattern" className="text-sm font-semibold text-white/90 mb-2">
          Pattern
        </Label>
        <Input
          id="pattern"
          type="text"
          value={pattern}
          onChange={(e) => onPatternChange(e.target.value)}
          placeholder="e.g., Solid, Striped, Floral..."
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-400/50 focus:ring-blue-400/20"
        />
      </div>

      {/* Fabric */}
      <div>
        <Label htmlFor="fabric" className="text-sm font-semibold text-white/90 mb-2">
          Fabric
        </Label>
        <Input
          id="fabric"
          type="text"
          value={fabric}
          onChange={(e) => onFabricChange(e.target.value)}
          placeholder="e.g., Cotton, Polyester, Silk..."
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-400/50 focus:ring-blue-400/20"
        />
      </div>
    </motion.div>
  );
}
