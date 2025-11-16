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
  title: string;
  shortDescription: string;
  isPublished: boolean;
  likeCount: number;
  commentCount: number;
  isFollowing: boolean;
  isSaved: boolean;
  isLiked: boolean;
  outfits: CollectionOutfit[];
  createdDate: string;
  updatedDate: string | null;
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

  async likeCollection(
    collectionId: number,
    userId: number,
    config?: AxiosRequestConfig
  ): Promise<{ statusCode: number; message: string; data: { id: number; collectionId: number; userId: number; isDeleted: boolean } }> {
    const axiosInstance = apiClient.getAxiosInstance();
    const baseURL = axiosInstance.defaults.baseURL ?? "";
    const normalizedBase = baseURL.replace(/\/$/, "");
    const baseHasVersion = /\/v\d+(\/)?$/.test(normalizedBase);
    const endpoint = baseHasVersion ? "/like-collections" : "/v1/like-collections";

    return apiClient.post(endpoint, { collectionId, userId }, config);
  }

  async saveCollection(
    collectionId: number,
    userId: number,
    config?: AxiosRequestConfig
  ): Promise<{ statusCode: number; message: string; data: { id: number; collectionId: number; userId: number; isDeleted: boolean; createdDate: string } }> {
    const axiosInstance = apiClient.getAxiosInstance();
    const baseURL = axiosInstance.defaults.baseURL ?? "";
    const normalizedBase = baseURL.replace(/\/$/, "");
    const baseHasVersion = /\/v\d+(\/)?$/.test(normalizedBase);
    const endpoint = baseHasVersion ? "/save-collections" : "/v1/save-collections";

    return apiClient.post(endpoint, { collectionId, userId }, config);
  }
}

export const collectionAPI = new CollectionAPI();
