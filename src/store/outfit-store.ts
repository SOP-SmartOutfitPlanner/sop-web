import { create } from "zustand";
import { Outfit } from "@/types/outfit";

interface OutfitState {
  // Selected outfit for viewing/editing
  selectedOutfit: Outfit | null;
  setSelectedOutfit: (outfit: Outfit | null) => void;

  // Dialog states
  isCreateDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;

  isViewDialogOpen: boolean;
  setViewDialogOpen: (open: boolean) => void;

  // Selected items for creating outfit
  selectedItemIds: number[];
  toggleItemSelection: (itemId: number) => void;
  clearSelectedItems: () => void;
  setSelectedItems: (itemIds: number[]) => void;

  // Filter states
  showFavorites: boolean;
  setShowFavorites: (show: boolean) => void;

  showSaved: boolean;
  setShowSaved: (show: boolean) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useOutfitStore = create<OutfitState>((set) => ({
  // Selected outfit
  selectedOutfit: null,
  setSelectedOutfit: (outfit) => set({ selectedOutfit: outfit }),

  // Dialog states
  isCreateDialogOpen: false,
  setCreateDialogOpen: (open) => set({ isCreateDialogOpen: open }),

  isViewDialogOpen: false,
  setViewDialogOpen: (open) => set({ isViewDialogOpen: open }),

  // Selected items
  selectedItemIds: [],
  toggleItemSelection: (itemId) =>
    set((state) => ({
      selectedItemIds: state.selectedItemIds.includes(itemId)
        ? state.selectedItemIds.filter((id) => id !== itemId)
        : [...state.selectedItemIds, itemId],
    })),
  clearSelectedItems: () => set({ selectedItemIds: [] }),
  setSelectedItems: (itemIds) => set({ selectedItemIds: itemIds }),

  // Filters
  showFavorites: false,
  setShowFavorites: (show) => set({ showFavorites: show }),

  showSaved: false,
  setShowSaved: (show) => set({ showSaved: show }),

  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
