import { ApiResponse } from "@/types";
import { OnboardingRequest, UserResponse } from "@/types/user";
import { apiClient } from "./client";

class UserAPI {
  private readonly BASE_PATH = "/user";

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

}

export const userAPI = new UserAPI();