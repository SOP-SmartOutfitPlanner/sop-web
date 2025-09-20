"use client";

import { memo } from "react";
import { ItemGrid } from "./item-grid";
import { SidebarStats } from "./sidebar-stats";

export const WardrobeContent = memo(function WardrobeContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <ItemGrid />
      </div>
      <div className="lg:col-span-1">
        <SidebarStats />
      </div>
    </div>
  );
});
