// UI Constants
export const GRID_BREAKPOINTS = {
  MOBILE: 'grid-cols-2',
  TABLET: 'sm:grid-cols-3',
  DESKTOP: 'lg:grid-cols-4',
  WIDE: 'xl:grid-cols-5',
} as const;

export const LAYOUT_COLUMNS = {
  CONTENT: 'lg:col-span-3',
  SIDEBAR: 'lg:col-span-1',
} as const;

// Filter Constants
export const DEFAULT_FILTER = 'all';

export const ADVANCED_FILTER_DEFAULTS = {
  types: [] as string[],
  seasons: [] as string[],
  occasions: [] as string[],
  colors: [] as string[],
};

// Sorting Options
export const SORT_OPTIONS = {
  NEWEST: 'newest',
  MOST_WORN: 'most-worn',
  LEAST_WORN: 'least-worn',
  A_TO_Z: 'a-z',
  Z_TO_A: 'z-a',
} as const;

// UI Messages
export const MESSAGES = {
  DELETE_CONFIRM: (count: number) => 
    `Are you sure you want to delete ${count} item${count > 1 ? 's' : ''}?`,
  LOADING: 'Loading items...',
  NO_ITEMS: 'No items found',
  EMPTY_WARDROBE: 'Start adding items to your wardrobe to see them here.',
  ERROR_DELETE: 'Failed to delete items',
  ERROR_FETCH: 'Failed to fetch items',
} as const;

// Animation & Timing
export const TIMING = {
  DEBOUNCE_SEARCH: 300,
  MODAL_ANIMATION: 200,
  BULK_ACTION_DELAY: 1500,
} as const;
