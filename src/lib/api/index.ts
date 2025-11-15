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

// Export Collection API
export { collectionAPI } from "./collection-api";
export type {
  CollectionRecord,
  CollectionOutfit,
  CollectionOutfitItem,
  CollectionItemDetail,
  CollectionMeta,
} from "./collection-api";

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

// Export Notification API
export { notificationAPI } from "./notification-api";
export type {
  RegisterDeviceTokenRequest,
  Notification,
  NotificationType,
  PaginationMetaData as NotificationPaginationMetaData,
  NotificationsListResponse,
  GetNotificationsParams,
} from "./notification-api";

