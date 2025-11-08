"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface CommunityLayoutProps {
  children: ReactNode;
}

/**
 * Layout wrapper for community page
 * Handles responsive grid with sidebar
 */
export function CommunityLayout({ children }: CommunityLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F8FF] via-[#F5F8FF] to-[#EAF0FF]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Main Grid Layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">{children}</div>

          {/* Sidebar - Shows on medium screens and up */}
          <aside className="hidden md:block md:w-[340px] md:flex-shrink-0 top-24 self-start">
            <Sidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
