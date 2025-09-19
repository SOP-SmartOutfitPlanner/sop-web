"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ItemGrid } from "@/components/wardrobe/item-grid";
import { Filters } from "@/components/wardrobe/filters";

export default function WardrobePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Wardrobe
              </h1>
              <p className="text-gray-600">
                Manage and organize your clothing items
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <Filters />
              </div>

              <div className="lg:col-span-3">
                <ItemGrid />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
