import {
  CreateOutfitRequest,
  CreateOutfitResponse,
  GetOutfitByIdResponse,
  GetOutfitsFavoriteResponse,
  GetOutfitsRequest,
  GetOutfitsResponse,
  Outfit,
  SuggestedItem,
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

    if (data.startDate) {
      params['start-date'] = data.startDate;
    }

    if (data.endDate) {
      params['end-date'] = data.endDate;
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

  /**
   * Get AI outfit suggestion based on weather
   * @param weather - Combined weather string (description, temperature, feels like)
   * @param userId - User ID
   * @param occasionId - Optional occasion ID for filtering suggestions
   * @returns Promise with suggested items and reason
   */
  async getSuggestion(weather: string, userId: number, occasionId?: number): Promise<{
    statusCode: number;
    message: string;
    data: {
      suggestedItems: Array<{
        id: number;
        userId: number;
        userDisplayName: string;
        name: string;
        categoryId: number;
        categoryName: string;
        color: string;
        aiDescription: string;
        brand: string | null;
        frequencyWorn: number | null;
        lastWornAt: string | null;
        imgUrl: string;
        weatherSuitable: string;
        condition: string;
        pattern: string;
        fabric: string;
        isAnalyzed: boolean;
        aiConfidence: number;
        itemType: string;
        occasions: Array<{ id: number; name: string }>;
        seasons: Array<{ id: number; name: string }>;
        styles: Array<{ id: number; name: string }>;
      }>;
      reason: string;
    };
  }> {
    const response = await apiClient.get<{
      statusCode: number;
      message: string;
      data: {
        suggestedItems: Array<{
          id: number;
          userId: number;
          userDisplayName: string;
          name: string;
          categoryId: number;
          categoryName: string;
          color: string;
          aiDescription: string;
          brand: string | null;
          frequencyWorn: number | null;
          lastWornAt: string | null;
          imgUrl: string;
          weatherSuitable: string;
          condition: string;
          pattern: string;
          fabric: string;
          isAnalyzed: boolean;
          aiConfidence: number;
          itemType: string;
          occasions: Array<{ id: number; name: string }>;
          seasons: Array<{ id: number; name: string }>;
          styles: Array<{ id: number; name: string }>;
        }>;
        reason: string;
      };
    }>("/outfits/suggestion", {
      params: {
        weather,
        userId,
        ...(occasionId && { occasionId })
      },
      timeout: 60000
    });

    if (response.statusCode !== 200) {
      throw new Error(response.message || "Failed to get outfit suggestion");
    }

    return response;
  }

  /**
   * Get AI outfit suggestion V2 based on weather with multiple outfit options
   * @param userId - User ID
   * @param totalOutfit - Number of outfit suggestions to generate (2 or 3)
   * @param occasionId - Optional occasion ID for filtering suggestions
   * @param weather - Optional weather string
   * @returns Promise with array of suggested outfits
   */
  async getSuggestionV2(
    userId: number,
    totalOutfit: number,
    occasionId?: number,
    weather?: string
  ): Promise<{
    statusCode: number;
    message: string;
    data: Array<{
      suggestedItems: SuggestedItem[];
      reason: string;
    }>;
  }> {
    const params: Record<string, string | number> = {
      userId,
      totalOutfit,
    };

    if (occasionId) {
      params.occasionId = occasionId;
    }

    if (weather) {
      params.weather = weather;
    }

    const response = await apiClient.get<{
      statusCode: number;
      message: string;
      data: Array<{
        suggestedItems: SuggestedItem[];
        reason: string;
      }>;
    }>("/outfits/suggestionV2", {
      params,
      timeout: 120000
    });

    if (response.statusCode !== 200) {
      throw new Error(response.message || "Failed to get outfit suggestions");
    }

    return response;
  }
}

// Create singleton instance
export const outfitAPI = new OutfitAPI();

// Legacy exports for backward compatibility
export const GetOutFitAPI = (data: GetOutfitsRequest) => outfitAPI.getOutfits(data);
export const CreateOutfitAPI = (data: CreateOutfitRequest) => outfitAPI.createOutfit(data);
export const SaveFavoriteOutfitAPI = (id: number) => outfitAPI.toggleFavorite(id);