"use client";

import { ReactNode } from "react";
import { AnimatedBackground } from "@/components/ui/animated-background";
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
    <>
      <AnimatedBackground />
      <div className="min-h-screen relative z-0 pt-32">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* Main Grid Layout */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1 space-y-6">{children}</div>

            {/* Sidebar - Shows on medium screens and up */}
            <aside className="sticky top-15 self-start hidden md:block md:w-[340px] md:flex-shrink-0">
              <Sidebar />
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
