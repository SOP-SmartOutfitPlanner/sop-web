import { apiClient } from "./client";

// Category mapping for item types
export const CATEGORY_MAPPING = {
  top: { id: 1, name: "Top" },
  bottom: { id: 2, name: "Bottom" },
  shoes: { id: 3, name: "Shoes" },
  outer: { id: 4, name: "Outerwear" },
  accessory: { id: 5, name: "Accessory" },
  dress: { id: 6, name: "Dress" },
  underwear: { id: 7, name: "Underwear" },
  default: { id: 1, name: "General" },
} as const;

export type ItemType = keyof typeof CATEGORY_MAPPING;

// Helper function to get category info
export function getCategoryInfo(type: string) {
  const categoryKey = type.toLowerCase() as ItemType;
  return CATEGORY_MAPPING[categoryKey] || CATEGORY_MAPPING.default;
}

// Image summary API interfaces
export interface ImageSummaryResponse {
  statusCode: number;
  message: string;
  data: {
    color: string;
    aiDescription: string;
    weatherSuitable: string;
    condition: string;
    pattern: string;
    fabric: string;
    imageRemBgURL: string;
  };
}

// API wardrobe item interface matching the real API
export interface ApiWardrobeItem {
  userId: number;
  userDisplayName?: string;
  name: string;
  categoryId: number;
  categoryName: string;
  color: string;
  aiDescription: string;
  brand?: string;
  frequencyWorn?: string;
  lastWornAt?: string;
  imgUrl: string;
  weatherSuitable: string;
  condition: string;
  pattern: string;
  fabric: string;
  tag?: string;
  id?: number; // Optional as it might not be present in all responses
  createdAt?: string;
  updatedAt?: string;
}

// API response with pagination
export interface ApiItemsResponse {
  data: ApiWardrobeItem[];
  metaData: {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface CreateWardrobeItemRequest {
  userId: number;
  name: string;
  categoryId: number;
  categoryName: string;
  color: string;
  aiDescription: string;
  brand?: string;
  frequencyWorn?: string;
  lastWornAt?: string;
  imgUrl: string;
  weatherSuitable: string;
  condition: string;
  pattern: string;
  fabric: string;
  tag?: string;
  // Relational IDs
  styleIds?: number[];
  occasionIds?: number[];
  seasonIds?: number[];
}

class WardrobeAPI {
  /**
   * Get all wardrobe items for current user
   */
  async getItems(): Promise<ApiWardrobeItem[]> {
    // Get userId from localStorage token
    const userId = this.getUserIdFromToken();

    if (!userId) {
      return [];
    }

    // New endpoint: /items/user/{userId}
    const response = await apiClient.get(`/items/user/${userId}`);

    // API returns { statusCode, message, data: { data: [...], metaData: {...} } }
    const apiData = response.data.data;

    // Handle different response structures
    let items: ApiWardrobeItem[] = [];
    if (apiData && typeof apiData === "object") {
      // Case 1: Paginated response with data.data array
      if (apiData.data && Array.isArray(apiData.data)) {
        items = apiData.data;
      }
      // Case 2: Direct array response
      else if (Array.isArray(apiData)) {
        items = apiData;
      }
    }

    return items;
  }

  /**
   * Get user ID from JWT token in localStorage
   * @private
   */
  private getUserIdFromToken(): number | null {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return null;

      // Decode JWT token (format: header.payload.signature)
      const payload = JSON.parse(atob(token.split(".")[1]));

      // Backend uses "UserId" (capital U) in JWT, not "id"
      const userId = payload?.UserId
        ? parseInt(payload.UserId)
        : payload?.id
        ? parseInt(payload.id)
        : null;

      return userId;
    } catch {
      return null;
    }
  }

  /**
   * Get specific wardrobe item
   */
  async getItem(id: number): Promise<ApiWardrobeItem> {
    const response = await apiClient.get(`/items/${id}`);
    return response.data.data;
  }

  /**
   * Create new wardrobe item
   */
  async createItem(item: CreateWardrobeItemRequest): Promise<ApiWardrobeItem> {
    const response = await apiClient.post("/items", item);
    return response.data.data;
  }

  /**
   * Update wardrobe item
   */
  async updateItem(
    id: number,
    item: Partial<CreateWardrobeItemRequest>
  ): Promise<ApiWardrobeItem> {
    const response = await apiClient.put(`/items/${id}`, item);
    return response.data.data;
  }

  /**
   * Delete wardrobe item
   */
  async deleteItem(id: number): Promise<void> {
    await apiClient.delete(`/items/${id}`);
  }

  /**
   * Get AI summary of clothing item from image
   */
  async getImageSummary(file: File): Promise<{
    name: string;
    colors: { name: string; hex: string }[];
    aiDescription: string;
    weatherSuitable: string;
    condition: string;
    pattern: string;
    fabric: string;
    imageRemBgURL: string;
    category: { id: number; name: string };
    styles: { id: number; name: string }[];
    occasions: { id: number; name: string }[];
    seasons: { id: number; name: string }[];
  }> {
    const formData = new FormData();
    formData.append("file", file, file.name);

    const response = await apiClient.post("/items/analysis", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // API returns { statusCode, message, data: { actualData } }
    const apiResponse = response.data;

    let result;
    if (apiResponse.data) {
      result = apiResponse.data;
    } else {
      // Fallback: Direct data { name, colors, ... }
      result = apiResponse;
    }

    return result;
  }

  /**
   * Get all available styles
   */
  async getStyles(): Promise<
    { id: number; name: string; description?: string }[]
  > {
    try {
      const response = await apiClient.get("/styles");

      // API returns { data: [...], metaData: {...} } directly
      const styles = response.data?.data || [];
      return styles;
    } catch (error) {
      console.error("❌ Failed to fetch styles:", error);
      return [];
    }
  }

  /**
   * Get all available seasons
   */
  async getSeasons(): Promise<{ id: number; name: string }[]> {
    try {
      const response = await apiClient.get("/seasons");

      // API returns { data: [...], metaData: {...} } directly
      const seasons = response.data?.data || [];
      return seasons;
    } catch (error) {
      console.error("❌ Failed to fetch seasons:", error);
      return [];
    }
  }

  /**
   * Get all available occasions
   */
  async getOccasions(): Promise<{ id: number; name: string }[]> {
    try {
      const response = await apiClient.get("/occasions");

      // API returns { data: [...], metaData: {...} } directly
      const occasions = response.data?.data || [];
      return occasions;
    } catch (error) {
      console.error("❌ Failed to fetch occasions:", error);
      return [];
    }
  }

  /**
   * Get all available categories
   */
  async getCategories(): Promise<{ id: number; name: string }[]> {
    try {
      const response = await apiClient.get("/categories/root");

      // API returns { data: [...], metaData: {...} } directly
      const categories = response.data?.data || [];
      return categories;
    } catch (error) {
      console.error("❌ Failed to fetch categories:", error);
      return [];
    }
  }
}

export const wardrobeAPI = new WardrobeAPI();
