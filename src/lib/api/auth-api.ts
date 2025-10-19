import { apiClient } from "./client";
import type {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  TokenPair,
  VerifyOtpRequest,
  ResendOtpRequest,
  ResendOtpResponse,
  ForgotPasswordRequest,
  VerifyOtpResetRequest,
  VerifyOtpResetResponse,
  ResetPasswordRequest,
} from "@/lib/types";

/**
 * Auth API Service
 */
class AuthAPI {
  private readonly BASE_PATH = "/auth";

  /**
   * Register a new user
   * POST /auth/register
   * Returns 201 with OTP message
   */
  async register(
    data: RegisterRequest
  ): Promise<ApiResponse<RegisterResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<RegisterResponse>>(
        `${this.BASE_PATH}/register`,
        data
      );

      // Check if registration requires email verification (OTP)
      if (response.statusCode === 201) {
        // Registration successful, but needs email verification
        // Don't save tokens yet, user needs to verify email first
        if (typeof window !== "undefined") {
          // Store email for verification step
          sessionStorage.setItem(
            "pendingVerificationEmail",
            response.data.email
          );
        }
      }

      return response;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  }

  /**
   * Login user
   * POST /auth (not /auth/login)
   */
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      // Login endpoint is just /auth
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        "/auth",
        data
      );

      // Save tokens after successful login
      if (response.data.accessToken && response.data.refreshToken) {
        apiClient.setTokens(
          response.data.accessToken,
          response.data.refreshToken
        );

        // Note: Login response doesn't include user data
        // User data is extracted from JWT token in auth store
      }

      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  /**
   * Login with Google OAuth
   * POST /auth/login/google/oauth
   */
  async loginWithGoogle(
    credential: string
  ): Promise<ApiResponse<LoginResponse>> {
    try {
      // Request body is just the Google credential string (not an object!)
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        `${this.BASE_PATH}/login/google/oauth`,
        JSON.stringify(credential),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Save tokens after successful login
      if (response.data.accessToken && response.data.refreshToken) {
        apiClient.setTokens(
          response.data.accessToken,
          response.data.refreshToken
        );

        // Note: Login response doesn't include user data
        // User data is extracted from JWT token in auth store
      }

      return response;
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    }
  }

  /**
   * Logout user
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(`${this.BASE_PATH}/logout`);
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with local logout even if API fails
    } finally {
      // Clear tokens and user data
      apiClient.clearTokens();
    }
  }

  /**
   * Refresh access token
   * POST /auth/refresh-token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Request body is just the refresh token string (not an object!)
      const response = await apiClient.post<ApiResponse<TokenPair>>(
        `${this.BASE_PATH}/refresh-token`,
        JSON.stringify(refreshToken),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Update tokens
      if (response.data.accessToken && response.data.refreshToken) {
        apiClient.setTokens(
          response.data.accessToken,
          response.data.refreshToken
        );
      }

      return response.data;
    } catch (error) {
      console.error("Token refresh failed:", error);
      apiClient.clearTokens();
      throw error;
    }
  }

  /**
   * Get current user profile
   * NOTE: This endpoint doesn't exist in the API
   * User data is extracted from JWT token instead
   * See: lib/utils/jwt.ts - extractUserFromToken()
   */
  // async getCurrentUser(): Promise<User> {
  //   // Not implemented - no /auth/me endpoint
  //   throw new Error("Use extractUserFromToken() instead");
  // }

  /**
   * Request password reset OTP
   * POST /auth/password/forgot
   */
  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post<ApiResponse<null>>(
        `${this.BASE_PATH}/password/forgot`,
        data
      );
      
      // Store email for next step
      if (response.statusCode === 200 && typeof window !== "undefined") {
        sessionStorage.setItem("passwordResetEmail", data.email);
      }
      
      return response;
    } catch (error) {
      console.error("Forgot password failed:", error);
      throw error;
    }
  }

  /**
   * Verify OTP for password reset
   * POST /auth/password/verify-otp
   */
  async verifyOtpReset(
    data: VerifyOtpResetRequest
  ): Promise<ApiResponse<VerifyOtpResetResponse>> {
    try {
      const response = await apiClient.post<
        ApiResponse<VerifyOtpResetResponse>
      >(`${this.BASE_PATH}/password/verify-otp`, data);

      // Store reset token for next step
      if (
        response.statusCode === 200 &&
        response.data.resetToken &&
        typeof window !== "undefined"
      ) {
        sessionStorage.setItem("passwordResetToken", response.data.resetToken);
      }

      return response;
    } catch (error) {
      console.error("OTP verification for password reset failed:", error);
      throw error;
    }
  }

  /**
   * Reset password with token
   * POST /auth/password/reset
   */
  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post<ApiResponse<null>>(
        `${this.BASE_PATH}/password/reset`,
        data
      );

      // Clear stored data after successful reset
      if (response.statusCode === 200 && typeof window !== "undefined") {
        sessionStorage.removeItem("passwordResetEmail");
        sessionStorage.removeItem("passwordResetToken");
      }

      return response;
    } catch (error) {
      console.error("Reset password failed:", error);
      throw error;
    }
  }

  /**
   * Verify email with OTP
   * POST /auth/otp/verify
   */
  async verifyOtp(data: VerifyOtpRequest): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post<ApiResponse<null>>(
        `${this.BASE_PATH}/otp/verify`,
        data
      );

      // After successful OTP verification, user needs to login
      // Clear pending verification email
      if (response.statusCode === 200 && typeof window !== "undefined") {
        sessionStorage.removeItem("pendingVerificationEmail");
      }

      return response;
    } catch (error) {
      console.error("OTP verification failed:", error);
      throw error;
    }
  }

  /**
   * Verify email with token
   * POST /auth/verify-email
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      return await apiClient.post(`${this.BASE_PATH}/verify-email`, { token });
    } catch (error) {
      console.error("Email verification failed:", error);
      throw error;
    }
  }

  /**
   * Resend OTP to email
   * POST /auth/otp/resend
   */
  async resendOtp(
    data: ResendOtpRequest
  ): Promise<ApiResponse<ResendOtpResponse | null>> {
    try {
      return await apiClient.post<ApiResponse<ResendOtpResponse | null>>(
        `${this.BASE_PATH}/otp/resend`,
        data
      );
    } catch (error) {
      console.error("Resend OTP failed:", error);
      throw error;
    }
  }

  /**
   * Resend verification email
   * POST /auth/resend-verification
   */
  async resendVerification(email: string): Promise<{ message: string }> {
    try {
      return await apiClient.post(`${this.BASE_PATH}/resend-verification`, {
        email,
      });
    } catch (error) {
      console.error("Resend verification failed:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const authAPI = new AuthAPI();
