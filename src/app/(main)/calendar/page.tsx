"use client";

import { OutfitCalendar } from "@/components/calendar/OutfitCalendar";

export default function WeeklyPageContent() {
  return (
    <div className="min-h-screen pt-32">
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-8">
        <div className="mb-8">
          <h1 className="font-dela-gothic text-2xl md:text-3xl lg:text-4xl leading-tight">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-cyan-200">
              Outfit Calendar
            </span>
          </h1>
          <p className="bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-cyan-200">
            Plan your outfits for every occasion
          </p>
        </div>

        <OutfitCalendar />
      </div>
    </div>
  );
}
