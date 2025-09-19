import { create } from "zustand";
import { WardrobeItem } from "@/types";

interface WardrobeStore {
  items: WardrobeItem[];
  addItem: (item: WardrobeItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, item: Partial<WardrobeItem>) => void;
}

export const useWardrobeStore = create<WardrobeStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  updateItem: (id, updatedItem) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item
      ),
    })),
}));
