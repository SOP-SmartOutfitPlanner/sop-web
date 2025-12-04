"use client";

import { Calendar, Clock } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import type { CollectionRecord } from "@/lib/api";
import { formatDate } from "@/lib/collections/utils";

interface CollectionInfoSidebarProps {
  collection: CollectionRecord;
}

export function CollectionInfoSidebar({
  collection,
}: CollectionInfoSidebarProps) {
  return (
    <div className="pt-15">
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
        </div>
      </GlassCard>
    </div>
  );
}
