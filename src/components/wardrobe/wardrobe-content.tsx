"use client";

import { ItemGrid } from "./grids/ItemGrid";
import { WardrobeItem } from "@/types";

interface WardrobeContentProps {
  onEditItem?: (item: WardrobeItem) => void;
  onViewItem?: (item: WardrobeItem) => void;
  onOpenPost?: (postId: number) => void;
}

export function WardrobeContent({
  onEditItem,
  onViewItem,
  onOpenPost,
}: WardrobeContentProps) {
  return (
    <div className="w-full">
      <ItemGrid
        onEditItem={onEditItem}
        onViewItem={onViewItem}
        onOpenPost={onOpenPost}
      />
    </div>
  );
}
