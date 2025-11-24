import { apiClient } from "./client";

interface ApiResponse<TData> {
  statusCode: number;
  message: string;
  data: TData;
}

export interface StylistDashboardBaseParams {
  year?: number;
  month?: number;
}

export interface StylistCollectionsStatsParams
  extends StylistDashboardBaseParams {
  topCollectionsCount?: number;
}

export interface StylistPostsStatsParams
  extends StylistDashboardBaseParams {
  topPostsCount?: number;
}

export interface StylistCollectionsMonthlyStat {
  month: number;
  year: number;
  monthName: string;
  collectionsCreated: number;
  likesReceived: number;
  commentsReceived: number;
  savesReceived: number;
  totalEngagement: number;
}

export interface StylistCollectionHighlight {
  id: number;
  thumbnailURL: string;
  title: string;
  shortDescription: string;
  isPublished: boolean;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  totalEngagement: number;
  createdDate: string;
}

export interface StylistCollectionsStats {
  totalCollections: number;
  publishedCollections: number;
  unpublishedCollections: number;
  totalLikes: number;
  totalComments: number;
  totalSaves: number;
  totalFollowers: number;
  followersThisMonth: number;
  monthlyStats: StylistCollectionsMonthlyStat[];
  topCollections: StylistCollectionHighlight[];
}

export interface StylistPostsMonthlyStat {
  month: number;
  year: number;
  monthName: string;
  postsCreated: number;
  likesReceived: number;
  commentsReceived: number;
  totalEngagement: number;
}

export interface StylistPostHighlight {
  id: number;
  body: string;
  images: string[];
  likeCount: number;
  commentCount: number;
  totalEngagement: number;
  createdDate: string;
}

export interface StylistPostsStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalFollowers: number;
  followersThisMonth: number;
  monthlyStats: StylistPostsMonthlyStat[];
  topPosts: StylistPostHighlight[];
}

const EMPTY_COLLECTION_STATS: StylistCollectionsStats = {
  totalCollections: 0,
  publishedCollections: 0,
  unpublishedCollections: 0,
  totalLikes: 0,
  totalComments: 0,
  totalSaves: 0,
  totalFollowers: 0,
  followersThisMonth: 0,
  monthlyStats: [],
  topCollections: [],
};

const EMPTY_POST_STATS: StylistPostsStats = {
  totalPosts: 0,
  totalLikes: 0,
  totalComments: 0,
  totalFollowers: 0,
  followersThisMonth: 0,
  monthlyStats: [],
  topPosts: [],
};

class StylistAPI {
  private readonly BASE_PATH = "/stylist/dashboard";

  private mapCollectionsParams(params?: StylistCollectionsStatsParams) {
    return {
      Year: params?.year,
      Month: params?.month,
      TopCollectionsCount: params?.topCollectionsCount,
    };
  }

  private mapPostsParams(params?: StylistPostsStatsParams) {
    return {
      Year: params?.year,
      Month: params?.month,
      TopPostsCount: params?.topPostsCount,
    };
  }

  async getCollectionsStats(params?: StylistCollectionsStatsParams) {
    const payload = await apiClient.get<ApiResponse<StylistCollectionsStats>>(
      `${this.BASE_PATH}/collections`,
      {
        params: this.mapCollectionsParams(params),
      }
    );

    return payload?.data ?? EMPTY_COLLECTION_STATS;
  }

  async getPostsStats(params?: StylistPostsStatsParams) {
    const payload = await apiClient.get<ApiResponse<StylistPostsStats>>(
      `${this.BASE_PATH}/posts`,
      {
        params: this.mapPostsParams(params),
      }
    );

    return payload?.data ?? EMPTY_POST_STATS;
  }
}

export const stylistAPI = new StylistAPI();

