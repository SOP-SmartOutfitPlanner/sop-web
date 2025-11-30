"use client";

interface ViewToggleProps {
  view: "wardrobe" | "outfit";
  totalOutfits: number;
  totalWardrobeItems: number;
  isProcessing: boolean;
  onViewChange: (view: "wardrobe" | "outfit") => void;
}

export function ViewToggle({
  view,
  totalOutfits,
  totalWardrobeItems,
  isProcessing,
  onViewChange,
}: ViewToggleProps) {
  return (
    <div className="flex gap-2 p-1 rounded-lg bg-white/5 border border-white/10">
      <button
        onClick={() => onViewChange("outfit")}
        disabled={isProcessing}
        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          view === "outfit"
            ? "bg-white/20 text-white shadow-lg"
            : "text-white/60 hover:text-white/80"
        }`}
        title="Select items from your created outfits"
      >
        From My Outfits ({totalOutfits})
      </button>
      <button
        onClick={() => onViewChange("wardrobe")}
        disabled={isProcessing}
        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          view === "wardrobe"
            ? "bg-white/20 text-white shadow-lg"
            : "text-white/60 hover:text-white/80"
        }`}
        title="Select items from all wardrobe with filters"
      >
        From Wardrobe ({totalWardrobeItems})
      </button>
    </div>
  );
}
