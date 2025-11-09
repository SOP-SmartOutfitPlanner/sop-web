/**
 * Admin API
 * API functions for admin operations
 */

import { apiClient } from "./client";
import type { ApiResponse } from "@/lib/types/api.types";
import { ItemsListRequest, ItemsListResponse } from "@/types/item";
import { 
  OccasionsListRequest, 
  OccasionsListResponse, 
  CreateOccasionRequest,
  CreateOccasionResponse,
  UpdateOccasionRequest, 
  UpdateOccasionResponse 
} from "@/types/occasion";

// ============================================================================
// Types
// ============================================================================

export interface AdminUser {
  id: number;
  email: string;
  displayName: string;
  avtUrl: string | null;
  role: number; // 0 = User, 1 = Admin
  isVerifiedEmail: boolean;
  isStylist: boolean;
  isPremium: boolean;
  isLoginWithGoogle: boolean;
  gender: number;
  location: string | null;
  dob: string | null;
  createdDate: string;
  jobId: number | null;
  jobName: string | null;
  userStyles: unknown[];
}

export interface PaginationMetaData {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface UsersListResponse {
  data: AdminUser[];
  metaData: PaginationMetaData;
}

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: number;
  isVerified?: boolean;
  isPremium?: boolean;
}

export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  parentName: string | null;
}

export interface CategoriesListResponse {
  data: Category[];
  metaData: PaginationMetaData;
}

export interface CategoryStats {
  categoryId: number;
  categoryName: string;
  parentId: number | null;
  parentName: string | null;
  itemCount: number;
}

// ============================================================================
// Admin API Functions
// ============================================================================

export const adminAPI = {
  /**
   * Get list of users (Admin only)
   */
  getUsers: async (
    params: GetUsersParams = {}
  ): Promise<ApiResponse<UsersListResponse>> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.role !== undefined)
      queryParams.append("role", params.role.toString());
    if (params.isVerified !== undefined)
      queryParams.append("isVerified", params.isVerified.toString());
    if (params.isPremium !== undefined)
      queryParams.append("isPremium", params.isPremium.toString());

    const url = `/user${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiClient.get<ApiResponse<UsersListResponse>>(url);
  },

  /**
   * Get user by ID (Admin only)
   */
  getUserById: async (userId: number): Promise<ApiResponse<AdminUser>> => {
    return apiClient.get<ApiResponse<AdminUser>>(`/user/${userId}`);
  },

  /**
   * Update user role (Admin only)
   */
  updateUserRole: async (
    userId: number,
    role: number
  ): Promise<ApiResponse<void>> => {
    return apiClient.patch<ApiResponse<void>>(`/user/${userId}/role`, { role });
  },

  /**
   * Block/Unblock user (Admin only)
   */
  toggleUserStatus: async (
    userId: number,
    isActive: boolean
  ): Promise<ApiResponse<void>> => {
    return apiClient.patch<ApiResponse<void>>(`/user/${userId}/status`, {
      isActive,
    });
  },

  /**
   * Delete user (Admin only)
   */
  deleteUser: async (userId: number): Promise<ApiResponse<void>> => {
    return apiClient.delete<ApiResponse<void>>(`/user/${userId}`);
  },

  // ============================================================================
  // Categories Management
  // ============================================================================

  /**
   * Get all categories
   */
  getCategories: async (params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<CategoriesListResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("page-size", params.pageSize.toString());

    const url = `/categories${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiClient.get<ApiResponse<CategoriesListResponse>>(url);
  },

  /**
   * Get categories by parent ID
   */
  getCategoriesByParent: async (
    parentId: number,
    params?: { page?: number; pageSize?: number }
  ): Promise<ApiResponse<CategoriesListResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("page-size", params.pageSize.toString());

    const url = `/categories/parent/${parentId}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiClient.get<ApiResponse<CategoriesListResponse>>(url);
  },

  /**
   * Create category
   */
  createCategory: async (data: {
    name: string;
    parentId: number | null;
  }): Promise<ApiResponse<Category>> => {
    return apiClient.post<ApiResponse<Category>>("/categories", data);
  },

  /**
   * Update category
   */
  updateCategory: async (
    id: number,
    data: { name: string; parentId: number | null }
  ): Promise<ApiResponse<Category>> => {
    return apiClient.put<ApiResponse<Category>>(`/categories`, data);
  },

  /**
   * Delete category
   */
  deleteCategory: async (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete<ApiResponse<void>>(`/categories/${id}`);
  },

  /**
   * Bulk delete categories
   */
  bulkDeleteCategories: async (ids: number[]): Promise<ApiResponse<void>> => {
    // If API doesn't support bulk delete, do sequential deletes
    await Promise.all(ids.map((id) => apiClient.delete(`/categories/${id}`)));
    return {
      statusCode: 200,
      message: "Bulk delete successful",
      data: undefined,
    } as ApiResponse<void>;
  },

  /**
   * Get category usage statistics (mock for now)
   */
  getCategoryStats: async (): Promise<ApiResponse<CategoryStats[]>> => {
    // Mock data - replace with real API when available
    // GET /categories/stats
    const categories = await adminAPI.getCategories({ pageSize: 100 });
    const stats: CategoryStats[] = categories.data.data.map((cat) => ({
      categoryId: cat.id,
      categoryName: cat.name,
      parentId: cat.parentId,
      parentName: cat.parentName,
      itemCount: Math.floor(Math.random() * 500), // Mock random count
    }));
    return { statusCode: 200, message: "Success", data: stats };
  },
  getItems: async (data: ItemsListRequest): Promise<ItemsListResponse> => {
    // Transform PascalCase params to kebab-case as required by API
    const params: Record<string, string | number | boolean> = {
      'page-index': data.PageIndex,
      'page-size': data.PageSize,
    };
    
    if (data.Search) {
      params['search'] = data.Search;
    }
    
    if (data.takeAll !== undefined) {
      params['take-all'] = data.takeAll;
    }
    
    return apiClient.get<ItemsListResponse>(`/items`, { params });
  },
  getOccasions: async (data: OccasionsListRequest): Promise<OccasionsListResponse> => {
    // Transform PascalCase params to kebab-case as required by API
    const params: Record<string, string | number | boolean> = {
      'page-index': data.PageIndex,
      'page-size': data.PageSize,
    };
    
    if (data.Search) {
      params['search'] = data.Search;
    }
    
    if (data.takeAll !== undefined) {
      params['take-all'] = data.takeAll;
    }
    
    return apiClient.get<OccasionsListResponse>(`/occasions`, { params });
  },
  createOccasion: async (data: CreateOccasionRequest): Promise<CreateOccasionResponse> => {
    return apiClient.post<CreateOccasionResponse>(`/occasions`, data);
  },
  editOccasion: async (data: UpdateOccasionRequest): Promise<UpdateOccasionResponse> => {
    return apiClient.put<UpdateOccasionResponse>(`/occasions`, { 
      id: data.id, 
      name: data.name 
    });
  },
  deleteOccasion: async (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete<ApiResponse<void>>(`/occasions/${id}`);
  },
}
