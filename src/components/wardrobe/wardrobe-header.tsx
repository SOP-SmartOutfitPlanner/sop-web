"use client";

import { memo } from "react";
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
        <Button
          onClick={onAddItem}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>
    </div>
  );
});
