import { ApiResponse } from "@/types";
import { OnboardingRequest, UserResponse, UserProfileResponse, Job, StyleOption, UpdateProfileRequest } from "@/types/user";
import { apiClient } from "./client";

export interface GetJobsParams {
  "page-index"?: number;
  "page-size"?: number;
  "take-all"?: boolean;
  search?: string;
}

export interface GetStylesParams {
  "page-index"?: number;
  "page-size"?: number;
  "take-all"?: boolean;
  search?: string;
}

export interface CreateJobRequest {
  name: string;
  description: string;
}

export interface CreateStyleRequest {
  name: string;
  description: string;
}

class UserAPI {
  private readonly BASE_PATH = "/user";

  async getUserProfile(): Promise<ApiResponse<UserProfileResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<UserProfileResponse>>(
        `${this.BASE_PATH}/profile`
      );

      return response;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   * API: PUT /api/v1/user/profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfileResponse>> {
    try {
      const response = await apiClient.put<ApiResponse<UserProfileResponse>>(
        `${this.BASE_PATH}/profile`,
        data
      );

      return response;
    } catch (error) {
      console.error("Failed to update user profile:", error);
      throw error;
    }
  }

  async getJobs(params?: GetJobsParams): Promise<ApiResponse<Job[]>> {
    try {
      const response = await apiClient.get<ApiResponse<Job[]>>(
        "/jobs",
        { params }
      );

      return response;
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      throw error;
    }
  }

  async createJob(data: CreateJobRequest): Promise<ApiResponse<Job>> {
    try {
      const response = await apiClient.post<ApiResponse<Job>>(
        "/jobs",
        data
      );

      return response;
    } catch (error) {
      console.error("Failed to create job:", error);
      throw error;
    }
  }

  async getStyles(params?: GetStylesParams): Promise<ApiResponse<StyleOption[]>> {
    try {
      const response = await apiClient.get<ApiResponse<StyleOption[]>>(
        "/styles",
        { params }
      );

      return response;
    } catch (error) {
      console.error("Failed to fetch styles:", error);
      throw error;
    }
  }

  async createStyle(data: CreateStyleRequest): Promise<ApiResponse<StyleOption>> {
    try {
      const response = await apiClient.post<ApiResponse<StyleOption>>(
        "/styles",
        data
      );

      return response;
    } catch (error) {
      console.error("Failed to create style:", error);
      throw error;
    }
  }

  async submitOnboarding(
    data: OnboardingRequest
  ): Promise<ApiResponse<UserResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<UserResponse>>(
        `${this.BASE_PATH}/onboarding`,
        data
      );

      return response;
    } catch (error) {
      console.error("Onboarding submission failed:", error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * API: GET /user/{userId}
   */
  async getUserById(userId: number): Promise<ApiResponse<UserProfileResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<UserProfileResponse>>(
        `${this.BASE_PATH}/${userId}`
      );

      return response;
    } catch (error) {
      console.error("Failed to fetch user by ID:", error);
      throw error;
    }
  }

  /**
   * Get stylist profile by ID
   * API: GET /user/stylist/{userId}
   */
  async getStylistProfile(userId: number): Promise<ApiResponse<{
    id: number;
    displayName: string;
    email: string;
    avatarUrl: string | null;
    location: string | null;
    bio: string | null;
    dob: string | null;
    jobId: number | null;
    jobName: string | null;
    publishedCollectionsCount: number;
    totalCollectionsLikes: number;
    totalCollectionsSaves: number;
    isFollowed: boolean;
  }>> {
    try {
      const response = await apiClient.get<ApiResponse<{
        id: number;
        displayName: string;
        email: string;
        avatarUrl: string | null;
        location: string | null;
        bio: string | null;
        dob: string | null;
        jobId: number | null;
        jobName: string | null;
        publishedCollectionsCount: number;
        totalCollectionsLikes: number;
        totalCollectionsSaves: number;
        isFollowed: boolean;
      }>>(
        `${this.BASE_PATH}/stylist/${userId}`
      );

      return response;
    } catch (error) {
      console.error("Failed to fetch stylist profile:", error);
      throw error;
    }
  }

}

export const userAPI = new UserAPI();