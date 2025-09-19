import { create } from "zustand";
import { WardrobeItem } from "@/types";
import { wardrobeAPI, type ApiWardrobeItem, type CreateWardrobeItemRequest } from "@/lib/api/wardrobe-api";
import { generateDemoItems } from "@/lib/utils/image-utils";

interface WardrobeFilters {
  category?: "top" | "bottom" | "shoes" | "outer" | "accessory";
  color?: string;
  season?: "spring" | "summer" | "fall" | "winter";
}

interface WardrobeStore {
  items: WardrobeItem[];
  filters: WardrobeFilters;
  isLoading: boolean;
  filteredItems: WardrobeItem[];
  error: string | null;
  addItem: (item: CreateWardrobeItemRequest) => Promise<void>;
  removeItem: (id: string) => void;
  updateItem: (id: string, item: Partial<WardrobeItem>) => Promise<void>;
  setFilters: (filters: WardrobeFilters) => void;
  clearFilters: () => void;
  fetchItems: () => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  createDemoItems: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

// Helper function to filter items
const filterItems = (
  items: WardrobeItem[],
  filters: WardrobeFilters
): WardrobeItem[] => {
  return items.filter((item) => {
    if (filters.category && item.type !== filters.category) return false;
    if (filters.color && !item.colors?.includes(filters.color)) return false;
    if (filters.season && !item.seasons?.includes(filters.season)) return false;
    return true;
  });
};

export const useWardrobeStore = create<WardrobeStore>((set, get) => ({
  items: [],
  filters: {},
  isLoading: false,
  filteredItems: [],
  error: null,

  // Fetch items from API
  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const apiItems = await wardrobeAPI.getItems();
      const items = apiItems.map(apiItemToWardrobeItem);
      set({
        items,
        isLoading: false,
        filteredItems: filterItems(items, get().filters),
      });
    } catch (error) {
      console.error("Failed to fetch items:", error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch items" 
      });
    }
  },

  // Add new item via API
  addItem: async (itemData) => {
    set({ isLoading: true, error: null });
    try {
      const newApiItem = await wardrobeAPI.createItem(itemData);
      const newItem = apiItemToWardrobeItem(newApiItem);
      
      set((state) => {
        const newItems = [...state.items, newItem];
        return {
          items: newItems,
          isLoading: false,
          filteredItems: filterItems(newItems, state.filters),
        };
      });
    } catch (error) {
      console.error("Failed to add item:", error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to add item" 
      });
      throw error;
    }
  },

  // Remove item from local state (optimistic update)
  removeItem: (id) =>
    set((state) => {
      const newItems = state.items.filter((item) => item.id !== id);
      return {
        items: newItems,
        filteredItems: filterItems(newItems, state.filters),
      };
    }),

  // Update item via API
  updateItem: async (id, updatedData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedApiItem = await wardrobeAPI.updateItem(id, updatedData);
      const updatedItem = apiItemToWardrobeItem(updatedApiItem);
      
      set((state) => {
        const newItems = state.items.map((item) =>
          item.id === id ? updatedItem : item
        );
        return {
          items: newItems,
          isLoading: false,
          filteredItems: filterItems(newItems, state.filters),
        };
      });
    } catch (error) {
      console.error("Failed to update item:", error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to update item" 
      });
      throw error;
    }
  },

  // Delete item via API
  deleteItem: async (id) => {
    try {
      await wardrobeAPI.deleteItem(id);
      set((state) => {
        const newItems = state.items.filter((item) => item.id !== id);
        return {
          items: newItems,
          filteredItems: filterItems(newItems, state.filters),
        };
      });
    } catch (error) {
      console.error("Failed to delete item:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to delete item" 
      });
      throw error;
    }
  },

  // Create demo items
  createDemoItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const demoItems = generateDemoItems();
      
      // Add all demo items to API
      const promises = demoItems.map(item => wardrobeAPI.createItem(item));
      await Promise.all(promises);
      
      // Refresh items from API
      await get().fetchItems();
    } catch (error) {
      console.error("Failed to create demo items:", error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to create demo items" 
      });
      throw error;
    }
  },

  // Filter functionality
  setFilters: (filters) =>
    set((state) => ({
      filters,
      filteredItems: filterItems(state.items, filters),
    })),

  clearFilters: () =>
    set((state) => ({
      filters: {},
      filteredItems: state.items,
    })),

  // Search functionality
  searchQuery: "",
  setSearchQuery: (query: string) => set({ searchQuery: query }),
}));

// Helper function to convert API item to WardrobeItem
const apiItemToWardrobeItem = (apiItem: ApiWardrobeItem): WardrobeItem => {
  const converted = {
    id: apiItem.id,
    name: apiItem.name,
    type: apiItem.type,
    imageUrl: apiItem.imageUrl,
    brand: apiItem.brand,
    colors: apiItem.colors,
    seasons: apiItem.seasons,
    occasions: apiItem.occasions,
    status: apiItem.status,
    // Additional fields for ItemCard compatibility
    category: apiItem.type, // Map type to category
    color: apiItem.colors?.[0] || '', // Take first color
    season: apiItem.seasons?.[0] || '', // Take first season
    tags: [], // Default empty array for tags
  };
  
  console.log('API Item:', apiItem);
  console.log('Converted Item:', converted);
  
  return converted;
};
