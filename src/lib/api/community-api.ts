import { apiClient } from "./client";
import { ApiComment } from "@/types/community";

export interface Hashtag {
  id: number;
  name: string;
}

export interface FollowerUser {
  id: number;
  userId: number;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  isFollowing: boolean; // With token: true/false if current user follows this user. Guest: always false
  createdDate: string;
}

export interface PostItemDetailModel {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  color: string;
  brand: string | null;
  imgUrl: string;
  aiDescription: string | null;
  isDeleted: boolean;
  isSaved: boolean; // Whether current user has saved this item from any post
}

export interface PostOutfitDetailModel {
  id: number;
  name: string;
  description: string | null;
  isDeleted: boolean;
  isSaved: boolean; // Whether current user has saved this outfit from any post or collection
  items: PostItemDetailModel[];
}

export interface CommunityPost {
  id: number;
  userId: number;
  userDisplayName: string;
  avatarUrl?: string | null; // Avatar URL from API (can be null)
  userAvatarUrl?: string; // Keep for backward compatibility
  role?: string; // User role: "USER" | "STYLIST" | "ADMIN"
  body: string; // Same as "Body" in API request
  hashtags: Hashtag[];
  images: string[]; // Array of URLs from API
  createdAt: string;
  updatedAt: string | null;
  likeCount: number;
  commentCount: number;
  isLiked: boolean; // User's like status
  isFollowing: boolean; // Follow status - if logged in, shows if current user follows this post author
  // Note: Caption is sometimes used instead of body in responses
  caption?: string;
  // New fields for items/outfits (mutually exclusive)
  items: PostItemDetailModel[] | null;
  outfit: PostOutfitDetailModel | null;
}

export interface CreatePostRequest {
  userId: number;
  body: string;
  hashtags: string | string[]; // Can be single string or array
  images: File[]; // Raw files, not URLs (will be uploaded)
  itemIds?: number[]; // Optional: Array of wardrobe item IDs (max 4, mutually exclusive with outfitId)
  outfitId?: number; // Optional: Single outfit ID (mutually exclusive with itemIds)
}

export interface FeedMetaData {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface FeedResponse {
  data: CommunityPost[];
  metaData: FeedMetaData;
}

export type ReportType = "POST" | "COMMENT";

export interface CreateReportRequest {
  userId: number;
  postId?: number;
  commentId?: number;
  type: ReportType;
  description: string;
}

export interface ReportEntry {
  id: number;
  userId: number;
  postId: number | null;
  commentId: number | null;
  type: ReportType;
  action: "NONE" | "REMOVE" | "WARN";
  status: "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED";
  description: string;
  createdDate: string;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// Save Item from Post types
export interface SavedItemFromPost {
  id: number;
  userId: number;
  itemId: number;
  postId: number;
  createdDate: string;
  itemName: string;
  itemImgUrl: string;
  postBody: string;
  postUserId: number;
  postUserDisplayName: string;
}

export interface SaveItemFromPostResponse {
  statusCode: number;
  message: string;
  data: SavedItemFromPost;
}

// Save Outfit from Post types
export interface SavedOutfitFromPost {
  id: number;
  userId: number;
  outfitId: number;
  postId: number;
  createdDate: string;
  outfitName: string;
  outfitDescription: string | null;
  postBody: string;
  postUserId: number;
  postUserDisplayName: string;
}

export interface SaveOutfitFromPostResponse {
  statusCode: number;
  message: string;
  data: SavedOutfitFromPost;
}

export interface PostLiker {
  userId: number;
  displayName: string;
  avatarUrl?: string | null;
  isFollowing: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  metaData: FeedMetaData;
}

class CommunityAPI {
  private BASE_PATH = "/posts";

  /**
   * Get all posts with pagination
   * API Response: { data: [...], metaData: {...} }
   *
   * Note: Token is automatically sent via apiClient interceptor
   * - With token: Returns isLiked and isFollowing based on current user
   * - Without token (GUEST): Returns isLiked=false and isFollowing=false for all
   */
  async getAllPosts(
    userId?: number,
    page: number = 1,
    pageSize: number = 10,
    search?: string
  ): Promise<FeedResponse> {
    const response = await apiClient.get(this.BASE_PATH, {
      params: {
        ...(userId && { userId }), // Optional: userId for additional filtering
        ...(search && { search }), // Optional: search query
        "page-index": page,
        "page-size": pageSize,
      },
    });

    // Axios response.data is already { data: [...], metaData: {...} }
    const feedData = response.data;

    if (!feedData || !feedData.metaData) {
      console.error("Invalid API response structure:", response.data);
      throw new Error("Invalid API response structure");
    }

    return feedData;
  }

  /**
   * Get community feed (personalized)
   * API Response: { data: [...], metaData: {...} }
   */
  async getFeed(
    userId: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<FeedResponse> {
    const response = await apiClient.get(`${this.BASE_PATH}/feed`, {
      params: { userId, page, pageSize },
    });

    // Axios response.data is already { data: [...], metaData: {...} }
    const feedData = response.data;

    if (!feedData || !feedData.metaData) {
      console.error("Invalid API response structure:", response.data);
      throw new Error("Invalid API response structure");
    }

    return feedData;
  }

  /**
   * Get posts by specific user
   * API: GET /posts/user/{userId}
   * @param userId - The user whose posts to fetch
   * @param page - Page number
   * @param pageSize - Items per page
   * @param currentUserId - Optional: Current logged-in user ID to get isFollowing status
   */
  async getPostsByUser(
    userId: number,
    page: number = 1,
    pageSize: number = 10,
    currentUserId?: number
  ): Promise<FeedResponse> {
    const response = await apiClient.get(`${this.BASE_PATH}/user/${userId}`, {
      params: {
        ...(currentUserId && { userId: currentUserId }), // Add userId param to get follow status
        "page-index": page,
        "page-size": pageSize,
      },
    });

    const feedData = response.data;

    if (!feedData || !feedData.metaData) {
      console.error("Invalid API response structure:", response.data);
      throw new Error("Invalid API response structure");
    }

    return feedData;
  }

  /**
   * Get posts by hashtag
   * API: GET /posts/hashtag/{hashtagId}
   */
  async getPostsByHashtag(
    hashtagId: number,
    page: number = 1,
    pageSize: number = 10,
    currentUserId?: number
  ): Promise<FeedResponse> {
    const response = await apiClient.get(
      `${this.BASE_PATH}/hashtag/${hashtagId}`,
      {
        params: {
          ...(currentUserId && { userId: currentUserId }),
          "page-index": page,
          "page-size": pageSize,
        },
      }
    );

    const feedData = response.data;

    if (!feedData || !feedData.metaData) {
      console.error("Invalid API response structure:", response);
      throw new Error("Invalid API response structure");
    }

    return feedData;
  }

  /**
   * Get users who liked a specific post
   * API: GET /posts/{postId}/likers
   */
  async getPostLikers(
    postId: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<PostLiker>> {
    const response = await apiClient.get<{
      statusCode: number;
      message: string;
      data: PaginatedResponse<PostLiker>;
    }>(`${this.BASE_PATH}/${postId}/likers`, {
      params: {
        "page-index": page,
        "page-size": pageSize,
      },
    });

    const likersData = response.data;

    if (
      !likersData ||
      !Array.isArray(likersData.data) ||
      !likersData.metaData
    ) {
      console.error("Invalid API response structure:", response);
      throw new Error("Invalid API response structure");
    }

    return likersData;
  }

  /**
   * Create a new post with multipart/form-data
   * API expects: multipart/form-data with UserId, Body, Hashtags, Images, ItemIds (optional), OutfitId (optional)
   *
   * Example:
   * const formData = new FormData();
   * formData.append('UserId', '9');
   * formData.append('Body', 'My outfit today!');
   * formData.append('Hashtags', 'casual');
   * files.forEach(file => formData.append('Images', file));
   * itemIds.forEach(id => formData.append('ItemIds', String(id)));
   * formData.append('OutfitId', '123');
   */
  async createPost(postData: CreatePostRequest): Promise<CommunityPost> {
    const formData = new FormData();

    // Add required fields
    formData.append("UserId", String(postData.userId));
    formData.append("Body", postData.body);

    // Handle hashtags (can be single string or array)
    const hashtags = Array.isArray(postData.hashtags)
      ? postData.hashtags
      : [postData.hashtags];

    hashtags.forEach((hashtag) => {
      formData.append("Hashtags", hashtag);
    });

    // Add images
    postData.images.forEach((file) => {
      formData.append("Images", file);
    });

    // Add optional itemIds (0-4 items)
    if (postData.itemIds && postData.itemIds.length > 0) {
      postData.itemIds.forEach((id) => {
        formData.append("ItemIds", String(id));
      });
    }

    // Add optional outfitId (mutually exclusive with itemIds)
    if (postData.outfitId) {
      formData.append("OutfitId", String(postData.outfitId));
    }

    try {
      const apiResponse = await apiClient.post<ApiResponse<CommunityPost>>(
        this.BASE_PATH,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // API returns { statusCode, message, data: CommunityPost }
      // Axios unwraps to apiResponse.data which is the whole response
      // We need to return just the data part
      return apiResponse.data;
    } catch (error: unknown) {
      // Map API error messages to user-friendly messages
      const apiMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || (error as Error).message;

      if (apiMessage?.includes("both items and outfit")) {
        throw new Error(
          "You can only attach either items or an outfit, not both"
        );
      } else if (apiMessage?.includes("maximum of 4 items")) {
        throw new Error("You can attach a maximum of 4 items per post");
      } else if (
        apiMessage?.includes("Item") &&
        apiMessage?.includes("not found")
      ) {
        throw new Error("One or more selected items no longer exist");
      } else if (
        apiMessage?.includes("Outfit") &&
        apiMessage?.includes("not found")
      ) {
        throw new Error("The selected outfit no longer exists");
      } else if (
        apiMessage?.includes("Item") &&
        apiMessage?.includes("does not belong")
      ) {
        throw new Error("You can only attach items from your own wardrobe");
      } else if (
        apiMessage?.includes("Outfit") &&
        apiMessage?.includes("does not belong")
      ) {
        throw new Error("You can only attach outfits you created");
      }

      throw error;
    }
  }

  /**
   * Toggle like/unlike a post (same endpoint for both)
   */
  async toggleLikePost(
    postId: number,
    userId: number
  ): Promise<{
    id: number;
    postId: number;
    userId: number;
    isDeleted: boolean;
  }> {
    const apiResponse = await apiClient.post("/like-posts", {
      postId,
      userId,
    });

    // API returns: { statusCode, message, data: { id, postId, userId, isDeleted } }
    // Axios already unwraps to apiResponse.data, which contains the API response
    const apiData = apiResponse.data;

    // Check if we need to unwrap further
    if (apiData.data) {
      return apiData.data;
    }

    // If already unwrapped, return as-is
    return apiData;
  }

  /**
   * Get post by ID
   */
  async getPostById(postId: number): Promise<CommunityPost> {
    const apiResponse = await apiClient.get<ApiResponse<CommunityPost>>(
      `${this.BASE_PATH}/${postId}`
    );
    const apiData = apiResponse.data;

    // Ensure items and outfit fields exist
    return {
      ...apiData,
      items: apiData.items || null,
      outfit: apiData.outfit || null,
    };
  }

  /**
   * Update a post
   * FormData should include: UserId, Body, Hashtags, Images (optional), ItemIds (optional), OutfitId (optional)
   */
  async updatePost(postId: number, formData: FormData): Promise<CommunityPost> {
    try {
      const apiResponse = await apiClient.put<ApiResponse<CommunityPost>>(
        `${this.BASE_PATH}/${postId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // API returns { statusCode, message, data: CommunityPost }
      return apiResponse.data;
    } catch (error: unknown) {
      // Map API error messages to user-friendly messages
      const apiMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || (error as Error).message;

      if (apiMessage?.includes("both items and outfit")) {
        throw new Error(
          "You can only attach either items or an outfit, not both"
        );
      } else if (apiMessage?.includes("maximum of 4 items")) {
        throw new Error("You can attach a maximum of 4 items per post");
      } else if (
        apiMessage?.includes("Item") &&
        apiMessage?.includes("not found")
      ) {
        throw new Error("One or more selected items no longer exist");
      } else if (
        apiMessage?.includes("Outfit") &&
        apiMessage?.includes("not found")
      ) {
        throw new Error("The selected outfit no longer exists");
      } else if (
        apiMessage?.includes("Item") &&
        apiMessage?.includes("does not belong")
      ) {
        throw new Error("You can only attach items from your own wardrobe");
      } else if (
        apiMessage?.includes("Outfit") &&
        apiMessage?.includes("does not belong")
      ) {
        throw new Error("You can only attach outfits you created");
      }

      throw error;
    }
  }

  /**
   * Delete a post
   */
  async deletePost(postId: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${postId}`);
  }

  /**
   * Submit a report for a post or comment
   */
  async createReport(
    payload: CreateReportRequest
  ): Promise<ApiResponse<ReportEntry>> {
    const response = await apiClient.post<ApiResponse<ReportEntry>>(
      "/reports",
      {
        userId: payload.userId,
        postId: payload.postId ?? null,
        commentId: payload.commentId ?? null,
        type: payload.type,
        description: payload.description,
      }
    );

    return response;
  }

  /**
   * Create a comment on a post
   */
  async createComment(data: {
    postId: number;
    userId: number;
    comment: string;
    parentCommentId?: number | null;
  }): Promise<{ statusCode: number; message: string; data: ApiComment }> {
    const response = await apiClient.post("/comment-posts", {
      postId: data.postId,
      userId: data.userId,
      comment: data.comment,
      parentCommentId: data.parentCommentId || null,
    });
    // Return full response including message
    return response.data;
  }

  /**
   * Get parent comments for a post
   */
  async getComments(postId: number): Promise<ApiComment[]> {
    const response = await apiClient.get<{
      statusCode: number;
      message: string;
      data: {
        data: ApiComment[];
        metaData: {
          totalCount: number;
          pageSize: number;
          currentPage: number;
          totalPages: number;
          hasNext: boolean;
          hasPrevious: boolean;
        };
      };
    }>(`/comment-posts/post/${postId}`);

    return response.data.data;
  }

  /**
   * Get child comments for a parent comment
   */
  async getChildComments(parentCommentId: number): Promise<ApiComment[]> {
    const response = await apiClient.get<{
      statusCode: number;
      message: string;
      data: {
        data: ApiComment[];
        metaData: {
          totalCount: number;
          pageSize: number;
          currentPage: number;
          totalPages: number;
          hasNext: boolean;
          hasPrevious: boolean;
        };
      };
    }>(`/comment-posts/parent/${parentCommentId}`);

    return response.data.data;
  }

  /**
   * Delete a comment
   * API: DELETE /comment-posts/{commentId}
   * Only the comment owner can delete their own comment
   */
  async deleteComment(commentId: number) {
    const response = await apiClient.delete(`/comment-posts/${commentId}`);
    return response.data;
  }

  /**
   * Update a comment
   * API: PUT /comment-posts/{commentId}
   * Body: { comment: string }
   * Only the comment owner can update their own comment
   */
  async updateComment(commentId: number, comment: string): Promise<ApiComment> {
    const response = await apiClient.put<ApiResponse<ApiComment>>(
      `/comment-posts/${commentId}`,
      { comment }
    );
    return response.data;
  }

  /**
   * Upload image to MinIO storage
   * @param file - Image file to upload
   * @returns Object containing fileName and downloadUrl
   */
  async uploadImage(
    file: File
  ): Promise<{ fileName: string; downloadUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const apiResponse = await apiClient.post<
      ApiResponse<{ fileName: string; downloadUrl: string }>
    >("/minio/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return apiResponse.data;
  }

  /**
   * Upload multiple images to MinIO storage
   * @param files - Array of image files to upload
   * @returns Array of downloadUrls
   */
  async uploadMultipleImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file));
    const results = await Promise.all(uploadPromises);
    return results.map((result) => result.downloadUrl);
  }

  /**
   * Follow a user
   * API: POST /followers
   */
  async followUser(
    followerId: number,
    followingId: number
  ): Promise<{
    id: number;
    followerId: number;
    followingId: number;
    createdDate: string;
  }> {
    const response = await apiClient.post<
      ApiResponse<{
        id: number;
        followerId: number;
        followingId: number;
        createdDate: string;
      }>
    >("/followers", {
      followerId,
      followingId,
    });

    return response.data;
  }

  /**
   * Unfollow a user (using DELETE or POST - check API docs)
   * API: DELETE /followers or POST /followers/unfollow
   */
  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    // If API uses DELETE with query params
    await apiClient.delete("/followers", {
      data: { followerId, followingId },
    });
  }

  /**
   * Get follower count for a user
   * API: GET /followers/count/followers/{userId}
   * Response: { statusCode: 200, message: "...", data: { count: 1 } }
   */
  async getFollowerCount(userId: number): Promise<number> {
    const response = await apiClient.get(
      `/followers/count/followers/${userId}`
    );

    // Handle nested data structure
    if (response.data?.data?.count !== undefined) {
      return response.data.data.count;
    }
    // Fallback: check if count is at top level
    if (response.data?.count !== undefined) {
      return response.data.count;
    }

    console.error("[API] Unexpected follower count response:", response.data);
    return 0;
  }

  /**
   * Get following count for a user
   * API: GET /followers/count/following/{userId}
   * Response: { statusCode: 200, message: "...", data: { count: 5 } }
   */
  async getFollowingCount(userId: number): Promise<number> {
    const response = await apiClient.get(
      `/followers/count/following/${userId}`
    );

    // Handle nested data structure
    if (response.data?.data?.count !== undefined) {
      return response.data.data.count;
    }
    // Fallback: check if count is at top level
    if (response.data?.count !== undefined) {
      return response.data.count;
    }

    console.error("[API] Unexpected following count response:", response.data);
    return 0;
  }

  /**
   * Get list of followers for a user
   * API: GET /followers/followers/{userId}?page-index=1&page-size=10
   * Response: { statusCode, message, data: { data: [...users], metaData: {...} } }
   *
   * Note: Token is automatically sent via apiClient interceptor
   * - With token: Returns isFollowing=true/false (if current user follows each follower)
   * - Without token (GUEST): Returns isFollowing=false for all
   */
  async getFollowersList(
    userId: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<FollowerUser[]> {
    try {
      const response = await apiClient.get(`/followers/followers/${userId}`, {
        params: {
          "page-index": page,
          "page-size": pageSize,
        },
      });

      // Response structure: { statusCode, message, data: { data: [...], metaData: {...} } }
      if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        return response.data.data.data;
      }
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }

      console.warn(
        "[API] Unexpected followers list response structure:",
        response.data
      );
      return [];
    } catch (error) {
      console.error("[API] Error fetching followers list:", error);
      return [];
    }
  }

  /**
   * Get list of users that a user is following
   * API: GET /followers/following/{userId}?page-index=1&page-size=10
   * Response: { statusCode, message, data: { data: [...users], metaData: {...} } }
   *
   * Note: Token is automatically sent via apiClient interceptor
   * - With token: Returns isFollowing=true/false (if current user follows each user)
   * - Without token (GUEST): Returns isFollowing=false for all
   */
  async getFollowingList(
    userId: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<FollowerUser[]> {
    try {
      const response = await apiClient.get(`/followers/following/${userId}`, {
        params: {
          "page-index": page,
          "page-size": pageSize,
        },
      });
      // Response structure: { statusCode, message, data: { data: [...], metaData: {...} } }
      if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        return response.data.data.data;
      }
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }

      console.warn(
        "[API] Unexpected following list response structure:",
        response.data
      );
      return [];
    } catch (error) {
      console.error("[API] Error fetching following list:", error);
      return [];
    }
  }

  /**
   * Toggle follow/unfollow a user
   * API: POST /followers
   * Body: { followerId: number, followingId: number }
   * Response: { statusCode: 200, message: "Follow/Unfollow user successfully", data: {...} }
   */
  async toggleFollow(followerId: number, followingId: number) {
    const response = await apiClient.post("/followers", {
      followerId,
      followingId,
    });
    return response.data;
  }

  /**
   * Check if current user is following another user
   * API: GET /followers/status?followerId={}&followingId={}
   * Response: { statusCode: 200, message: "...", data: { isFollowing: true/false } }
   */
  async getFollowStatus(
    followerId: number,
    followingId: number
  ): Promise<boolean> {
    try {
      const response = await apiClient.get("/followers/status", {
        params: { followerId, followingId },
      });

      // Try different response structures
      if (response.data?.data?.isFollowing !== undefined) {
        return response.data.data.isFollowing;
      }
      if (response.data?.isFollowing !== undefined) {
        return response.data.isFollowing;
      }

      return false;
    } catch (error) {
      console.error("[API] Error getting follow status:", error);
      return false;
    }
  }

  /**
   * Get top contributors
   * API: GET /posts/top-contributors?userId={optional}&take-all={optional}
   * Response: { statusCode, message, data: { data: [{ userId, displayName, avatarUrl, postCount, isFollowing }], metaData: {...} } }
   *
   * Usage:
   * - GUEST mode (no userId): Returns all contributors with isFollowing=false for all
   * - Logged in (with userId): Returns contributors with accurate isFollowing status
   *   - isFollowing=true: Current user is already following this contributor
   *   - isFollowing=false: Current user is NOT following this contributor
   *
   * @param userId - Optional. Current user's ID to check follow status
   * @returns Array of contributors with follow status
   */
  async getTopContributors(userId?: number) {
    try {
      const params = userId ? { userId } : {};
      const response = await apiClient.get("/posts/top-contributors", {
        params,
      });

      if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        return response.data.data.data;
      }
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("[API] Error fetching top contributors:", error);
      return [];
    }
  }

  // ==================== SAVE ITEMS/OUTFITS FROM POSTS ====================

  /**
   * Save an item from a post to user's wardrobe
   * API: POST /item-post
   * @param itemId - The ID of the item to save
   * @param postId - The ID of the post containing the item
   */
  async saveItemFromPost(
    itemId: number,
    postId: number
  ): Promise<SaveItemFromPostResponse> {
    const response = await apiClient.post<SaveItemFromPostResponse>(
      "/item-post",
      { itemId, postId }
    );
    return response;
  }

  /**
   * Unsave an item from a post
   * API: DELETE /item-post/{itemId}/{postId}
   * @param itemId - The ID of the item to unsave
   * @param postId - The ID of the post
   */
  async unsaveItemFromPost(
    itemId: number,
    postId: number
  ): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/item-post/${itemId}/${postId}`
    );
    return response;
  }

  /**
   * Get all saved items from posts for current user
   * API: GET /item-post
   */
  async getSavedItemsFromPosts(): Promise<ApiResponse<SavedItemFromPost[]>> {
    const response = await apiClient.get<ApiResponse<SavedItemFromPost[]>>(
      "/item-post"
    );
    return response;
  }

  /**
   * Check if an item from a post is saved
   * API: GET /item-post/check/{itemId}/{postId}
   * @param itemId - The ID of the item
   * @param postId - The ID of the post
   */
  async checkItemSavedFromPost(
    itemId: number,
    postId: number
  ): Promise<ApiResponse<{ isSaved: boolean }>> {
    const response = await apiClient.get<ApiResponse<{ isSaved: boolean }>>(
      `/item-post/check/${itemId}/${postId}`
    );
    return response;
  }

  /**
   * Save an outfit from a post to user's wardrobe
   * API: POST /outfit-post
   * @param outfitId - The ID of the outfit to save
   * @param postId - The ID of the post containing the outfit
   */
  async saveOutfitFromPost(
    outfitId: number,
    postId: number
  ): Promise<SaveOutfitFromPostResponse> {
    const response = await apiClient.post<SaveOutfitFromPostResponse>(
      "/outfit-post",
      { outfitId, postId }
    );
    return response;
  }

  /**
   * Unsave an outfit from a post
   * API: DELETE /outfit-post/{outfitId}/{postId}
   * @param outfitId - The ID of the outfit to unsave
   * @param postId - The ID of the post
   */
  async unsaveOutfitFromPost(
    outfitId: number,
    postId: number
  ): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/outfit-post/${outfitId}/${postId}`
    );
    return response;
  }

  /**
   * Get all saved outfits from posts for current user
   * API: GET /outfit-post
   */
  async getSavedOutfitsFromPosts(): Promise<
    ApiResponse<SavedOutfitFromPost[]>
  > {
    const response = await apiClient.get<ApiResponse<SavedOutfitFromPost[]>>(
      "/outfit-post"
    );
    return response;
  }

  /**
   * Check if an outfit from a post is saved
   * API: GET /outfit-post/check/{outfitId}/{postId}
   * @param outfitId - The ID of the outfit
   * @param postId - The ID of the post
   */
  async checkOutfitSavedFromPost(
    outfitId: number,
    postId: number
  ): Promise<ApiResponse<{ isSaved: boolean }>> {
    const response = await apiClient.get<ApiResponse<{ isSaved: boolean }>>(
      `/outfit-post/check/${outfitId}/${postId}`
    );
    return response;
  }
}

export const communityAPI = new CommunityAPI();
