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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
          My Wardrobe
        </h1>
        <p className="text-gray-600">
          Manage your clothing collection with smart organization
        </p>
      </div>
      <div className="flex gap-3">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onAddItem}
            className="from-primary transition-all duration-300"
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
