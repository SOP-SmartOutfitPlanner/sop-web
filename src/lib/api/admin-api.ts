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
  UpdateOccasionResponse,
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

export type ReportType = "POST" | "COMMENT";
export type ReportStatus = "PENDING" | "RESOLVED" | "REJECTED" | "IN_PROGRESS";
export type ReportAction = "NONE" | "HIDE" | "DELETE" | "SUSPEND" | "WARN";
export type ResolveReportAction = Exclude<ReportAction, "NONE">;

export interface AdminReport {
  id: number;
  originalReporter: AdminReportUser;
  author: AdminReportUser;
  postId: number | null;
  commentId: number | null;
  type: ReportType;
  action: ReportAction;
  status: ReportStatus;
  reporterCount: number;
  createdDate: string;
}

export interface AdminReportUser {
  id: number;
  displayName: string;
  email: string;
  avatarUrl: string | null;
}

export interface ReportedContent {
  contentId: number;
  contentType: ReportType;
  body: string;
  images?: string[];
  isHidden: boolean;
  isDeleted: boolean;
  createdDate: string;
}

export interface AdminReportDetail {
  id: number;
  type: ReportType;
  status: ReportStatus;
  action: ReportAction;
  createdDate: string;
  originalReporter: AdminReportUser;
  reporterCount: number;
  content: ReportedContent;
  author: AdminReportUser;
  resolvedByAdminId: number | null;
  resolvedAt: string | null;
  resolutionNotes: string | null;
  hiddenStatus: string | null;
  authorWarningCount: number;
  authorSuspensionCount: number;
}

export interface Reporter {
  id: number;
  userId: number;
  reporter: AdminReportUser;
  description: string;
  createdDate: string;
}

export interface ReportersListResponse {
  data: Reporter[];
  metaData: PaginationMetaData;
}

export interface ReportsListResponse {
  data: AdminReport[];
  metaData: PaginationMetaData;
}

export interface GetReportsParams {
  pageIndex?: number;
  pageSize?: number;
  type?: ReportType;
  status?: ReportStatus;
  fromDate?: string;
  toDate?: string;
}

export interface GetReportersParams {
  pageIndex?: number;
  pageSize?: number;
}

export interface ResolveNoViolationPayload {
  notes: string;
}

export interface ResolveWithActionPayload {
  action: ResolveReportAction;
  notes: string;
  suspensionDays?: number;
}

export interface Season {
  id: number;
  name: string;
}

export interface SeasonsListResponse {
  data: Season[];
  metaData: PaginationMetaData;
}

export interface Style {
  id: number;
  name: string;
  description: string;
  createdBy: string | null;
  createdDate: string | null;
  updatedDate: string | null;
}

export interface StylesListResponse {
  data: Style[];
  metaData: PaginationMetaData;
}

export interface AISetting {
  id: number;
  name: string;
  value: string;
  type: string;
  createdDate: string;
  updatedDate: string | null;
}

export type AISettingType =
  | "API_ITEM_ANALYZING"
  | "MODEL_ANALYZING"
  | "DESCRIPTION_ITEM_PROMPT"
  | "VALIDATE_ITEM_PROMPT"
  | "MODEL_EMBEDDING"
  | "API_EMBEDDING"
  | "CATEGORY_ITEM_ANALYSIS_PROMPT"
  | "API_SUGGESTION"
  | "OUTFIT_GENERATION_PROMPT"
  | "OUTFIT_CHOOSE_PROMPT"
  | "MODEL_SUGGESTION";

export interface PushNotificationRequest {
  title: string;
  message: string;
  href?: string;
  imageUrl?: string;
  actorUserId: number; // 1 = all users, otherwise specific user ID
}

export interface PushNotificationResponse {
  notificationId: number;
  message: string;
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
  getReports: async (
    params?: GetReportsParams
  ): Promise<ApiResponse<ReportsListResponse>> => {
    const queryString = buildReportQueryString(params);
    const url = `/reports${queryString ? `?${queryString}` : ""}`;
    return apiClient.get<ApiResponse<ReportsListResponse>>(url);
  },
  getPendingReports: async (
    params?: Omit<GetReportsParams, "status">
  ): Promise<ApiResponse<ReportsListResponse>> => {
    const queryString = buildReportQueryString(params);
    const url = `/reports/pending${queryString ? `?${queryString}` : ""}`;
    return apiClient.get<ApiResponse<ReportsListResponse>>(url);
  },
  getReportDetails: async (
    reportId: number
  ): Promise<ApiResponse<AdminReportDetail>> => {
    return apiClient.get<ApiResponse<AdminReportDetail>>(
      `/reports/${reportId}/details`
    );
  },
  getReportReporters: async (
    reportId: number,
    params?: GetReportersParams
  ): Promise<ApiResponse<ReportersListResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.pageIndex) {
      queryParams.append("page-index", params.pageIndex.toString());
    }
    if (params?.pageSize) {
      queryParams.append("page-size", params.pageSize.toString());
    }
    const queryString = queryParams.toString();
    const url = `/reports/${reportId}/reporters${queryString ? `?${queryString}` : ""}`;
    return apiClient.get<ApiResponse<ReportersListResponse>>(url);
  },
  resolveReportNoViolation: async (
    reportId: number,
    payload: ResolveNoViolationPayload
  ): Promise<ApiResponse<AdminReport>> => {
    return apiClient.post<ApiResponse<AdminReport>>(
      `/reports/${reportId}/resolve-no-violation`,
      payload
    );
  },
  resolveReportWithAction: async (
    reportId: number,
    payload: ResolveWithActionPayload
  ): Promise<ApiResponse<AdminReport>> => {
    return apiClient.post<ApiResponse<AdminReport>>(
      `/reports/${reportId}/resolve-with-action`,
      payload
    );
  },
  getItems: async (data: ItemsListRequest): Promise<ItemsListResponse> => {
    // Transform PascalCase params to kebab-case as required by API
    const params: Record<string, string | number | boolean> = {
      "page-index": data.PageIndex,
      "page-size": data.PageSize,
    };

    if (data.Search) {
      params["search"] = data.Search;
    }

    if (data.takeAll !== undefined) {
      params["take-all"] = data.takeAll;
    }

    return apiClient.get<ItemsListResponse>(`/items`, { params });
  },
  getOccasions: async (
    data: OccasionsListRequest
  ): Promise<OccasionsListResponse> => {
    // Transform PascalCase params to kebab-case as required by API
    const params: Record<string, string | number | boolean> = {
      "page-index": data.PageIndex,
      "page-size": data.PageSize,
    };

    if (data.Search) {
      params["search"] = data.Search;
    }

    if (data.takeAll !== undefined) {
      params["take-all"] = data.takeAll;
    }

    return apiClient.get<OccasionsListResponse>(`/occasions`, { params });
  },
  createOccasion: async (
    data: CreateOccasionRequest
  ): Promise<CreateOccasionResponse> => {
    return apiClient.post<CreateOccasionResponse>(`/occasions`, data);
  },
  editOccasion: async (
    data: UpdateOccasionRequest
  ): Promise<UpdateOccasionResponse> => {
    return apiClient.put<UpdateOccasionResponse>(`/occasions`, {
      id: data.id,
      name: data.name,
    });
  },
  deleteOccasion: async (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete<ApiResponse<void>>(`/occasions/${id}`);
  },
  // ============================================================================
  // Seasons Management
  // ============================================================================

  /**
   * Get list of seasons
   */
  getSeasons: async (params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<SeasonsListResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());

    const url = `/seasons${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiClient.get<ApiResponse<SeasonsListResponse>>(url);
  },

  /**
   * Create season
   */
  createSeason: async (data: {
    name: string;
  }): Promise<ApiResponse<Season>> => {
    return apiClient.post<ApiResponse<Season>>("/seasons", data);
  },

  /**
   * Update season
   */
  updateSeason: async (data: {
    id: number;
    name: string;
  }): Promise<ApiResponse<Season>> => {
    return apiClient.put<ApiResponse<Season>>("/seasons", data);
  },

  /**
   * Delete season
   */
  deleteSeason: async (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete<ApiResponse<void>>(`/seasons/${id}`);
  },
  // ============================================================================
  // Styles Management
  // ============================================================================

  /**
   * Get list of styles
   */
  getStyles: async (params?: {
    pageIndex?: number;
    pageSize?: number;
    search?: string;
  }): Promise<ApiResponse<StylesListResponse>> => {
    const queryParams: Record<string, string | number> = {};
    if (params?.pageIndex) queryParams["page-index"] = params.pageIndex;
    if (params?.pageSize) queryParams["page-size"] = params.pageSize;
    if (params?.search) queryParams["search"] = params.search;

    return apiClient.get<ApiResponse<StylesListResponse>>("/styles", {
      params: queryParams,
    });
  },

  /**
   * Create style
   */
  createStyle: async (data: {
    name: string;
    description: string;
  }): Promise<ApiResponse<Style>> => {
    return apiClient.post<ApiResponse<Style>>("/styles", data);
  },

  /**
   * Update style
   */
  updateStyle: async (data: {
    id: number;
    name: string;
    description: string;
  }): Promise<ApiResponse<Style>> => {
    return apiClient.put<ApiResponse<Style>>("/styles", data);
  },

  /**
   * Delete style
   */
  deleteStyle: async (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete<ApiResponse<void>>(`/styles/${id}`);
  },
  // ============================================================================
  // AI Settings Management
  // ============================================================================

  /**
   * Get list of AI settings
   */
  getAISettings: async (): Promise<ApiResponse<AISetting[]>> => {
    return apiClient.get<ApiResponse<AISetting[]>>("/ai-settings");
  },

  /**
   * Get AI setting by ID
   */
  getAISettingById: async (id: number): Promise<ApiResponse<AISetting>> => {
    return apiClient.get<ApiResponse<AISetting>>(`/ai-settings/${id}`);
  },

  /**
   * Get AI setting by type
   */
  getAISettingByType: async (type: string): Promise<ApiResponse<AISetting>> => {
    return apiClient.get<ApiResponse<AISetting>>(`/ai-settings/type/${type}`);
  },

  /**
   * Create AI setting
   */
  createAISetting: async (data: {
    name: string;
    value: string;
    type: string;
  }): Promise<ApiResponse<AISetting>> => {
    return apiClient.post<ApiResponse<AISetting>>("/ai-settings", data);
  },

  /**
   * Update AI setting
   */
  updateAISetting: async (
    id: number,
    data: {
      name: string;
      value: string;
      type: string;
    }
  ): Promise<ApiResponse<AISetting>> => {
    return apiClient.put<ApiResponse<AISetting>>(`/ai-settings/${id}`, data);
  },

  /**
   * Delete AI setting
   */
  deleteAISetting: async (id: number): Promise<ApiResponse<void>> => {
    return apiClient.delete<ApiResponse<void>>(`/ai-settings/${id}`);
  },
  // ============================================================================
  // Notifications Management
  // ============================================================================

  /**
   * Push notification
   * @param data - Notification data
   * @param data.actorUserId - If 1, push to all users. Otherwise, push to specific user
   */
  pushNotification: async (data: {
    title: string;
    message: string;
    href?: string;
    imageUrl?: string;
    actorUserId: number; // 1 = all users, otherwise specific user ID
  }): Promise<ApiResponse<{ notificationId: number; message: string }>> => {
    return apiClient.post<
      ApiResponse<{ notificationId: number; message: string }>
    >("/notifications/push", data);
  },
};

const buildReportQueryString = (params?: GetReportsParams) => {
  const queryParams = new URLSearchParams();

  if (!params) {
    return queryParams.toString();
  }

  // API expects lowercase with dash: page-index, page-size
  if (params.pageIndex) {
    queryParams.append("page-index", params.pageIndex.toString());
  }
  if (params.pageSize) {
    queryParams.append("page-size", params.pageSize.toString());
  }
  if (params.type) {
    queryParams.append("Type", params.type);
  }
  if (params.status) {
    queryParams.append("Status", params.status);
  }
  if (params.fromDate) {
    queryParams.append("FromDate", params.fromDate);
  }
  if (params.toDate) {
    queryParams.append("ToDate", params.toDate);
  }

  return queryParams.toString();
};
