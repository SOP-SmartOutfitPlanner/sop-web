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

// Full Body Image Validation Types
export interface ValidateFullBodyImageRequest {
  imageUrl: string;
}

export interface ValidateFullBodyImageResponse {
  isValid: boolean;
  message: string;
}

// Password Change Types
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordOtpRequest {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface InitiateOtpResponse {
  success: boolean;
  message: string;
  data: string; // Masked email
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

  // ============================================================================
  // Password Change Methods
  // ============================================================================

  /**
   * Change password with current password (Method 1)
   * API: PUT /api/user/password/change
   */
  async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {
      const response = await apiClient.put<ChangePasswordResponse>(
        `${this.BASE_PATH}/password/change`,
        data
      );
      return response;
    } catch (error) {
      console.error("Failed to change password:", error);
      throw error;
    }
  }

  /**
   * Initiate OTP-based password change (Method 2 - Step 1)
   * API: POST /api/user/password/change-otp/initiate
   */
  async initiatePasswordChangeOtp(): Promise<InitiateOtpResponse> {
    try {
      const response = await apiClient.post<InitiateOtpResponse>(
        `${this.BASE_PATH}/password/change-otp/initiate`
      );
      return response;
    } catch (error) {
      console.error("Failed to initiate OTP for password change:", error);
      throw error;
    }
  }

  /**
   * Complete OTP-based password change (Method 2 - Step 2)
   * API: PUT /api/user/password/change-otp
   */
  async changePasswordWithOtp(data: ChangePasswordOtpRequest): Promise<ChangePasswordResponse> {
    try {
      const response = await apiClient.put<ChangePasswordResponse>(
        `${this.BASE_PATH}/password/change-otp`,
        data
      );
      return response;
    } catch (error) {
      console.error("Failed to change password with OTP:", error);
      throw error;
    }
  }

  /**
   * Become a stylist after eKYC verification
   * API: POST /user/become-stylist
   */
  async becomeStylist(): Promise<ApiResponse<{ isStylist: boolean }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ isStylist: boolean }>>(
        `${this.BASE_PATH}/become-stylist`
      );
      return response;
    } catch (error) {
      console.error("Failed to become stylist:", error);
      throw error;
    }
  }

  /**
   * Validate full body image for virtual try-on
   * API: POST /user/validate-fullbody-image
   */
  async validateFullBodyImage(imageUrl: string): Promise<ApiResponse<ValidateFullBodyImageResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<ValidateFullBodyImageResponse>>(
        `${this.BASE_PATH}/validate-fullbody-image`,
        { imageUrl }
      );
      return response;
    } catch (error) {
      console.error("Failed to validate full body image:", error);
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