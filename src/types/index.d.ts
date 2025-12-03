export type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

export type TypeKind = "top" | "bottom" | "shoes" | "outer" | "accessory";

export type Season = "spring" | "summer" | "fall" | "winter";

export type Occasion =
  | "casual"
  | "formal"
  | "sport"
  | "travel"
  | "work"
  | "party"
  | "date"
  | "vacation"
  | "smart";

export type ColorInfo = {
  name: string;
  hex: string;
};

export type WardrobeItem = {
  id: string;
  userId?: string;
  name: string;
  type: TypeKind;
  imageUrl: string;
  brand?: string;
  description?: string;
  colors: ColorInfo[];
  seasons: Season[] | Array<{ id: number; name: string }>;
  occasions: Occasion[] | Array<{ id: number; name: string }>;
  status: "ok" | "laundry" | "donate" | "archived" | "active";
  timesWorn?: number;
  frequencyWorn?: string;
  lastWorn?: string; // ISO date string
  lastWornAt?: string; // ISO date string
  tags?: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // Additional fields from API
  aiDescription?: string;
  weatherSuitable?: string;
  condition?: string;
  pattern?: string;
  fabric?: string;
  isAnalyzed?: boolean;
  aiConfidence?: number;
  styles?: Array<{ id: number; name: string }>;
  // Additional fields for UI compatibility
  category?: Category; // Mapped from type
  color?: string; // First color from colors array
  season?: Season; // First season from seasons array
};

export interface Category {
  id: number;
  name: string;
  icon?: string;
}

export interface Filter {
  category?: Category;
  color?: string;
  season?: Season;
  brand?: string;
  tags?: string[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  statusCode: number;
}
