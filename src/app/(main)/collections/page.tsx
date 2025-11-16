"use client";

import { CollectionsScreen } from "@/components/collections/CollectionsScreen";

export default function CollectionsPage() {
  return (
    <>
      <div className="min-h-screen relative z-0 pt-20 pb-16">
        <div className="max-w-10xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <CollectionsScreen />
        </div>
      </div>
    </>
  );
}
