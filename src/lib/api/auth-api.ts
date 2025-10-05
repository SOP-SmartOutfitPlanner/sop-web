import { apiClient } from './client';

// Request interfaces
export interface RegisterRequest {
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Generic API Response Wrapper
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// Response data interfaces
export interface RegisterResponseData {
  email: string;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  user?: UserResponse;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Combined response for convenience
export interface AuthResponse {
  message: string;
  data: RegisterResponseData | AuthData;
  statusCode: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Auth API Service
 */
class AuthAPI {
  private readonly BASE_PATH = '/auth';

  /**
   * Register a new user
   * POST /auth/register
   * Returns 201 with OTP message or auth data
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<RegisterResponseData>>(
        `${this.BASE_PATH}/register`,
        data
      );

      // Check if registration requires email verification (OTP)
      if (response.statusCode === 201) {
        // Registration successful, but needs email verification
        // Don't save tokens yet, user needs to verify email first
        if (typeof window !== 'undefined') {
          // Store email for verification step
          sessionStorage.setItem('pendingVerificationEmail', response.data.email);
        }
      }

      // If tokens are provided (no email verification needed), save them
      if (response.data.accessToken && response.data.refreshToken) {
        apiClient.setTokens(response.data.accessToken, response.data.refreshToken);
        
        // Save user data to localStorage
        if (response.data.user && typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }

      return {
        message: response.message,
        data: response.data,
        statusCode: response.statusCode,
      };
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Login user
   * POST /auth (not /auth/login)
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Login endpoint is just /auth
      const response = await apiClient.post<
        ApiResponse<{
          accessToken: string;
          refreshToken: string;
        }>
      >("/auth", data);

      // Save tokens after successful login
      if (response.data.accessToken && response.data.refreshToken) {
        apiClient.setTokens(
          response.data.accessToken,
          response.data.refreshToken
        );

        // Note: Login response doesn't include user data
        // User data is extracted from JWT token in auth store
      }

      return {
        message: response.message,
        data: {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        } as any,
        statusCode: response.statusCode,
      };
    } catch (error) {
      console.error("Login failed:", error);
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
      console.error('Logout API call failed:', error);
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
  async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Request body is just the refresh token string (not an object!)
      const response = await apiClient.post<
        ApiResponse<{
          accessToken: string;
          refreshToken: string;
        }>
      >(`${this.BASE_PATH}/refresh-token`, JSON.stringify(refreshToken), {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Update tokens
      if (response.data.accessToken && response.data.refreshToken) {
        apiClient.setTokens(response.data.accessToken, response.data.refreshToken);
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
   * GET /auth/me
   */
  async getCurrentUser(): Promise<UserResponse> {
    try {
      const response = await apiClient.get<ApiResponse<UserResponse>>(
        `${this.BASE_PATH}/me`
      );

      // Extract user data from response wrapper
      const userData = response.data;

      // Update user data in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(userData));
      }

      return userData;
    } catch (error) {
      console.error("Failed to get current user:", error);
      throw error;
    }
  }

  /**
   * Request password reset
   * POST /auth/forgot-password
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      return await apiClient.post(`${this.BASE_PATH}/forgot-password`, { email });
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   * POST /auth/reset-password
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    try {
      return await apiClient.post(`${this.BASE_PATH}/reset-password`, {
        token,
        password,
      });
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  }

  /**
   * Verify email with OTP
   * POST /auth/otp/verify
   */
  async verifyOtp(email: string, otp: string): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post<ApiResponse<null>>(
        `${this.BASE_PATH}/otp/verify`,
        { email, otp }
      );

      // After successful OTP verification, user needs to login
      // Clear pending verification email
      if (response.statusCode === 200 && typeof window !== 'undefined') {
        sessionStorage.removeItem('pendingVerificationEmail');
      }

      return response;
    } catch (error) {
      console.error('OTP verification failed:', error);
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
      console.error('Email verification failed:', error);
      throw error;
    }
  }

  /**
   * Resend OTP to email
   * POST /auth/otp/resend
   */
  async resendOtp(
    email: string
  ): Promise<
    ApiResponse<{
      expiryMinutes: number;
      remainingAttempts: number;
    } | null>
  > {
    try {
      return await apiClient.post<
        ApiResponse<{
          expiryMinutes: number;
          remainingAttempts: number;
        } | null>
      >(`${this.BASE_PATH}/otp/resend`, { email });
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
      return await apiClient.post(`${this.BASE_PATH}/resend-verification`, { email });
    } catch (error) {
      console.error('Resend verification failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const authAPI = new AuthAPI();

