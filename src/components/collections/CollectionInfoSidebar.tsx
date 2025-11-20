"use client";

import { Calendar, Clock, Share2 } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CollectionRecord } from "@/lib/api";
import { formatDate } from "@/lib/collections/utils";

const DEFAULT_DESCRIPTION =
  "A carefully curated collection of professional outfits that blend comfort with sophistication. Perfect for office environments and business meetings.";

interface CollectionInfoSidebarProps {
  collection: CollectionRecord;
  weatherSuitable: string[];
}

export function CollectionInfoSidebar({
  collection,
  weatherSuitable,
}: CollectionInfoSidebarProps) {
  return (
    <div className="space-y-6 pt-15">
      <GlassCard
        padding="1.5rem"
        blur="18px"
        glowColor="rgba(59, 130, 246, 0.4)"
        glowIntensity={14}
        shadowColor="rgba(15, 23, 42, 0.5)"
        className="border border-cyan-500/20 "
      >
        <h3 className="mb-4 text-base font-semibold text-white">Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-slate-300">
            <Calendar className="h-4 w-4 text-cyan-300" />
            <span className="text-slate-400">Created at:</span>
            <span>{formatDate(collection.createdDate)}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <Clock className="h-4 w-4 text-cyan-300" />
            <span className="text-slate-400">Updated at:</span>
            <span>
              {formatDate(collection.updatedDate ?? collection.createdDate)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <Calendar className="h-4 w-4 text-cyan-300" />
            <span className="text-slate-400">Season:</span>
            <div className="flex flex-wrap gap-1">
              {weatherSuitable.length > 0 ? (
                weatherSuitable.map((weather) => (
                  <Badge
                    key={weather}
                    className="border-cyan-300/20 bg-cyan-500/10 text-cyan-200 px-2 py-0.5 text-xs"
                  >
                    {weather}
                  </Badge>
                ))
              ) : (
                <span>All-Season</span>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="flex flex-col gap-3">
        <Button
          variant="outline"
          className="w-full rounded-2xl border-white/40 bg-white/10 text-white hover:bg-white/20"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  );
}
