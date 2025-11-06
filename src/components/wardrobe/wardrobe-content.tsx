"use client";

import { ItemGrid } from "./grids/ItemGrid";
import { SidebarStats } from "./sidebar/SidebarStats";
import { WardrobeItem } from "@/types";

interface WardrobeContentProps {
  onEditItem?: (item: WardrobeItem) => void;
}

export function WardrobeContent({ onEditItem }: WardrobeContentProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <ItemGrid onEditItem={onEditItem} />
      </div>
      <div className="lg:col-span-1">
        <SidebarStats />
      </div>
    </div>
  );
}
