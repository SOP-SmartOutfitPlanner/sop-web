"use client";

import { motion } from "framer-motion";
import { Loader2, Plus } from "lucide-react";
import GlassButton from "../../ui/glass-button";

interface WardrobeHeaderProps {
  onAddItem: () => void;
  isLoading?: boolean;
}

export function WardrobeHeader({
  onAddItem,
  isLoading = false,
}: WardrobeHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
          My Wardrobe
        </h1>
        <p className="text-gray-600">
          Manage your clothing collection with smart organization
        </p>
      </div>
      <div className="flex gap-3">
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
          <GlassButton
            onClick={onAddItem}
            disabled={isLoading}
            variant="custom"
            borderRadius="14px"
            blur="10px"
            brightness={1.12}
            glowColor="rgba(59,130,246,0.45)"
            glowIntensity={8}
            borderColor="rgba(255,255,255,0.28)"
            borderWidth="1px"
            textColor="#000"
            className="px-4 py-2.5 font-semibold"
            displacementScale={10}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </>
            )}
          </GlassButton>
        </motion.div>
      </div>
    </div>
  );
}
