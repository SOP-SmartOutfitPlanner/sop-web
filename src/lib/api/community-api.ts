import { apiClient } from "./client";
import { ApiComment } from "@/types/community";

export interface CommunityPost {
  id: number;
  userId: number;
  userDisplayName: string;
  body: string;
  hashtags: string[];
  images: string[];
  createdAt: string;
  updatedAt: string | null;
  likeCount: number;
  commentCount: number;
  isLikedByUser: boolean;
  authorAvatarUrl: string | null;
  rankingScore?: number;
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
   */
  async getAllPosts(page: number = 1, pageSize: number = 10): Promise<FeedResponse> {
    const apiResponse = await apiClient.get<ApiResponse<FeedResponse>>(
      this.BASE_PATH,
      {
        params: { 
          "page-index": page, 
          "page-size": pageSize 
        },
      }
    );
    return apiResponse.data;
  }

  /**
   * Get community feed (personalized)
   */
  async getFeed(userId: number, page: number = 1, pageSize: number = 10): Promise<FeedResponse> {
    const apiResponse = await apiClient.get<ApiResponse<FeedResponse>>(
      `${this.BASE_PATH}/feed`,
      {
        params: { userId, page, pageSize },
      }
    );
    return apiResponse.data;
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
   * Like a post
   */
  async likePost(postId: number, userId: number): Promise<void> {
    await apiClient.post(`${this.BASE_PATH}/${postId}/like`, { userId });
  }

  /**
   * Unlike a post
   */
  async unlikePost(postId: number, userId: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${postId}/like`, {
      data: { userId },
    });
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
  async reportPost(postId: number, userId: number, reason: string): Promise<void> {
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
  async uploadImage(file: File): Promise<{ fileName: string; downloadUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const apiResponse = await apiClient.post<ApiResponse<{ fileName: string; downloadUrl: string }>>(
      "/minio/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
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
}

export const communityAPI = new CommunityAPI();
