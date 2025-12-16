"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Shirt, Bookmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import GlassCard from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import type {
  CollectionItemDetail,
  CollectionOutfit,
  CollectionOutfitItem,
} from "@/lib/api";
import { CollectionItemDetailDialog } from "./CollectionItemDetailDialog";
import { useSaveOutfitFromCollection } from "@/hooks/useCollectionMutations";
import { useAuthStore } from "@/store/auth-store";

interface OutfitItemCardProps {
  item: CollectionItemDetail;
  index: number;
  onSelect?: (item: CollectionItemDetail) => void;
}

function OutfitItemCard({ item, index, onSelect }: OutfitItemCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(item)}
      className="group w-full rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      aria-label={`Xem chi tiết ${item.name}`}
    >
      <div className="flex flex-col gap-3">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-900/10 transition group-hover:border-cyan-400/40 group-hover:shadow-[0_0_25px_rgba(34,211,238,0.25)]">
          {item.imgUrl ? (
            <Image
              src={item.imgUrl}
              alt={item.name}
              fill
              className="object-cover transition group-hover:scale-[1.02]"
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
    </button>
  );
}

interface OutfitCardProps {
  outfit: CollectionOutfitItem | null;
  entry: CollectionOutfit;
  items: CollectionItemDetail[];
  collectionId: number;
  isOwner?: boolean;
}

export function OutfitCard({
  outfit,
  entry,
  items,
  collectionId,
  isOwner = false,
}: OutfitCardProps) {
  const { user } = useAuthStore();
  const [showDescription, setShowDescription] = useState(true);
  const [selectedItem, setSelectedItem] = useState<CollectionItemDetail | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);

  // Debug logging
  console.log("OutfitCard render - outfit:", outfit, "outfitId:", outfit?.id);

  const saveOutfitMutation = useSaveOutfitFromCollection(
    outfit?.id ?? 0,
    collectionId,
    outfit?.isSavedFromCollection
  );

  const handleSaveOutfit = useCallback(() => {
    if (!user?.id) {
      toast.error("Please login to save outfits");
      return;
    }
    if (!outfit) {
      console.error("Outfit is null or undefined");
      toast.error("Outfit not found");
      return;
    }
    if (typeof outfit.id !== "number") {
      console.error("Invalid outfit id:", outfit.id, "Full outfit:", outfit);
      toast.error("Invalid outfit data");
      return;
    }
    console.log("Saving outfit:", outfit.id, "from collection:", collectionId);
    saveOutfitMutation.mutate();
  }, [user?.id, outfit, collectionId, saveOutfitMutation]);

  const toggleDescription = useCallback(() => {
    setShowDescription((prev) => !prev);
  }, []);

  const handleSelectItem = useCallback((item: CollectionItemDetail) => {
    setSelectedItem(item);
    setDetailOpen(true);
  }, []);

  const handleDetailOpenChange = useCallback((open: boolean) => {
    setDetailOpen(open);
    if (!open) {
      setSelectedItem(null);
    }
  }, []);

  const outfitDescription = outfit?.description || entry.description;

  return (
    <GlassCard
      padding="1.75rem"
      blur="18px"
      glowColor="rgba(59, 130, 246, 0.4)"
      glowIntensity={14}
      shadowColor="rgba(15, 23, 42, 0.5)"
      className="flex flex-col gap-6 border border-cyan-500/20 "
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-white">
            {outfit?.name || "Outfit from Collection"}
          </h3>
          <div className="flex items-center gap-2">
            {/* Save/Unsave Outfit Button - Hide if user owns the collection */}
            {outfit && !isOwner && (
              <button
                onClick={handleSaveOutfit}
                disabled={saveOutfitMutation.isPending}
                className={cn(
                  "group inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                  outfit.isSavedFromCollection
                    ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                    : "border-blue-400/60 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                title={
                  outfit.isSavedFromCollection
                    ? "Remove from saved"
                    : "Save outfit"
                }
              >
                {saveOutfitMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Bookmark
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110",
                      outfit.isSavedFromCollection && "fill-current"
                    )}
                  />
                )}
                <span>{outfit.isSavedFromCollection ? "Saved" : "Save"}</span>
              </button>
            )}
            {outfitDescription && (
              <button
                onClick={toggleDescription}
                className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-md transition-colors"
                title={
                  showDescription ? "Hide description" : "Show description"
                }
              >
                {showDescription ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
        {showDescription && outfitDescription && (
          <div className="rounded-lg border border-cyan-500/30  p-3 mb-3">
            <p className="text-sm leading-relaxed text-slate-300">
              {outfitDescription}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border  text-sm text-slate-400">
            No items listed for this outfit yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {items.map((item, idx) => (
              <OutfitItemCard
                key={item.itemId}
                item={item}
                index={idx}
                onSelect={handleSelectItem}
              />
            ))}
          </div>
        )}
      </div>

      <CollectionItemDetailDialog
        open={detailOpen}
        onOpenChange={handleDetailOpenChange}
        itemId={selectedItem?.itemId ?? null}
        initialItem={selectedItem ?? undefined}
      />
    </GlassCard>
  );
}
