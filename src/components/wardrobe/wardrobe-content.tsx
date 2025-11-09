"use client";

import { ItemGrid } from "./item-grid";
import { WardrobeItem } from "@/types";

interface WardrobeContentProps {
  onEditItem?: (item: WardrobeItem) => void;
}

export function WardrobeContent({ onEditItem }: WardrobeContentProps) {
  return (
    <div className="w-full">
      <ItemGrid onEditItem={onEditItem} />
    </div>
  );
}
