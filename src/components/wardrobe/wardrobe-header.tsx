"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface WardrobeHeaderProps {
  onAddItem: () => void;
  isLoading?: boolean;
}

export const WardrobeHeader = memo(function WardrobeHeader({
  onAddItem,
  isLoading = false,
}: WardrobeHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-blue-600 mb-2">My Wardrobe</h1>
        <p className="text-gray-600">
          Manage your clothing collection with smart organization
        </p>
      </div>
      <div className="flex gap-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onAddItem}
            className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg transition-all duration-300"
            disabled={isLoading}
          >
            <motion.div
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Plus className="w-4 h-4 mr-2" />
            </motion.div>
            Add Item
          </Button>
        </motion.div>
      </div>
    </div>
  );
});
