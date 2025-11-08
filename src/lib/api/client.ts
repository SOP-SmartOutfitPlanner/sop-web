import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

// API Configuration
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
};

// Validate required environment variables
if (!API_CONFIG.BASE_URL) {
  console.error(
    "Missing NEXT_PUBLIC_API_BASE_URL environment variable. " +
    "Please add it to your .env.local file."
  );
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: unknown,
    public originalError?: AxiosError
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Error response interface
export interface ErrorResponse {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
  details?: unknown;
}

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    // Setup interceptors
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();

    // Load tokens from localStorage on init (client-side only)
    if (typeof window !== "undefined") {
      this.loadTokens();
    }
  }

  /**
   * Load tokens from localStorage
   */
  private loadTokens() {
    this.accessToken = localStorage.getItem("accessToken");
    this.refreshToken = localStorage.getItem("refreshToken");
  }

  /**
   * Save tokens to localStorage and cookies
   */
  private saveTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      
      // Also save to cookies for middleware access
      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; samesite=strict`;
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; samesite=strict`;
    }
  }

  /**
   * Clear tokens from memory, localStorage and cookies
   */
  public clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      
      // Clear cookies
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }

  /**
   * Set authentication tokens
   */
  public setTokens(accessToken: string, refreshToken: string) {
    this.saveTokens(accessToken, refreshToken);
  }

  /**
   * Get current access token
   */
  public getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Request interceptor - Add auth token and transform request
   */
  private setupRequestInterceptor() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const url = config.url || "";
        
        // Skip adding auth token for public endpoints
        const isPublicEndpoint =
          url.endsWith("/auth") || // Login endpoint
          url.includes("/register") ||
          url.includes("/refresh-token") ||
          url.includes("/otp") ||
          url.includes("/password/forgot") ||
          url.includes("/password/verify-otp") ||
          url.includes("/password/reset") ||
          url.includes("/verify-email") ||
          url.includes("/login/google/oauth");

        // Add authorization header if token exists and endpoint is not public
        if (this.accessToken && config.headers && !isPublicEndpoint) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }

        // Handle FormData - Remove Content-Type to let browser set it with boundary
        if (config.data instanceof FormData && config.headers) {
          delete config.headers['Content-Type'];
        }



        return config;
      },
      (error: AxiosError) => {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ [API Request Error]", error);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Response interceptor - Handle errors and transform response
   */
  private setupResponseInterceptor() {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {


        // Transform response data if needed
        return response;
      },
      async (error: AxiosError) => {


        // Handle 401 Unauthorized - Try to refresh token
        // BUT: Don't refresh for public auth endpoints!
        const url = error.config?.url || "";
        const isAuthEndpoint =
          url.includes("/auth") &&
          (url.endsWith("/auth") || // Login endpoint
            url.includes("/register") ||
            url.includes("/refresh-token") ||
            url.includes("/otp") ||
            url.includes("/password/forgot") ||
            url.includes("/password/verify-otp") ||
            url.includes("/password/reset") ||
            url.includes("/verify-email") ||
            url.includes("/login/google/oauth"));

        // Also check if this request already failed after a retry
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isRetry = (error.config as any)?._retry;

        // Check if token is invalid (401 or 403 with "Token not valid" message)
        const isTokenInvalid =
          error.response?.status === 401 ||
          (error.response?.status === 403 &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error.response?.data as any)?.message?.toLowerCase().includes("token"));

        if (
          isTokenInvalid &&
          this.refreshToken &&
          !isAuthEndpoint &&
          !isRetry
        ) {
          try {
            // Mark this request as being retried to prevent infinite loops
            if (error.config) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (error.config as any)._retry = true;
            }

            const refreshed = await this.refreshAccessToken();
            if (refreshed && error.config) {
              // Retry the original request with new token
              return this.client.request(error.config);
            }
          } catch {
            // Refresh failed, clear tokens and redirect to login
            this.clearTokens();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }
        }

        // Handle different error scenarios
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      // Request body is just the refresh token string (not an object!)
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/auth/refresh-token`,
        JSON.stringify(this.refreshToken),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Response format: { statusCode, message, data: { accessToken, refreshToken } }
      const data = response.data.data;
      if (data && data.accessToken && data.refreshToken) {
        this.saveTokens(data.accessToken, data.refreshToken);
        return true;
      }
      
      return false;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to refresh token:", error);
      }
      return false;
    }
  }

  /**
   * Error handler - Transform axios errors into ApiError
   */
  private handleError(error: AxiosError): ApiError {
    // Network error
    if (!error.response) {
      return new ApiError(
        "Network error. Please check your internet connection.",
        undefined,
        undefined,
        error
      );
    }

    const response = error.response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = response.data as any;

    let message = "An unexpected error occurred";
    let statusCode = response.status;

    // Check if response follows API format: { statusCode, message, data }
    if (data && typeof data === "object") {
      if (data.statusCode) {
        statusCode = data.statusCode;
      }

      if (data.message) {
        message = data.message;
      } else if (typeof data === "string") {
        message = data;
      }

      // Handle validation errors in data.data.errors or data.errors
      const errors = data.errors || data.data?.errors;
      if (errors && typeof errors === "object") {
        const validationMessages = Object.entries(errors)
          .map(([field, msgs]) => {
            const errorList = Array.isArray(msgs) ? msgs : [msgs];
            return `${field}: ${errorList.join(", ")}`;
          })
          .join("; ");

        if (validationMessages) {
          message = validationMessages;
        }
      }
    } else if (typeof data === "string") {
      message = data;
    }



    return new ApiError(message, statusCode, data, error);
  }

  /**
   * Generic GET request
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * Generic POST request
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async post<T = any>(
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PUT request
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async put<T = any>(
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PATCH request
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async patch<T = any>(
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Upload file with progress tracking
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async uploadFile<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await this.client.post<T>(url, formData, {
      // Don't set Content-Type - let the browser set it with the correct boundary
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  /**
   * Get the raw axios instance for advanced usage
   */
  public getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types
export type { AxiosRequestConfig, AxiosResponse, AxiosError };
