import { apiClient } from "./client";
import type { ApiResponse } from "@/lib/types";

/**
 * Register device token request
 */
export interface RegisterDeviceTokenRequest {
  userId: number;
  deviceToken: string;
}

export interface DeleteDeviceTokenParams {
  deviceToken: string;
}

/**
 * Notification type enum
 */
export type NotificationType = "SYSTEM" | "USER" | "AI" | "SOCIAL" | "CALENDAR" | "WEATHER" | "ACHIEVEMENT";

/**
 * Notification data structure
 */
export interface Notification {
  id: number;
  title: string;
  message: string;
  href: string;
  type: NotificationType;
  imageUrl: string | null;
  actorUserId: number | null;
  actorDisplayName: string | null;
  actorAvatarUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMetaData {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Notifications list response
 */
export interface NotificationsListResponse {
  data: Notification[];
  metaData: PaginationMetaData;
}

/**
 * Get notifications parameters
 */
export interface GetNotificationsParams {
  userId: number;
  type?: number; // 0 = SYSTEM, 1 = USER, etc. (undefined = all)
  page?: number;
  pageSize?: number;
}

/**
 * Notification API Service
 */
class NotificationAPI {
  private readonly BASE_PATH = "/user-devices";
  private readonly NOTIFICATIONS_PATH = "/notifications";

  /**
   * Register device token for push notifications
   * POST /api/v1/user-devices
   * Note: BASE_URL already includes /v1, so BASE_PATH is just /user-devices
   */
  async registerDeviceToken(
    data: RegisterDeviceTokenRequest
  ): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post<ApiResponse<null>>(
        this.BASE_PATH,
        data
      );
      
      return response;
    } catch (error) {
      console.error("❌ Device token registration API error:", error);
      throw error;
    }
  }

  /**
   * Delete device token for push notifications
   * DELETE /api/v1/user-devices/{deviceToken}
   */
  async deleteDeviceToken(
    params: DeleteDeviceTokenParams
  ): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.delete<ApiResponse<null>>(
        `${this.BASE_PATH}/${params.deviceToken}`
      );

      return response;
    } catch (error) {
      console.error("❌ Device token deletion API error:", error);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   * GET /api/v1/notifications/user/{userId}?type={type}&page={page}&pageSize={pageSize}
   */
  async getNotifications(
    params: GetNotificationsParams
  ): Promise<ApiResponse<NotificationsListResponse>> {
    try {
      const { userId, type, page, pageSize } = params;
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (type !== undefined) {
        queryParams.append("type", type.toString());
      }
      if (page !== undefined) {
        queryParams.append("page-index", page.toString());
      }
      if (pageSize !== undefined) {
        queryParams.append("page-size", pageSize.toString());
      }
      
      const queryString = queryParams.toString();
      const endpoint = `${this.NOTIFICATIONS_PATH}/user/${userId}${queryString ? `?${queryString}` : ""}`;
      
      
      
      const response = await apiClient.get<ApiResponse<NotificationsListResponse>>(endpoint);
      
      
      
      return response;
    } catch (error) {
      console.error("❌ Failed to get notifications:", error);
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   * GET /api/v1/notifications/user/{userId}/unread-count
   */
  async getUnreadCount(userId: number): Promise<ApiResponse<number>> {
    try {
      const endpoint = `${this.NOTIFICATIONS_PATH}/user/${userId}/unread-count`;
      
      
      const response = await apiClient.get<ApiResponse<number>>(endpoint);
      
      
      return response;
    } catch (error) {
      console.error("❌ Failed to get unread count:", error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * PUT /api/v1/notifications/{notificationId}/read
   */
  async markAsRead(notificationId: number): Promise<ApiResponse<null>> {
    try {
      const endpoint = `${this.NOTIFICATIONS_PATH}/${notificationId}/read`;
      
      
      const response = await apiClient.put<ApiResponse<null>>(endpoint);
      
      
      return response;
    } catch (error) {
      console.error("❌ Failed to mark notification as read:", error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   * PUT /api/v1/notifications/user/{userId}/read-all
   */
  async markAllAsRead(userId: number): Promise<ApiResponse<null>> {
    try {
      const endpoint = `${this.NOTIFICATIONS_PATH}/user/${userId}/read-all`;
      
      
      const response = await apiClient.put<ApiResponse<null>>(endpoint);
      
      
      return response;
    } catch (error) {
      console.error("❌ Failed to mark all notifications as read:", error);
      throw error;
    }
  }

  /**
   * Get notification detail by ID
   * GET /api/v1/notifications/user-notification/{notificationId}
   */
  async getNotificationDetail(notificationId: number): Promise<ApiResponse<Notification>> {
    try {
      const endpoint = `${this.NOTIFICATIONS_PATH}/user-notification/${notificationId}`;
      
      
      const response = await apiClient.get<ApiResponse<Notification>>(endpoint);
      
      
      return response;
    } catch (error) {
      console.error("❌ Failed to get notification detail:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const notificationAPI = new NotificationAPI();

