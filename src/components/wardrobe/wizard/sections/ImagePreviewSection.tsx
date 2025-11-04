/**
 * ImagePreviewSection Component
 * Preview image with favorite toggle and AI badge
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { FORM_ANIMATIONS } from "../form-config";

interface ImagePreviewSectionProps {
  previewUrl: string;
}

export function ImagePreviewSection({ previewUrl }: ImagePreviewSectionProps) {
  const [favorite, setFavorite] = useState(false);

  return (
    <motion.div variants={FORM_ANIMATIONS.item} className="order-2 lg:order-1">
      <div className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl overflow-hidden group sticky top-4">
        <div className="aspect-square relative max-w-[340px] mx-auto">
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Item preview"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Favorite button */}
          <motion.button
            type="button"
            onClick={() => setFavorite(!favorite)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 shadow-lg"
            aria-label="Toggle favorite"
          >
            <Heart
              className={`w-5 h-5 transition-all duration-300 ${
                favorite
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-gray-700"
              }`}
            />
          </motion.button>

          {/* AI Badge */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm flex items-center gap-2 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs text-gray-900 font-medium">
              AI Analyzed
            </span>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-t from-blue-50/50 to-transparent border-t border-gray-100">
          <p className="text-sm text-gray-600 text-center">
            Review and edit details
          </p>
        </div>
      </div>
    </motion.div>
  );
}
