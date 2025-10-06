import { apiClient } from "./client";

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
    const response = await apiClient.get('/items');
    
    // API returns { statusCode, message, data: { data: [...], metaData: {...} } }
    const apiData = response.data.data;
    
    // Handle different response structures
    let items: ApiWardrobeItem[] = [];
    
    if (apiData && typeof apiData === 'object') {
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
    const response = await apiClient.post('/items', item);
    return response.data.data;
  }

  /**
   * Update wardrobe item
   */
  async updateItem(id: number, item: Partial<CreateWardrobeItemRequest>): Promise<ApiWardrobeItem> {
    const response = await apiClient.put(`/items/${id}`, item);
    return response.data.data;
  }

  /**
   * Delete wardrobe item
   */
  async deleteItem(id: number): Promise<void> {
    await apiClient.delete(`/items/${id}`);
  }
}

export const wardrobeAPI = new WardrobeAPI();