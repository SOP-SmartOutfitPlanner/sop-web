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
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden group sticky top-4">
        <div className="aspect-square relative max-w-[340px] mx-auto">
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Item preview"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Favorite button */}
          <motion.button
            type="button"
            onClick={() => setFavorite(!favorite)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 p-3 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 shadow-lg"
            aria-label="Toggle favorite"
          >
            <Heart
              className={`w-5 h-5 transition-all duration-300 ${
                favorite
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-white"
              }`}
            />
          </motion.button>

          {/* AI Badge */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-white/90 font-medium">
              AI Analyzed
            </span>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-t from-black/20 to-transparent">
          <p className="text-sm text-white/60 text-center">
            Review and edit details
          </p>
        </div>
      </div>
    </motion.div>
  );
}
