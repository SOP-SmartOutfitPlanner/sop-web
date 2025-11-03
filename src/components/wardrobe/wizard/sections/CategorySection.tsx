/**
 * CategorySection Component
 * Category selection with AI-detected category display
 */

import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { FORM_ANIMATIONS } from "../form-config";
import type { AISuggestions } from "../types";

interface CategorySectionProps {
  categoryId: number;
  categoryName: string;
  availableCategories: { id: number; name: string }[];
  errors: Record<string, string>;
  aiSuggestions: AISuggestions | null;
  onCategoryChange: (categoryId: number, categoryName: string) => void;
}

export function CategorySection({
  categoryId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  categoryName,
  availableCategories,
  errors,
  aiSuggestions,
  onCategoryChange,
}: CategorySectionProps) {
  return (
    <motion.div variants={FORM_ANIMATIONS.item}>
      <Label className="text-sm font-semibold text-white/90 mb-2">
        Category *
      </Label>

      {/* Always show AI-detected category if exists */}
      {aiSuggestions?.category && (
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-white/60">AI Detected:</span>
            <span className="px-3 py-1.5 text-sm bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-300 font-medium">
              {aiSuggestions.category.name}
            </span>
          </div>
        </div>
      )}

      {/* Manual category selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {availableCategories.map((cat) => (
          <motion.button
            key={cat.id}
            type="button"
            onClick={() => onCategoryChange(cat.id, cat.name)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-3 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 ${
              categoryId === cat.id
                ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 border border-blue-400/50"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20"
            }`}
            aria-pressed={categoryId === cat.id}
          >
            {cat.name}
          </motion.button>
        ))}
      </div>
      {availableCategories.length === 0 && (
        <p className="text-sm text-white/50 text-center py-4">
          Loading categories...
        </p>
      )}
      {errors.category && (
        <p className="mt-1.5 text-xs text-red-400 font-medium">
          {errors.category}
        </p>
      )}
    </motion.div>
  );
}
