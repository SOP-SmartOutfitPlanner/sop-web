// Export API client
export { apiClient, ApiError } from "./client";
export type {
  ErrorResponse,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "./client";

// Export Auth API
export { authAPI } from "./auth-api";

// Export User API
export { userAPI } from "./user-api";

// Export Wardrobe API
export { wardrobeAPI } from "./wardrobe-api";
export type { ApiWardrobeItem, CreateWardrobeItemRequest } from "./wardrobe-api";

// Export Admin API
export { adminAPI } from "./admin-api";
export type {
  AdminUser,
  PaginationMetaData,
  UsersListResponse,
  GetUsersParams,
  Category,
  CategoriesListResponse,
  CategoryStats,
} from "./admin-api";

