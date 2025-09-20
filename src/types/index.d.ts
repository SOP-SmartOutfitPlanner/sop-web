export type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

export type TypeKind = "top" | "bottom" | "shoes" | "outer" | "accessory";

export type Season = "spring" | "summer" | "fall" | "winter";

export type Occasion = "casual" | "formal" | "sport" | "travel" | "work" | "party" | "date" | "vacation" | "smart";

export type WardrobeItem = {
  id: string;
  userId?: string;
  name: string;
  type: TypeKind;
  imageUrl: string;
  brand?: string;
  description?: string;
  colors: string[];
  seasons: Season[];
  occasions: Occasion[];
  status: "ok" | "laundry" | "donate" | "archived" | "active";
  timesWorn?: number;
  lastWorn?: string; // ISO date string
  tags?: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // Additional fields for UI compatibility
  category?: string; // Mapped from type
  color?: string; // First color from colors array
  season?: string; // First season from seasons array
};

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Filter {
  category?: string;
  color?: string;
  season?: string;
  brand?: string;
  tags?: string[];
}


export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
