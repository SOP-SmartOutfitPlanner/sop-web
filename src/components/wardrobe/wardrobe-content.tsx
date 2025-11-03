"use client";

import { ItemGrid } from "./item-grid";
import { SidebarStats } from "./sidebar-stats";

export function WardrobeContent() {
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
}
