// Export API client
export { apiClient, ApiError } from './client';
export type { ErrorResponse, AxiosRequestConfig, AxiosResponse, AxiosError } from './client';

// Export Auth API
export { authAPI } from "./auth-api";
export type {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  ApiResponse,
  RegisterResponseData,
  AuthData,
  AuthResponse,
  UserResponse,
  RefreshTokenResponse,
} from "./auth-api";

// Export Wardrobe API
export { wardrobeAPI } from './wardrobe-api';
export type {
  ApiWardrobeItem,
  CreateWardrobeItemRequest,
} from './wardrobe-api';

