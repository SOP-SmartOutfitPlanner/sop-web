import { apiClient } from "./client";
import { ApiComment } from "@/types/community";

export interface Hashtag {
  id: number;
  name: string;
}

export interface CommunityPost {
  id: number;
  userId: number;
  userDisplayName: string;
  body: string;
  hashtags: Hashtag[];
  images: string[];
  createdAt: string;
  updatedAt: string | null;
  likeCount: number;
  commentCount: number;
  isLiked: boolean; // Changed from isLikedByUser to match API
}

export interface CreatePostRequest {
  userId: number;
  body: string;
  hashtags: string[];
  imageUrls: string[];
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

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

class CommunityAPI {
  private BASE_PATH = "/posts";

  /**
   * Get all posts with pagination
   * API Response: { data: [...], metaData: {...} }
   */
  async getAllPosts(
    userId?: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<FeedResponse> {
    const response = await apiClient.get(this.BASE_PATH, {
      params: {
        ...(userId && { userId }), // Add userId if provided to get isLiked status
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
   */
  async getPostsByUser(
    userId: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<FeedResponse> {
    const response = await apiClient.get(`${this.BASE_PATH}/user/${userId}`, {
      params: {
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
   * Create a new post
   */
  async createPost(postData: CreatePostRequest): Promise<CommunityPost> {
    const apiResponse = await apiClient.post<ApiResponse<CommunityPost>>(
      this.BASE_PATH,
      postData
    );
    return apiResponse.data;
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
    return apiResponse.data;
  }

  /**
   * Delete a post
   */
  async deletePost(postId: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${postId}`);
  }

  /**
   * Report a post
   */
  async reportPost(
    postId: number,
    userId: number,
    reason: string
  ): Promise<void> {
    await apiClient.post(`${this.BASE_PATH}/${postId}/report`, {
      userId,
      reason,
    });
  }

  /**
   * Create a comment on a post
   */
  async createComment(data: {
    postId: number;
    userId: number;
    comment: string;
    parentCommentId?: number | null;
  }): Promise<ApiComment> {
    const apiResponse = await apiClient.post<ApiResponse<ApiComment>>(
      "/comment-posts",
      {
        postId: data.postId,
        userId: data.userId,
        comment: data.comment,
        parentCommentId: data.parentCommentId || null,
      }
    );
    return apiResponse.data;
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
  async unfollowUser(
    followerId: number,
    followingId: number
  ): Promise<void> {
    // If API uses DELETE with query params
    await apiClient.delete("/followers", {
      data: { followerId, followingId },
    });
  }

  /**
   * Get follower count for a user
   * API: GET /followers/count/followers/{userId}
   */
  async getFollowerCount(userId: number): Promise<number> {
    const response = await apiClient.get<
      ApiResponse<{ count: number }>
    >(`/followers/count/followers/${userId}`);

    return response.data.count;
  }

  /**
   * Get following count for a user
   * API: GET /followers/count/following/{userId}
   */
  async getFollowingCount(userId: number): Promise<number> {
    const response = await apiClient.get<
      ApiResponse<{ count: number }>
    >(`/followers/count/following/${userId}`);

    return response.data.count;
  }

  /**
   * Check if current user is following another user
   * API: GET /followers/is-following?followerId={}&followingId={}
   */
  async isFollowing(
    followerId: number,
    followingId: number
  ): Promise<boolean> {
    try {
      const response = await apiClient.get<
        ApiResponse<{ isFollowing: boolean }>
      >("/followers/is-following", {
        params: { followerId, followingId },
      });

      return response.data.isFollowing;
    } catch {
      // If API doesn't have this endpoint, return false
      return false;
    }
  }
}

export const communityAPI = new CommunityAPI();
