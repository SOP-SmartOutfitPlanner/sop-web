import { WardrobeItem, Filter, Season, TypeKind, Occasion } from "./index";

export interface WardrobeFilters {
  q?: string;
  collectionId?: string;
  sort?: string;
  types?: TypeKind[];
  seasons?: Season[];
  occasions?: Occasion[];
  colors?: string[];
}

export interface Collection {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface WardrobeState {
  items: WardrobeItem[];
  filteredItems: WardrobeItem[];
  isLoading: boolean;
  error: string | null;
  filters: Filter;
  searchQuery: string;
  hasInitialFetch: boolean;
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
  seasons: Season[];
  occasions: Occasion[];
  timesWorn: number;
  lastWorn?: string;
  status: Status;
  collections?: string[];
  addedAt: string;
}

export interface ItemCardProps {
  item: WardrobeItem;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onEdit?: (item: WardrobeItem) => void;
  onDelete?: (id: string) => void;
  onView?: (item: WardrobeItem) => void;
  onUseInOutfit?: (item: WardrobeItem) => void;
  showCheckbox?: boolean;
}

export interface ItemGridProps {
  items?: WardrobeItem[];
  isLoading?: boolean;
  emptyMessage?: string;
}

