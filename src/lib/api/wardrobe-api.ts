import { apiClient } from "./client";

// AI Analysis JSON structure
export interface AIAnalysisData {
  categoryId: number;
  colors: Array<{ name: string; hex: string }>;
  aiDescription: string;
  weatherSuitable: string;
  condition: string;
  pattern: string;
  fabric: string;
  styles: Array<{ id: number; name: string }>;
  occasions: Array<{ id: number; name: string }>;
  seasons: Array<{ id: number; name: string }>;
  confidence: number;
}

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
  categoryId?: number;
  categoryName?: string;
  category?: { id: number; name: string }; // Some endpoints return category as object
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
  // AI analysis fields
  aiConfidence?: number;
  isAnalyzed?: boolean;
  aiAnalyzeJson?: string; // JSON string containing AI analysis data
  // Relational arrays
  styles?: Array<{ id: number; name: string }>;
  occasions?: Array<{ id: number; name: string }>;
  seasons?: Array<{ id: number; name: string }>;
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

// New ItemCreateModel following the API specification
export interface ItemCreateModel {
  userId: number;
  name: string;
  categoryId: number;
  imgUrl: string; // Required - from image upload

  // Optional fields
  color?: string;
  brand?: string;
  aiDescription?: string;
  weatherSuitable?: string;
  condition?: string;
  pattern?: string;
  fabric?: string;
  frequencyWorn?: string;
  lastWornAt?: string; // ISO date

  // Optional relationships
  styleIds?: number[];
  occasionIds?: number[];
  seasonIds?: number[];
}

// Bulk upload models
export interface BulkItemRequestAutoModel {
  userId: number;
  imageURLs: string[]; // Array of uploaded image URLs
}

export interface BulkItemModel {
  imageURLs: string; // Note: singular - one URL per item
  categoryId: number;
}

export interface BulkItemRequestManualModel {
  userId: number;
  itemsUpload: BulkItemModel[];
}

// Item analysis request
export interface ItemModelRequest {
  itemIds: number[];
}

// Legacy type for backward compatibility
export interface CreateWardrobeItemRequest extends ItemCreateModel {
  categoryName?: string;
  tag?: string;
}

class WardrobeAPI {
  /**
   * Get all wardrobe items for current user with pagination and filters
   */
  async getItems(
    pageIndex: number = 1,
    pageSize: number = 10,
    filters?: {
      isAnalyzed?: boolean;
      categoryId?: number;
      seasonId?: number;
      styleId?: number;
      occasionId?: number;
      sortByDate?: 'asc' | 'desc';
      searchQuery?: string;
    }
  ): Promise<ApiItemsResponse> {
    // Get userId from localStorage token
    const userId = this.getUserIdFromToken();

    if (!userId) {
      return {
        data: [],
        metaData: {
          totalCount: 0,
          pageSize,
          currentPage: pageIndex,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      };
    }

    // Build query parameters
    const params: Record<string, string | number | boolean> = {
      "page-index": pageIndex,
      "page-size": pageSize,
    };

    // Add optional filter parameters
    if (filters?.isAnalyzed !== undefined) {
      params.IsAnalyzed = filters.isAnalyzed;
    }
    if (filters?.categoryId !== undefined) {
      params.CategoryId = filters.categoryId;
    }
    if (filters?.seasonId !== undefined) {
      params.SeasonId = filters.seasonId;
    }
    if (filters?.styleId !== undefined) {
      params.StyleId = filters.styleId;
    }
    if (filters?.occasionId !== undefined) {
      params.OccasionId = filters.occasionId;
    }
    if (filters?.sortByDate) {
      params.SortByDate = filters.sortByDate === 'asc' ? 0 : 1; // 0 = asc, 1 = desc
    }
    if (filters?.searchQuery) {
      params.search = filters.searchQuery;
    }

    // New endpoint: /items/user/{userId} with pagination params
    const response = await apiClient.get<{
      statusCode: number;
      message: string;
      data: {
        data: ApiWardrobeItem[];
        metaData: {
          totalCount: number;
          pageSize: number;
          currentPage: number;
          totalPages: number;
          hasNext: boolean;
          hasPrevious: boolean;
        };
      };
    }>(`/items/user/${userId}`, {
      params,
    });

    // API returns { statusCode, message, data: { data: [...], metaData: {...} } }
    // The apiClient already unwraps to response.data, so we access response.data.data
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return {
        data: response.data.data,
        metaData: response.data.metaData,
      };
    }

    // Fallback: check if it's a direct array (legacy, no pagination)
    if (Array.isArray(response?.data)) {
      return {
        data: response.data,
        metaData: {
          totalCount: response.data.length,
          pageSize: response.data.length,
          currentPage: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };
    }

    return {
      data: [],
      metaData: {
        totalCount: 0,
        pageSize,
        currentPage: pageIndex,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    };
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
    const response = await apiClient.get<{
      statusCode: number;
      message: string;
      data: ApiWardrobeItem;
    }>(`/items/${id}`);

    // Handle both direct data and nested data structure
    if (response.data) {
      return response.data;
    }

    return response as unknown as ApiWardrobeItem;
  }

  /**
   * Create new wardrobe item (Single Item Creation)
   * Phase 1: Upload image via minioAPI first to get imgUrl
   * Phase 2: Create item with the image URL
   */
  async createItem(item: ItemCreateModel): Promise<ApiWardrobeItem> {
    const response = await apiClient.post<{
      statusCode: number;
      message: string;
      data: ApiWardrobeItem;
    }>("/items", item);

    if (response.statusCode !== 200) {
      throw new Error(response.message || "Failed to create item");
    }

    return response.data;
  }

  /**
   * Bulk Upload (Auto Mode)
   * AI automatically categorizes items
   * Phase 1: Upload images first via minioAPI
   * Phase 2: Create items with auto categorization
   *
   * Response format (full success - 201):
   * { statusCode: 201, message: "Item created successfully",
   *   data: { count: 6, itemIds: [222, 223, ...] } }
   *
   * Response format (partial success - 207 Multi-Status):
   * { statusCode: 207, message: "Items created with some failures",
   *   data: { successfulItems: { count: 6, itemIds: [216, 217, ...] },
   *           failedItems: { count: 1, items: [{imageUrl, reason}] } } }
   *
   * Note: The API returns 404 for partial success, but the client interceptor
   * converts it to 207 Multi-Status for proper handling.
   */
  async bulkUploadAuto(
    data: BulkItemRequestAutoModel
  ): Promise<{
    itemIds: number[];
    failedItems?: Array<{ imageUrl: string; reason: string }>;
  }> {
    const response = await apiClient.post<{
      statusCode: number;
      message: string;
      data: {
        count?: number;
        itemIds?: number[];
        successfulItems?: { count: number; itemIds: number[] };
        failedItems?: { count: number; items: Array<{ imageUrl: string; reason: string }> };
      };
    }>("/items/bulk-upload/auto", data);

    // Case 1: Full success (statusCode 201)
    if (response.statusCode === 201 && response.data.itemIds) {
      // Convert to array if it's an object with numeric keys
      const itemIds = Array.isArray(response.data.itemIds)
        ? response.data.itemIds
        : Object.values(response.data.itemIds) as number[];
      return { itemIds };
    }

    // Case 2: Partial success (statusCode 207 - some items failed)
    // Note: Originally 404 from API, but converted to 207 by client interceptor
    if (response.statusCode === 207 && response.data.successfulItems) {
      // Convert to array if it's an object with numeric keys
      const itemIds = Array.isArray(response.data.successfulItems.itemIds)
        ? response.data.successfulItems.itemIds
        : Object.values(response.data.successfulItems.itemIds) as number[];
      const failedItems = response.data.failedItems?.items || [];
      return {
        itemIds,
        failedItems
      };
    }

    throw new Error(response.message || "Failed to bulk upload items");
  }

  /**
   * Bulk Upload (Manual Mode)
   * User specifies categories for each item
   * Phase 1: Upload images first via minioAPI
   * Phase 2: Create items with user-specified categories
   *
   * Response format:
   * { statusCode: 201, message: "Item created successfully",
   *   data: { count: 6, itemIds: [222, 223, 224, 225, 226, 227] } }
   */
  async bulkUploadManual(
    data: BulkItemRequestManualModel
  ): Promise<{ itemIds: number[] }> {
    const response = await apiClient.post<{
      statusCode: number;
      message: string;
      data: {
        count: number;
        itemIds: number[];
      };
    }>("/items/bulk-upload/manual", data);

    if (response.statusCode !== 201) {
      throw new Error(response.message || "Failed to bulk upload items");
    }

    // Convert to array if it's an object with numeric keys
    const itemIds = Array.isArray(response.data.itemIds)
      ? response.data.itemIds
      : Object.values(response.data.itemIds) as number[];

    return { itemIds };
  }

  /**
   * Run AI Analysis on items (Optional Phase 2)
   * Updates items with detailed attributes: colors, patterns, fabric, weather suitability
   * Sets isAnalyzed=true and aiConfidence (0-100)
   */
  async analyzeItems(itemIds: number[]): Promise<number[]> {
    const response = await apiClient.post<{
      statusCode: number;
      message: string;
      data: number[]; // Array of confidence scores
    }>("/items/analysis", { itemIds });

    if (response.statusCode !== 200) {
      throw new Error(response.message || "Failed to analyze items");
    }

    return response.data;
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
   * Get all available styles (only system-created)
   */
  async getStyles(): Promise<
    { id: number; name: string; description?: string }[]
  > {
    try {
      const response = await apiClient.get("/styles?take-all=true");
      const allStyles = response.data?.data || [];
      // Filter only SYSTEM-created styles
      const systemStyles = allStyles.filter(
        (style: { id: number; name: string; description?: string; createdBy?: string }) =>
          style.createdBy === "SYSTEM"
      );
      return systemStyles;
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
      const response = await apiClient.get("/categories?take-all=true");

      // API returns { data: [...], metaData: {...} } directly
      const categories = response.data?.data || [];
      return categories;
    } catch (error) {
      console.error("❌ Failed to fetch categories:", error);
      return [];
    }
  }

  /**
   * Get root categories (top-level categories)
   */
  async getRootCategories(
    pageIndex: number = 1,
    pageSize: number = 100
  ): Promise<{ id: number; name: string; parentId?: number; parentName?: string }[]> {
    try {
      const response = await apiClient.get("/categories/root", {
        params: {
          "page-index": pageIndex,
          "page-size": pageSize,
        },
      });

      // API returns { data: [...], metaData: {...} }
      const categories = response.data?.data || [];
      return categories;
    } catch (error) {
      console.error("❌ Failed to fetch root categories:", error);
      return [];
    }
  }

  /**
   * Get categories by parent ID
   */
  async getCategoriesByParent(
    parentId: number,
    pageIndex: number = 1,
    pageSize: number = 100
  ): Promise<{ id: number; name: string; parentId?: number; parentName?: string }[]> {
    try {
      const response = await apiClient.get(`/categories/parent/${parentId}`, {
        params: {
          "page-index": pageIndex,
          "page-size": pageSize,
        },
      });

      // API returns { data: [...], metaData: {...} }
      const categories = response.data?.data || [];
      return categories;
    } catch (error) {
      console.error("❌ Failed to fetch categories by parent:", error);
      return [];
    }
  }

  /**
   * Get user wardrobe statistics
   */
  async getUserStats(): Promise<{
    totalItems: number;
    categoryCounts: Record<string, number>;
  }> {
    try {
      const userId = this.getUserIdFromToken();
      if (!userId) {
        return {
          totalItems: 0,
          categoryCounts: {},
        };
      }

      const response = await apiClient.get<{
        statusCode: number;
        message: string;
        data: {
          totalItems: number;
          categoryCounts: Record<string, number>;
        };
      }>(`/items/stats/${userId}`);

      if (response.statusCode !== 200) {
        throw new Error(response.message || "Failed to fetch stats");
      }

      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch user stats:", error);
      return {
        totalItems: 0,
        categoryCounts: {},
      };
    }
  }

  /**
   * Split outfit image into multiple clothing items
   * Uploads an image containing multiple items and receives split images
   *
   * Response format (200 OK):
   * { statusCode: 200, message: "Successfully split image",
   *   data: [{ category: string, url: string, fileName: string }] }
   *
   * Response format (400 Bad Request):
   * { statusCode: 400, message: "Failed to split image" }
   */
  async splitOutfitImage(file: File): Promise<{
    category: string;
    url: string;
    fileName: string;
  }[]> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{
      statusCode: number;
      message: string;
      data: Array<{
        category: string;
        url: string;
        fileName: string;
      }>;
    }>('/items/split-item', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.statusCode !== 200) {
      throw new Error(response.message || 'Failed to split image');
    }

    return response.data;
  }

  /**
   * Get all wardrobe items from system (Admin only)
   * This endpoint returns items from all users for admin management
   */
  async getSystemItems(
    pageIndex: number = 1,
    pageSize: number = 10,
    filters?: {
      isAnalyzed?: boolean;
      categoryId?: number;
      seasonId?: number;
      styleId?: number;
      occasionId?: number;
      sortByDate?: 'asc' | 'desc';
      searchQuery?: string;
    }
  ): Promise<ApiItemsResponse> {
    // Build query parameters
    const params: Record<string, string | number | boolean> = {
      "page-index": pageIndex,
      "page-size": pageSize,
    };

    // Add optional filter parameters
    if (filters?.isAnalyzed !== undefined) {
      params.IsAnalyzed = filters.isAnalyzed;
    }
    if (filters?.categoryId !== undefined) {
      params.CategoryId = filters.categoryId;
    }
    if (filters?.seasonId !== undefined) {
      params.SeasonId = filters.seasonId;
    }
    if (filters?.styleId !== undefined) {
      params.StyleId = filters.styleId;
    }
    if (filters?.occasionId !== undefined) {
      params.OccasionId = filters.occasionId;
    }
    if (filters?.sortByDate) {
      params.SortByDate = filters.sortByDate === 'asc' ? 0 : 1; // 0 = asc, 1 = desc
    }
    if (filters?.searchQuery) {
      params.search = filters.searchQuery;
    }

    // Admin endpoint: /items/system with pagination params
    const response = await apiClient.get<{
      statusCode: number;
      message: string;
      data: {
        data: ApiWardrobeItem[];
        metaData: {
          totalCount: number;
          pageSize: number;
          currentPage: number;
          totalPages: number;
          hasNext: boolean;
          hasPrevious: boolean;
        };
      };
    }>('/items/system', {
      params,
    });

    // API returns { statusCode, message, data: { data: [...], metaData: {...} } }
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return {
        data: response.data.data,
        metaData: response.data.metaData,
      };
    }

    // Fallback: check if it's a direct array (legacy, no pagination)
    if (Array.isArray(response?.data)) {
      return {
        data: response.data,
        metaData: {
          totalCount: response.data.length,
          pageSize: response.data.length,
          currentPage: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };
    }

    return {
      data: [],
      metaData: {
        totalCount: 0,
        pageSize,
        currentPage: pageIndex,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    };
  }
}

export const wardrobeAPI = new WardrobeAPI();
