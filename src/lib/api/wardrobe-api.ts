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
    } catch (error) {
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
    color: string;
    aiDescription: string;
    weatherSuitable: string;
    condition: string;
    pattern: string;
    fabric: string;
    imageRemBgURL: string;
  }> {
    const formData = new FormData();
    formData.append("file", file, file.name);

    const response = await apiClient.post("/items/summary", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Based on the logs, the API returns the data directly in response.data
    // But looking at the curl example, it should be response.data.data
    // Let's check both cases
    const apiResponse = response.data;

    if (apiResponse.data) {
      // Case 1: { statusCode, message, data: { actualData } }
      return apiResponse.data;
    } else {
      // Case 2: Direct data { color, aiDescription, ... }
      return apiResponse;
    }
  }
}

export const wardrobeAPI = new WardrobeAPI();
