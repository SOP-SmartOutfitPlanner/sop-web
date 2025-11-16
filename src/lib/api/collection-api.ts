import { apiClient } from "./client";
import type { AxiosRequestConfig } from "./client";

export interface CollectionItemDetail {
  itemId: number;
  name: string;
  categoryId: number;
  categoryName: string;
  color: string | null;
  aiDescription: string | null;
  brand: string | null;
  frequencyWorn: string | null;
  lastWornAt: string | null;
  imgUrl: string | null;
  weatherSuitable: string | null;
  condition: string | null;
  pattern: string | null;
  fabric: string | null;
}

export interface CollectionOutfitItem {
  outfitId: number;
  name: string;
  description: string | null;
  isFavorite: boolean;
  isSaved: boolean;
  itemCount: number;
  createdDate: string;
  items: CollectionItemDetail[];
}

export interface CollectionOutfit {
  outfit: CollectionOutfitItem;
  description: string | null;
}

export interface CollectionMeta {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CollectionRecord {
  id: number;
  userId: number;
  thumbnailURL?: string | null;
  userDisplayName: string;
  avtUrl?: string | null;
  title: string;
  shortDescription: string;
  isPublished: boolean;
  likeCount: number;
  commentCount: number;
  savedCount?: number;
  isFollowing: boolean;
  isSaved: boolean;
  isLiked: boolean;
  outfits: CollectionOutfit[];
  createdDate: string;
  updatedDate: string | null;
}

export interface CollectionComment {
  id: number;
  collectionId: number;
  userId: number;
  userDisplayName: string;
  userAvatarUrl: string | null;
  comment: string;
  createdDate: string;
  updatedDate: string | null;
}

interface CollectionCommentsResponseBody {
  data: CollectionComment[];
  metaData: CollectionMeta;
}

interface CollectionCommentsResponse {
  statusCode: number;
  message: string;
  data: CollectionCommentsResponseBody;
}

interface CreateCollectionCommentRequest {
  collectionId: number;
  userId: number;
  comment: string;
}

interface CreateCollectionCommentResponse {
  statusCode: number;
  message: string;
  data: CollectionComment;
}

interface CollectionListResponseBody {
  data: CollectionRecord[];
  metaData: CollectionMeta;
}

interface CollectionListResponse {
  statusCode: number;
  message: string;
  data: CollectionListResponseBody;
}

interface CollectionDetailResponse {
  statusCode: number;
  message: string;
  data: CollectionRecord;
}

function resolveCollectionsEndpoint(): string {
  const axiosInstance = apiClient.getAxiosInstance();
  const baseURL = axiosInstance.defaults.baseURL ?? "";
  const normalizedBase = baseURL.replace(/\/$/, "");
  const baseHasVersion = /\/v\d+(\/)?$/.test(normalizedBase);

  return baseHasVersion ? "/collections" : "/v1/collections";
}

class CollectionAPI {
  async getCollections(
    { takeAll = true }: { takeAll?: boolean } = {},
    config?: AxiosRequestConfig
  ): Promise<CollectionListResponse> {
    const endpoint = resolveCollectionsEndpoint();

    return apiClient.get<CollectionListResponse>(endpoint, {
      ...config,
      params: {
        "take-all": takeAll,
        ...(config?.params ?? {}),
      },
    });
  }

  async getCollectionById(
    id: number,
    config?: AxiosRequestConfig
  ): Promise<CollectionDetailResponse> {
    const endpoint = `${resolveCollectionsEndpoint()}/${id}`;

    return apiClient.get<CollectionDetailResponse>(endpoint, config);
  }

  async getCollectionsByUserId(
    userId: number,
    config?: AxiosRequestConfig
  ): Promise<CollectionListResponse> {
    const axiosInstance = apiClient.getAxiosInstance();
    const baseURL = axiosInstance.defaults.baseURL ?? "";
    const normalizedBase = baseURL.replace(/\/$/, "");
    const baseHasVersion = /\/v\d+(\/)?$/.test(normalizedBase);
    const endpoint = baseHasVersion
      ? `/collections/user/${userId}`
      : `/v1/collections/user/${userId}`;

    return apiClient.get<CollectionListResponse>(endpoint, config);
  }

  async likeCollection(
    collectionId: number,
    userId: number,
    config?: AxiosRequestConfig
  ): Promise<{
    statusCode: number;
    message: string;
    data: {
      id: number;
      collectionId: number;
      userId: number;
      isDeleted: boolean;
    };
  }> {
    const axiosInstance = apiClient.getAxiosInstance();
    const baseURL = axiosInstance.defaults.baseURL ?? "";
    const normalizedBase = baseURL.replace(/\/$/, "");
    const baseHasVersion = /\/v\d+(\/)?$/.test(normalizedBase);
    const endpoint = baseHasVersion
      ? "/like-collections"
      : "/v1/like-collections";

    return apiClient.post(endpoint, { collectionId, userId }, config);
  }

  async saveCollection(
    collectionId: number,
    userId: number,
    config?: AxiosRequestConfig
  ): Promise<{
    statusCode: number;
    message: string;
    data: {
      id: number;
      collectionId: number;
      userId: number;
      isDeleted: boolean;
      createdDate: string;
    };
  }> {
    const axiosInstance = apiClient.getAxiosInstance();
    const baseURL = axiosInstance.defaults.baseURL ?? "";
    const normalizedBase = baseURL.replace(/\/$/, "");
    const baseHasVersion = /\/v\d+(\/)?$/.test(normalizedBase);
    const endpoint = baseHasVersion
      ? "/save-collections"
      : "/v1/save-collections";

    return apiClient.post(endpoint, { collectionId, userId }, config);
  }

  async checkSavedCollection(
    userId: number,
    collectionId: number,
    config?: AxiosRequestConfig
  ): Promise<{
    statusCode: number;
    message: string;
    data: {
      isSaved: boolean;
    };
  }> {
    const axiosInstance = apiClient.getAxiosInstance();
    const baseURL = axiosInstance.defaults.baseURL ?? "";
    const normalizedBase = baseURL.replace(/\/$/, "");
    const baseHasVersion = /\/v\d+(\/)?$/.test(normalizedBase);
    const endpoint = baseHasVersion
      ? "/save-collections/check"
      : "/v1/save-collections/check";

    return apiClient.get<{
      statusCode: number;
      message: string;
      data: {
        isSaved: boolean;
      };
    }>(endpoint, {
      ...config,
      params: {
        userId,
        collectionId,
        ...(config?.params ?? {}),
      },
    });
  }

  async getSavedCollectionsByUserId(
    userId: number,
    {
      pageSize = 10,
      pageIndex = 1,
      takeAll = false,
    }: { pageSize?: number; pageIndex?: number; takeAll?: boolean } = {},
    config?: AxiosRequestConfig
  ): Promise<CollectionListResponse> {
    const axiosInstance = apiClient.getAxiosInstance();
    const baseURL = axiosInstance.defaults.baseURL ?? "";
    const normalizedBase = baseURL.replace(/\/$/, "");
    const baseHasVersion = /\/v\d+(\/)?$/.test(normalizedBase);
    const endpoint = baseHasVersion
      ? `/save-collections/user/${userId}`
      : `/v1/save-collections/user/${userId}`;

    return apiClient.get<CollectionListResponse>(endpoint, {
      ...config,
      params: {
        "page-size": pageSize,
        "page-index": takeAll ? undefined : pageIndex,
        "take-all": takeAll,
        ...(config?.params ?? {}),
      },
    });
  }

  async getCollectionComments(
    collectionId: number,
    {
      pageSize = 10,
      pageIndex = 1,
      takeAll = false,
    }: { pageSize?: number; pageIndex?: number; takeAll?: boolean } = {},
    config?: AxiosRequestConfig
  ): Promise<CollectionCommentsResponse> {
    const axiosInstance = apiClient.getAxiosInstance();
    const baseURL = axiosInstance.defaults.baseURL ?? "";
    const normalizedBase = baseURL.replace(/\/$/, "");
    const baseHasVersion = /\/v\d+(\/)?$/.test(normalizedBase);
    const endpoint = baseHasVersion
      ? `/comment-collections/collection/${collectionId}`
      : `/v1/comment-collections/collection/${collectionId}`;

    return apiClient.get<CollectionCommentsResponse>(endpoint, {
      ...config,
      params: {
        "page-size": pageSize,
        "page-index": takeAll ? undefined : pageIndex,
        "take-all": takeAll,
        ...(config?.params ?? {}),
      },
    });
  }

  async createCollectionComment(
    request: CreateCollectionCommentRequest,
    config?: AxiosRequestConfig
  ): Promise<CreateCollectionCommentResponse> {
    const axiosInstance = apiClient.getAxiosInstance();
    const baseURL = axiosInstance.defaults.baseURL ?? "";
    const normalizedBase = baseURL.replace(/\/$/, "");
    const baseHasVersion = /\/v\d+(\/)?$/.test(normalizedBase);
    const endpoint = baseHasVersion
      ? "/comment-collections"
      : "/v1/comment-collections";

    return apiClient.post<CreateCollectionCommentResponse>(
      endpoint,
      request,
      config
    );
  }

  async updateCollectionComment(
    commentId: number,
    comment: string,
    config?: AxiosRequestConfig
  ): Promise<CreateCollectionCommentResponse> {
    const axiosInstance = apiClient.getAxiosInstance();
    const baseURL = axiosInstance.defaults.baseURL ?? "";
    const normalizedBase = baseURL.replace(/\/$/, "");
    const baseHasVersion = /\/v\d+(\/)?$/.test(normalizedBase);
    const endpoint = baseHasVersion
      ? `/comment-collections/${commentId}`
      : `/v1/comment-collections/${commentId}`;

    return apiClient.put<CreateCollectionCommentResponse>(
      endpoint,
      { comment },
      config
    );
  }

  async deleteCollectionComment(
    commentId: number,
    config?: AxiosRequestConfig
  ): Promise<{ statusCode: number; message: string; data: null }> {
    const axiosInstance = apiClient.getAxiosInstance();
    const baseURL = axiosInstance.defaults.baseURL ?? "";
    const normalizedBase = baseURL.replace(/\/$/, "");
    const baseHasVersion = /\/v\d+(\/)?$/.test(normalizedBase);
    const endpoint = baseHasVersion
      ? `/comment-collections/${commentId}`
      : `/v1/comment-collections/${commentId}`;

    return apiClient.delete<{
      statusCode: number;
      message: string;
      data: null;
    }>(endpoint, config);
  }

  async createCollection(
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<{
    statusCode: number;
    message: string;
    data: CollectionRecord;
  }> {
    const axiosInstance = apiClient.getAxiosInstance();
    const baseURL = axiosInstance.defaults.baseURL ?? "";
    const normalizedBase = baseURL.replace(/\/$/, "");
    const baseHasVersion = /\/v\d+(\/)?$/.test(normalizedBase);
    const endpoint = baseHasVersion ? "/collections" : "/v1/collections";

    // Don't set Content-Type header for FormData - let browser set it with boundary
    return apiClient.post<{
      statusCode: number;
      message: string;
      data: CollectionRecord;
    }>(endpoint, formData, config);
  }

  async updateCollection(
    collectionId: number,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<{
    statusCode: number;
    message: string;
    data: CollectionRecord;
  }> {
    const axiosInstance = apiClient.getAxiosInstance();
    const baseURL = axiosInstance.defaults.baseURL ?? "";
    const normalizedBase = baseURL.replace(/\/$/, "");
    const baseHasVersion = /\/v\d+(\/)?$/.test(normalizedBase);
    const endpoint = baseHasVersion
      ? `/collections/${collectionId}`
      : `/v1/collections/${collectionId}`;

    // Don't set Content-Type header for FormData - let browser set it with boundary
    return apiClient.put<{
      statusCode: number;
      message: string;
      data: CollectionRecord;
    }>(endpoint, formData, config);
  }

  async togglePublishCollection(
    collectionId: number,
    config?: AxiosRequestConfig
  ): Promise<{
    statusCode: number;
    message: string;
    data: CollectionRecord;
  }> {
    const axiosInstance = apiClient.getAxiosInstance();
    const baseURL = axiosInstance.defaults.baseURL ?? "";
    const normalizedBase = baseURL.replace(/\/$/, "");
    const baseHasVersion = /\/v\d+(\/)?$/.test(normalizedBase);
    const endpoint = baseHasVersion
      ? `/collections/${collectionId}/toggle-publish`
      : `/v1/collections/${collectionId}/toggle-publish`;

    return apiClient.put<{
      statusCode: number;
      message: string;
      data: CollectionRecord;
    }>(endpoint, {}, config);
  }

  async deleteCollection(
    collectionId: number,
    config?: AxiosRequestConfig
  ): Promise<{
    statusCode: number;
    message: string;
    data: null;
  }> {
    const axiosInstance = apiClient.getAxiosInstance();
    const baseURL = axiosInstance.defaults.baseURL ?? "";
    const normalizedBase = baseURL.replace(/\/$/, "");
    const baseHasVersion = /\/v\d+(\/)?$/.test(normalizedBase);
    const endpoint = baseHasVersion
      ? `/collections/${collectionId}`
      : `/v1/collections/${collectionId}`;

    return apiClient.delete<{
      statusCode: number;
      message: string;
      data: null;
    }>(endpoint, config);
  }
}

export const collectionAPI = new CollectionAPI();
