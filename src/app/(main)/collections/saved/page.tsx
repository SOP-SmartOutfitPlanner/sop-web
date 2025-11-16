"use client";

import { AnimatedBackground } from "@/components/ui/animated-background";
import { SavedCollectionsScreen } from "@/components/collections/SavedCollectionsScreen";

export default function SavedCollectionsPage() {
  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen relative z-0 pt-32">
        <div className="max-w-6xl mx-auto">
          <SavedCollectionsScreen />
        </div>
      </div>
    </>
  );
}

