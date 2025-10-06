import { create } from "zustand";
import Fuse from "fuse.js";
import { WardrobeItem } from "@/types";
import { WardrobeFilters } from "@/types/wardrobe";
import {
  wardrobeAPI,
  type ApiWardrobeItem,
  type CreateWardrobeItemRequest,
} from "@/lib/api/wardrobe-api";

interface WardrobeStore {
  items: WardrobeItem[];
  filters: WardrobeFilters;
  isLoading: boolean;
  filteredItems: WardrobeItem[];
  error: string | null;
  sortBy: string;
  selectedItems: string[];
  isSelectionMode: boolean;
  hasInitialFetch: boolean;
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

// Fuse.js configuration for filtering
const fuseOptions = {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'brand', weight: 0.3 },
    { name: 'colors', weight: 0.2 },
    { name: 'tags', weight: 0.1 },
    { name: 'type', weight: 0.1 },
    { name: 'seasons', weight: 0.05 },
    { name: 'occasions', weight: 0.05 },
  ],
  threshold: 0.4, // More lenient for filtering
  location: 0,
  distance: 100,
  minMatchCharLength: 2,
  includeScore: true,
  ignoreLocation: true,
};

// Helper function to filter items with Fuse.js
const filterItems = (
  items: WardrobeItem[],
  filters: WardrobeFilters,
  searchQuery: string = ""
): WardrobeItem[] => {
  let filteredItems = [...items];

  // Fuzzy search filter using Fuse.js
  if (searchQuery && searchQuery.length >= 2) {
    const fuse = new Fuse(items, fuseOptions);
    const fuseResults = fuse.search(searchQuery);
    
    // Extract items from Fuse results
    const searchMatchIds = new Set(fuseResults.map(result => result.item.id));
    filteredItems = items.filter(item => searchMatchIds.has(item.id));
  }

  // Apply additional filters to the search results
  const result = filteredItems.filter((item) => {
    // Occasion filtering
    if (
      filters.occasions?.length &&
      !filters.occasions.some((o) => item.occasions?.includes(o as "casual" | "smart" | "formal" | "sport" | "travel"))
    )
      return false;

    // Collection filter - based on occasions or tags
    if (filters.collectionId && filters.collectionId !== "all") {
      const hasOccasion = item.occasions?.includes(filters.collectionId as "casual" | "smart" | "formal" | "sport" | "travel");
      const hasTag = item.tags?.includes(filters.collectionId);
      
      if (!hasOccasion && !hasTag) {
        return false;
      }
    }

    // Advanced filters
    if (filters.types?.length && !filters.types.includes(item.type))
      return false;
    if (
      filters.seasons?.length &&
      !filters.seasons.some((s) => item.seasons?.includes(s as "spring" | "summer" | "fall" | "winter"))
    )
      return false;
    if (
      filters.colors?.length &&
      !filters.colors.some((c) =>
        item.colors?.some((ic) => ic.toLowerCase().includes(c.toLowerCase()))
      )
    )
      return false;

    return true;
  });
  
  return result;
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
  hasInitialFetch: false,

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
        hasInitialFetch: true,
      });
    } catch (error) {
      console.error("Failed to fetch items:", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch items",
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
        const filtered = filterItems(
          newItems,
          state.filters,
          state.searchQuery
        );
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
        error: error instanceof Error ? error.message : "Failed to add item",
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
      // Convert string id to number for API call
      const numericId = parseInt(id);
      
      // Convert WardrobeItem fields to API format  
      const apiUpdateData: Partial<CreateWardrobeItemRequest> = {
        name: updatedData.name,
        color: updatedData.color || updatedData.colors?.[0],
        brand: updatedData.brand,
        imgUrl: updatedData.imageUrl,
        // Add other necessary fields as needed
      };
      
      const updatedApiItem = await wardrobeAPI.updateItem(
        numericId,
        apiUpdateData
      );
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
        error: error instanceof Error ? error.message : "Failed to update item",
      });
      throw error;
    }
  },

  // Delete item via API
  deleteItem: async (id) => {
    try {
      // Convert string id to number for API call
      const numericId = parseInt(id);
      await wardrobeAPI.deleteItem(numericId);
      set((state) => {
        const newItems = state.items.filter((item) => item.id !== id);
        const filtered = filterItems(
          newItems,
          state.filters,
          state.searchQuery
        );
        const sorted = sortItems(filtered, state.sortBy);
        return {
          items: newItems,
          filteredItems: sorted,
        };
      });
    } catch (error) {
      console.error("Failed to delete item:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to delete item",
      });
      throw error;
    }
  },

  // Create demo items (temporarily disabled for real API)
  createDemoItems: async () => {
    set({ isLoading: true, error: null });
    try {
    } catch (error) {
      console.error("Failed to create demo items:", error);
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create demo items",
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
      const filtered = filterItems(
        state.items,
        state.filters,
        state.searchQuery
      );
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
        ? state.selectedItems.filter((itemId) => itemId !== id)
        : [...state.selectedItems, id],
    })),

  clearSelection: () => set({ selectedItems: [] }),

  selectAllVisible: () =>
    set((state) => ({
      selectedItems: state.filteredItems.map((item) => item.id),
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
      const deletePromises = ids.map((id) => wardrobeAPI.deleteItem(parseInt(id)));
      await Promise.all(deletePromises);

      // Update local state
      set((state) => {
        const newItems = state.items.filter((item) => !ids.includes(item.id));
        const filtered = filterItems(
          newItems,
          state.filters,
          state.searchQuery
        );
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
        error:
          error instanceof Error ? error.message : "Failed to delete items",
      });
      throw error;
    }
  },
}));

// Helper function to convert API item to WardrobeItem
const apiItemToWardrobeItem = (apiItem: ApiWardrobeItem): WardrobeItem => {
  // Map categoryName to type for compatibility
  const getTypeFromCategory = (categoryName: string): "top" | "bottom" | "shoes" | "outer" | "accessory" => {
    const category = categoryName.toLowerCase();
    if (category.includes('top') || category.includes('shirt') || category.includes('áo')) return 'top';
    if (category.includes('bottom') || category.includes('pants') || category.includes('quần')) return 'bottom';
    if (category.includes('shoes') || category.includes('giày')) return 'shoes';
    if (category.includes('outer') || category.includes('jacket') || category.includes('coat')) return 'outer';
    return 'accessory';
  };

  // Parse weather suitable for seasons
  const parseSeasons = (weatherSuitable: string): ("spring" | "summer" | "fall" | "winter")[] => {
    const weather = weatherSuitable.toLowerCase();
    const seasons: ("spring" | "summer" | "fall" | "winter")[] = [];
    
    if (weather.includes('mùa hè') || weather.includes('summer') || weather.includes('nóng')) seasons.push('summer');
    if (weather.includes('mùa đông') || weather.includes('winter') || weather.includes('lạnh')) seasons.push('winter');
    if (weather.includes('mùa xuân') || weather.includes('spring')) seasons.push('spring');
    if (weather.includes('mùa thu') || weather.includes('fall') || weather.includes('mát')) seasons.push('fall');
    
    // Default to summer if no specific season found
    if (seasons.length === 0) seasons.push('summer');
    
    return seasons;
  };

  const type = getTypeFromCategory(apiItem.categoryName);
  const seasons = parseSeasons(apiItem.weatherSuitable);
  const occasions: ("casual" | "formal" | "sport" | "travel")[] = ["casual"]; // Default to casual

  const converted: WardrobeItem = {
    id: apiItem.id?.toString() || `${apiItem.userId}-${Date.now()}`, // Generate ID if not present
    userId: apiItem.userId.toString(),
    name: apiItem.name,
    type: type,
    imageUrl: apiItem.imgUrl,
    brand: apiItem.brand || "",
    colors: [apiItem.color], // Single color to array
    seasons: seasons,
    occasions: occasions,
    status: "active", // Default status
    // Additional fields for ItemCard compatibility
    category: type,
    color: apiItem.color,
    season: seasons[0],
    tags: apiItem.tag ? [apiItem.tag] : [],
    createdAt: apiItem.createdAt || new Date().toISOString(),
    updatedAt: apiItem.updatedAt || new Date().toISOString(),
  };

  return converted;
};
