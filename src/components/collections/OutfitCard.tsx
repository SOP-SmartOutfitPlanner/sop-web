"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Shirt } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import type {
  CollectionItemDetail,
  CollectionOutfit,
  CollectionOutfitItem,
} from "@/lib/api";

interface OutfitItemCardProps {
  item: CollectionItemDetail;
  index: number;
}

function OutfitItemCard({ item, index }: OutfitItemCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-700/40 bg-slate-900/50">
        {item.imgUrl ? (
          <Image
            src={item.imgUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-cyan-300/60">
            <Shirt className="h-12 w-12" />
          </div>
        )}
        <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-bold text-white">
          {index + 1}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-white line-clamp-1">
          {item.name}
        </p>
        <p className="text-xs text-slate-500">{item.categoryName}</p>
      </div>
    </div>
  );
}

interface OutfitCardProps {
  outfit: CollectionOutfitItem | null;
  entry: CollectionOutfit;
  items: CollectionItemDetail[];
}

export function OutfitCard({ outfit, entry, items }: OutfitCardProps) {
  const [showDescription, setShowDescription] = useState(true);

  const toggleDescription = useCallback(() => {
    setShowDescription((prev) => !prev);
  }, []);

  const outfitDescription = outfit?.description || entry.description;

  return (
    <GlassCard
      padding="1.75rem"
      blur="18px"
      glowColor="rgba(94, 234, 212, 0.25)"
      glowIntensity={14}
      shadowColor="rgba(15, 23, 42, 0.5)"
      className="flex flex-col gap-6 border border-cyan-500/15 bg-slate-950/45"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-white">
            Outfit from Collection
          </h3>
          {outfitDescription && (
            <button
              onClick={toggleDescription}
              className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-md transition-colors"
              title={showDescription ? "Hide description" : "Show description"}
            >
              {showDescription ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {showDescription && outfitDescription && (
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 mb-3">
            <p className="text-sm leading-relaxed text-slate-300">
              {outfitDescription}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-slate-700/40 bg-slate-900/50 text-sm text-slate-400">
            No items listed for this outfit yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {items.map((item, idx) => (
              <OutfitItemCard key={item.itemId} item={item} index={idx} />
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

