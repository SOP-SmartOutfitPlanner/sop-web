import axios, { 
  AxiosInstance, 
  AxiosError, 
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse 
} from 'axios';

// API Configuration
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sop.wizlab.io.vn/api/v1',
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
  },
};

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: any,
    public originalError?: AxiosError
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Error response interface
export interface ErrorResponse {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
  details?: any;
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
    if (typeof window !== 'undefined') {
      this.loadTokens();
    }
  }

  /**
   * Load tokens from localStorage
   */
  private loadTokens() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  /**
   * Save tokens to localStorage
   */
  private saveTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  /**
   * Clear tokens from memory and localStorage
   */
  public clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
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
        // Add authorization header if token exists
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.group(`🚀 API Request`);
          console.log('Method:', config.method?.toUpperCase());
          console.log('URL:', config.url);
          if (config.data) {
            console.log('Body:', JSON.stringify(config.data, null, 2));
          }
          if (config.params) {
            console.log('Params:', config.params);
          }
          console.groupEnd();
        }

        return config;
      },
      (error: AxiosError) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ [API Request Error]', error);
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
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
          console.group(`✅ API Response`);
          console.log('Method:', response.config.method?.toUpperCase());
          console.log('URL:', response.config.url);
          console.log('Status:', response.status, response.statusText);
          if (response.data) {
            console.log('Data:', JSON.stringify(response.data, null, 2));
          }
          console.groupEnd();
        }

        // Transform response data if needed
        return response;
      },
      async (error: AxiosError) => {
        // Log error in development with full details
        if (process.env.NODE_ENV === 'development') {
          console.group('❌ API Response Error');
          console.log('Method:', error.config?.method?.toUpperCase());
          console.log('URL:', error.config?.url);
          console.log('Status:', error.response?.status, error.response?.statusText);
          console.log('Error Message:', error.message);
          
          // Log full error data for debugging
          if (error.response?.data) {
            console.log('📦 Response Data:');
            console.log(JSON.stringify(error.response.data, null, 2));
          }
          console.groupEnd();
        }

        // Handle 401 Unauthorized - Try to refresh token
        if (error.response?.status === 401 && this.refreshToken) {
          try {
            const refreshed = await this.refreshAccessToken();
            if (refreshed && error.config) {
              // Retry the original request with new token
              return this.client.request(error.config);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
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
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/auth/refresh`,
        { refreshToken: this.refreshToken }
      );

      const { accessToken, refreshToken } = response.data;
      this.saveTokens(accessToken, refreshToken);
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
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
        'Network error. Please check your internet connection.',
        undefined,
        undefined,
        error
      );
    }

    // Server error response
    const response = error.response;
    const data = response.data as any;

    let message = 'An unexpected error occurred';
    let statusCode = response.status;
    
    // Check if response follows API format: { statusCode, message, data }
    if (data && typeof data === 'object') {
      if (data.statusCode) {
        statusCode = data.statusCode;
      }
      
      if (data.message) {
        message = data.message;
      } else if (typeof data === 'string') {
        message = data;
      }
      
      // Handle validation errors in data.data.errors or data.errors
      const errors = data.errors || data.data?.errors;
      if (errors && typeof errors === 'object') {
        const validationMessages = Object.entries(errors)
          .map(([field, msgs]) => {
            const errorList = Array.isArray(msgs) ? msgs : [msgs];
            return `${field}: ${errorList.join(', ')}`;
          })
          .join('; ');
        
        if (validationMessages) {
          message = validationMessages;
        }
      }
    } else if (typeof data === 'string') {
      message = data;
    }

    // Log the parsed error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Parsed Error:');
      console.log('  Status Code:', statusCode);
      console.log('  Message:', message);
      if (data) {
        console.log('  Original Data:', JSON.stringify(data, null, 2));
      }
    }

    return new ApiError(
      message,
      statusCode,
      data,
      error
    );
  }

  /**
   * Generic GET request
   */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * Generic POST request
   */
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PUT request
   */
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PATCH request
   */
  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Upload file with progress tracking
   */
  public async uploadFile<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
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

