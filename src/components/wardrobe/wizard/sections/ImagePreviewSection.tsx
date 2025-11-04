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
  const [imageScale, setImageScale] = useState(1);

  return (
    <motion.div variants={FORM_ANIMATIONS.item} className="h-full">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl shadow-lg overflow-hidden group h-full flex flex-col">
        <div 
          className="flex-1 relative cursor-zoom-in overflow-hidden"
          onMouseEnter={() => setImageScale(1.05)}
          onMouseLeave={() => setImageScale(1)}
        >
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Item preview"
              className="w-full h-full object-contain transition-transform duration-300"
              style={{ transform: `scale(${imageScale})` }}
            />
          )}
          
          {/* Favorite button */}
          <motion.button
            type="button"
            onClick={() => setFavorite(!favorite)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg border border-gray-200"
            aria-label="Toggle favorite"
          >
            <Heart
              className={`w-5 h-5 transition-all duration-300 ${
                favorite
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600"
              }`}
            />
          </motion.button>
        </div>
        
        <div className="p-4 bg-white border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center font-medium">
            Item Preview
          </p>
        </div>
      </div>
    </motion.div>
  );
}
