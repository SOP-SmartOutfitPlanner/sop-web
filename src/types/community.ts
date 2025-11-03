// Legacy types for mock data
export interface Post {
  id: string;
  userId: string;
  image?: string; // Make image optional for text-only posts
  caption: string;
  tags: string[];
  likes: number;
  comments: Comment[];
  timestamp: string;
  status: 'visible' | 'hidden' | 'reported';
  reports: Report[];
}

export interface Comment {
  userId: string;
  text: string;
  timestamp: string;
}

export interface ApiComment {
  id: number;
  postId: number;
  userId: number;
  comment: string;
  parentCommentId: number | null;
  commentParent: string | null;
  createdDate: string;
  updatedDate: string | null;
  userDisplayName?: string;
  userAvatar?: string;
  replies?: ApiComment[];
}

export interface Report {
  userId: string;
  reason: string;
  timestamp: string;
}

export interface CommunityUser {
  id: string;
  name: string;
  avatar?: string;
}

// API types
export interface ApiPost {
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

// Transform API post to UI post
export function apiPostToPost(apiPost: ApiPost): Post {
  return {
    id: apiPost.id.toString(),
    userId: apiPost.userId.toString(),
    image: apiPost.images[0] || '', // Allow empty image for text-only posts
    caption: apiPost.body,
    tags: apiPost.hashtags,
    likes: apiPost.likeCount,
    comments: [], // Comments will be loaded separately
    timestamp: apiPost.createdAt,
    status: 'visible',
    reports: [],
  };
}

