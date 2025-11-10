import { 
  CreateOutfitRequest, 
  CreateOutfitResponse, 
  GetOutfitByIdResponse, 
  GetOutfitsFavoriteResponse, 
  GetOutfitsRequest, 
  GetOutfitsResponse,
  Outfit,
} from "../../types/outfit";
import { apiClient } from "./client";

/**
 * Outfit API Client
 * Handles all outfit-related API calls
 */
class OutfitAPI {
  /**
   * Get user's outfits with pagination and filters
   * @param data - Request parameters (pageIndex, pageSize, search, etc.)
   * @returns Promise<GetOutfitsResponse>
   */
  async getOutfits(data: GetOutfitsRequest): Promise<GetOutfitsResponse> {
    const params: Record<string, string | number | boolean> = {
      'page-index': data.pageIndex,
      'page-size': data.pageSize,
    };

    if (data.search) {
      params['search'] = data.search;
    }
    
    if (data.takeAll !== undefined) {
      params['take-all'] = data.takeAll;
    }

    if (data.isFavorite !== undefined) {
      params['is-favorite'] = data.isFavorite;
    }

    if (data.isSaved !== undefined) {
      params['is-saved'] = data.isSaved;
    }
    
    const response = await apiClient.get<GetOutfitsResponse>("/outfits/user", { params });

    if (response.statusCode !== 200) {
      throw new Error(response.message || "Failed to fetch outfits");
    }

    return response;
  }

  /**
   * Get a specific outfit by ID
   * @param id - Outfit ID
   * @returns Promise<Outfit>
   */
  async getOutfit(id: number): Promise<Outfit> {
    const response = await apiClient.get<GetOutfitByIdResponse>(`/outfits/${id}`);

    if (response.statusCode !== 200) {
      throw new Error(response.message || "Failed to fetch outfit");
    }

    return response.data;
  }

  /**
   * Create a new outfit
   * @param data - Outfit creation data (name, description, itemIds)
   * @returns Promise<CreateOutfitResponse>
   */
  async createOutfit(data: CreateOutfitRequest): Promise<CreateOutfitResponse> {
    const response = await apiClient.post<CreateOutfitResponse>("/outfits", data);

    if (response.statusCode !== 201 && response.statusCode !== 200) {
      throw new Error(response.message || "Failed to create outfit");
    }

    return response;
  }

  /**
   * Update an existing outfit
   * @param id - Outfit ID
   * @param data - Partial outfit data to update
   * @returns Promise<CreateOutfitResponse>
   */
  async updateOutfit(
    id: number, 
    data: Partial<CreateOutfitRequest>
  ): Promise<CreateOutfitResponse> {
    const response = await apiClient.put<CreateOutfitResponse>(`/outfits/${id}`, data);

    if (response.statusCode !== 200) {
      throw new Error(response.message || "Failed to update outfit");
    }

    return response;
  }

  /**
   * Delete an outfit
   * @param id - Outfit ID
   * @returns Promise<void>
   */
  async deleteOutfit(id: number): Promise<void> {
    const response = await apiClient.delete<{
      statusCode: number;
      message: string;
    }>(`/outfits/${id}`);

    if (response.statusCode !== 200 && response.statusCode !== 204) {
      throw new Error(response.message || "Failed to delete outfit");
    }
  }

  /**
   * Toggle favorite status of an outfit
   * @param id - Outfit ID
   * @returns Promise<GetOutfitsFavoriteResponse>
   */
  async toggleFavorite(id: number): Promise<GetOutfitsFavoriteResponse> {
    const response = await apiClient.put<GetOutfitsFavoriteResponse>(
      `/outfits/${id}/favorite`
    );

    if (response.statusCode !== 200) {
      throw new Error(response.message || "Failed to toggle favorite");
    }

    return response;
  }

  /**
   * Get all favorite outfits
   * @returns Promise<Outfit[]>
   */
  async getFavoriteOutfits(): Promise<Outfit[]> {
    const response = await apiClient.get<GetOutfitsFavoriteResponse>("/outfits/favorites");

    if (response.statusCode !== 200) {
      throw new Error(response.message || "Failed to fetch favorite outfits");
    }

    return response.data;
  }
}

// Create singleton instance
export const outfitAPI = new OutfitAPI();

// Legacy exports for backward compatibility
export const GetOutFitAPI = (data: GetOutfitsRequest) => outfitAPI.getOutfits(data);
export const CreateOutfitAPI = (data: CreateOutfitRequest) => outfitAPI.createOutfit(data);
export const SaveFavoriteOutfitAPI = (id: number) => outfitAPI.toggleFavorite(id);