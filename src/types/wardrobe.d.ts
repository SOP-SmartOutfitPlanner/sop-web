import { WardrobeItem, Filter, Season } from "./index";

export interface WardrobeState {
  items: WardrobeItem[];
  filteredItems: WardrobeItem[];
  isLoading: boolean;
  error: string | null;
  filters: Filter;
  searchQuery: string;
}

export interface WardrobeStore extends WardrobeState {
  // Item management
  fetchItems: () => Promise<void>;
  addItem: (
    item: Omit<WardrobeItem, "id" | "userId" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateItem: (id: string, updates: Partial<WardrobeItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;

  // Filtering and search
  setFilters: (filters: Partial<Filter>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  applyFilters: () => void;

  // UI state
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export interface CreateItemFormData {
  name: string;
  category: string;
  color: string;
  brand?: string;
  season: Season;
  description?: string;
  tags: string[];
  image?: File;
}

export interface ItemCardProps {
  item: WardrobeItem;
  onEdit?: (item: WardrobeItem) => void;
  onDelete?: (id: string) => void;
  onView?: (item: WardrobeItem) => void;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
}

export interface ItemGridProps {
  items?: WardrobeItem[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export interface FiltersProps {
  onFiltersChange?: (filters: Filter) => void;
}
