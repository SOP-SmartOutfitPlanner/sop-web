import { create } from "zustand";
import { WardrobeItem } from "@/types";
import { wardrobeAPI, type ApiWardrobeItem, type CreateWardrobeItemRequest } from "@/lib/api/wardrobe-api";
import { generateDemoItems } from "@/lib/utils/image-utils";

interface WardrobeFilters {
  category?: "top" | "bottom" | "shoes" | "outer" | "accessory";
  color?: string;
  season?: "spring" | "summer" | "fall" | "winter";
  // Advanced filters
  types?: string[];
  seasons?: string[];
  occasions?: string[];
  colors?: string[];
  // Quick filter
  quickFilter?: string; // "all", "casual", "work", etc.
}

interface WardrobeStore {
  items: WardrobeItem[];
  filters: WardrobeFilters;
  isLoading: boolean;
  filteredItems: WardrobeItem[];
  error: string | null;
  sortBy: string;
  selectedItems: string[];
  isSelectionMode: boolean;
  addItem: (item: CreateWardrobeItemRequest) => Promise<void>;
  removeItem: (id: string) => void;
  updateItem: (id: string, item: Partial<WardrobeItem>) => Promise<void>;
  setFilters: (filters: WardrobeFilters) => void;
  clearFilters: () => void;
  setSortBy: (sortBy: string) => void;
  fetchItems: () => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  createDemoItems: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Bulk selection
  toggleItemSelection: (id: string) => void;
  clearSelection: () => void;
  selectAllVisible: () => void;
  bulkDeleteItems: (ids: string[]) => Promise<void>;
  // Selection mode
  toggleSelectionMode: () => void;
  setSelectionMode: (mode: boolean) => void;
}

// Helper function to filter items
const filterItems = (
  items: WardrobeItem[],
  filters: WardrobeFilters,
  searchQuery: string = ""
): WardrobeItem[] => {
  return items.filter((item) => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = item.name.toLowerCase().includes(query);
      const matchesBrand = item.brand?.toLowerCase().includes(query);
      const matchesType = item.type.toLowerCase().includes(query);
      if (!matchesName && !matchesBrand && !matchesType) return false;
    }

    // Basic filters
    if (filters.category && item.type !== filters.category) return false;
    if (filters.color && !item.colors?.includes(filters.color)) return false;
    if (filters.season && !item.seasons?.includes(filters.season)) return false;
    
    // Quick filter (occasions and seasons)
    if (filters.quickFilter && filters.quickFilter !== "all") {
      const hasOccasion = item.occasions?.includes(filters.quickFilter as any);
      const hasSeason = item.seasons?.includes(filters.quickFilter as any);
      if (!hasOccasion && !hasSeason) return false;
    }

    // Advanced filters
    if (filters.types?.length && !filters.types.includes(item.type)) return false;
    if (filters.seasons?.length && !filters.seasons.some(s => item.seasons?.includes(s as any))) return false;
    if (filters.occasions?.length && !filters.occasions.some(o => item.occasions?.includes(o as any))) return false;
    if (filters.colors?.length && !filters.colors.some(c => item.colors?.some(ic => ic.toLowerCase().includes(c.toLowerCase())))) return false;

    return true;
  });
};

// Helper function to sort items
const sortItems = (items: WardrobeItem[], sortBy: string): WardrobeItem[] => {
  const sortedItems = [...items];
  
  switch (sortBy) {
    case "newest":
      // For now, sort by ID (newer items have higher IDs in mock API)
      return sortedItems.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    
    case "most-worn":
      // TODO: Implement when we have wear tracking
      return sortedItems; // For now, no change
    
    case "least-worn":
      // TODO: Implement when we have wear tracking  
      return sortedItems; // For now, no change
    
    case "a-z":
      return sortedItems.sort((a, b) => a.name.localeCompare(b.name));
    
    case "z-a":
      return sortedItems.sort((a, b) => b.name.localeCompare(a.name));
    
    default:
      return sortedItems;
  }
};

export const useWardrobeStore = create<WardrobeStore>((set, get) => ({
  items: [],
  filters: {},
  isLoading: false,
  filteredItems: [],
  error: null,
  sortBy: "newest",
  selectedItems: [],
  isSelectionMode: false,

  // Fetch items from API
  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const apiItems = await wardrobeAPI.getItems();
      const items = apiItems.map(apiItemToWardrobeItem);
      const state = get();
      const filtered = filterItems(items, state.filters, state.searchQuery);
      const sorted = sortItems(filtered, state.sortBy);
      set({
        items,
        isLoading: false,
        filteredItems: sorted,
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
        const filtered = filterItems(newItems, state.filters, state.searchQuery);
        const sorted = sortItems(filtered, state.sortBy);
        return {
          items: newItems,
          isLoading: false,
          filteredItems: sorted,
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
        const filtered = filterItems(newItems, state.filters, state.searchQuery);
        const sorted = sortItems(filtered, state.sortBy);
        return {
          items: newItems,
          filteredItems: sorted,
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
    set((state) => {
      const filtered = filterItems(state.items, filters, state.searchQuery);
      const sorted = sortItems(filtered, state.sortBy);
      return {
        filters,
        filteredItems: sorted,
      };
    }),

  clearFilters: () =>
    set((state) => {
      const filtered = filterItems(state.items, {}, state.searchQuery);
      const sorted = sortItems(filtered, state.sortBy);
      return {
        filters: {},
        filteredItems: sorted,
      };
    }),

  // Sorting functionality
  setSortBy: (sortBy) =>
    set((state) => {
      const filtered = filterItems(state.items, state.filters, state.searchQuery);
      const sorted = sortItems(filtered, sortBy);
      return {
        sortBy,
        filteredItems: sorted,
      };
    }),

  // Search functionality
  searchQuery: "",
  setSearchQuery: (query: string) =>
    set((state) => {
      const filtered = filterItems(state.items, state.filters, query);
      const sorted = sortItems(filtered, state.sortBy);
      return {
        searchQuery: query,
        filteredItems: sorted,
      };
    }),

  // Bulk selection functionality
  toggleItemSelection: (id: string) =>
    set((state) => ({
      selectedItems: state.selectedItems.includes(id)
        ? state.selectedItems.filter(itemId => itemId !== id)
        : [...state.selectedItems, id],
    })),

  clearSelection: () =>
    set({ selectedItems: [] }),

  selectAllVisible: () =>
    set((state) => ({
      selectedItems: state.filteredItems.map(item => item.id),
    })),

  // Selection mode functions
  toggleSelectionMode: () =>
    set((state) => ({
      isSelectionMode: !state.isSelectionMode,
      selectedItems: state.isSelectionMode ? [] : state.selectedItems, // Clear selection when exiting
    })),

  setSelectionMode: (mode: boolean) =>
    set({
      isSelectionMode: mode,
      selectedItems: mode ? [] : [], // Clear selection when changing mode
    }),

  bulkDeleteItems: async (ids: string[]) => {
    set({ isLoading: true, error: null });
    try {
      // Delete all items from API
      const deletePromises = ids.map(id => wardrobeAPI.deleteItem(id));
      await Promise.all(deletePromises);
      
      // Update local state
      set((state) => {
        const newItems = state.items.filter(item => !ids.includes(item.id));
        const filtered = filterItems(newItems, state.filters, state.searchQuery);
        const sorted = sortItems(filtered, state.sortBy);
        return {
          items: newItems,
          filteredItems: sorted,
          selectedItems: [], // Clear selection after delete
          isLoading: false,
        };
      });
    } catch (error) {
      console.error("Failed to delete items:", error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to delete items" 
      });
      throw error;
    }
  },
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
