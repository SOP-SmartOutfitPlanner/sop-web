/**
 * StyleOccasionSection Component
 * Style and Occasion toggle groups with AI suggestions
 */

import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { FORM_ANIMATIONS } from "../form-config";
import type { AISuggestions } from "../types";

interface StyleOccasionSectionProps {
  styleIds: number[];
  occasionIds: number[];
  availableStyles: { id: number; name: string; description?: string }[];
  availableOccasions: { id: number; name: string }[];
  aiSuggestions: AISuggestions | null;
  onToggleStyle: (styleId: number) => void;
  onToggleOccasion: (occasionId: number) => void;
}

export function StyleOccasionSection({
  styleIds,
  occasionIds,
  availableStyles,
  availableOccasions,
  aiSuggestions,
  onToggleStyle,
  onToggleOccasion,
}: StyleOccasionSectionProps) {
  return (
    <motion.div variants={FORM_ANIMATIONS.item}>
      <div className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Style & Occasions
          </h3>
        </div>

        <div className="space-y-5">
          {/* Styles */}
          {availableStyles.length > 0 && (
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2">
                Styles
                {aiSuggestions?.styles && aiSuggestions.styles.length > 0 && (
                  <span className="ml-2 text-xs text-blue-600 font-normal">
                    (AI auto-selected)
                  </span>
                )}
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableStyles.map((style) => {
                  const isSelected = styleIds?.includes(style.id) || false;
                  return (
                    <motion.button
                      key={style.id}
                      type="button"
                      onClick={() => onToggleStyle(style.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
                        isSelected
                          ? "bg-purple-100 border border-purple-300 text-purple-700"
                          : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      title={style.description}
                    >
                      {style.name}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Occasions */}
          {availableOccasions.length > 0 && (
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2">
                Occasions
                {aiSuggestions?.occasions &&
                  aiSuggestions.occasions.length > 0 && (
                    <span className="ml-2 text-xs text-green-600 font-normal">
                      (AI auto-selected)
                    </span>
                  )}
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableOccasions.map((occasion) => {
                  const isSelected =
                    occasionIds?.includes(occasion.id) || false;
                  return (
                    <motion.button
                      key={occasion.id}
                      type="button"
                      onClick={() => onToggleOccasion(occasion.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
                        isSelected
                          ? "bg-green-100 border border-green-300 text-green-700"
                          : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {occasion.name}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading state */}
          {availableStyles.length === 0 && availableOccasions.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Loading styles and occasions...
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
