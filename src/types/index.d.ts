export type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

export type WardrobeItem = {
  id: string;
  name: string;
  type: "top" | "bottom" | "shoes" | "outer" | "accessory";
  imageUrl: string;
  brand?: string;
  colors: string[];
  seasons: ("spring" | "summer" | "fall" | "winter")[];
  occasions: ("casual" | "formal" | "sport" | "travel")[];
  status: "active" | "archived";
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

export type Season = "spring" | "summer" | "fall" | "winter" | "all-season";

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
