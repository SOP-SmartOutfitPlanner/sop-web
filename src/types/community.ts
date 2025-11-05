import { CommunityPost, Hashtag } from "@/lib/api/community-api";

// Legacy types for mock data
export interface Post {
  id: string;
  userId: string;
  image?: string; // Deprecated - keep for backward compatibility
  images: string[]; // Array of image URLs
  caption: string;
  tags: Hashtag[];
  likes: number;
  isLiked?: boolean; // Whether current user has liked this post
  comments: Comment[];
  timestamp: string;
  status: "visible" | "hidden" | "reported";
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

// API types (deprecated - use CommunityPost from community-api.ts instead)
export interface ApiPost {
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
  isLiked: boolean; // Changed from isLikedByUser to match actual API
}

// Transform API post to UI post
export function apiPostToPost(apiPost: CommunityPost): Post {
  // Images can be:
  // 1. Full URLs from MinIO: https://storage.wizlab.io.vn/sop/xxx.jpg
  // 2. Filenames from old uploads: filename.jpg
  const fullImageUrls = apiPost.images.map((img) => {
    // If already a full URL, return as-is
    if (img.startsWith("http://") || img.startsWith("https://")) {
      return img;
    }
    // Otherwise, build URL from old uploads folder
    return `https://sop.wizlab.io.vn/uploads/${img}`;
  });

  return {
    id: apiPost.id.toString(),
    userId: apiPost.userId.toString(),
    image: fullImageUrls[0] || "", // Keep first image for backward compatibility
    images: fullImageUrls, // Full array of all images
    caption: apiPost.body,
    tags: apiPost.hashtags,
    likes: apiPost.likeCount,
    isLiked: apiPost.isLiked, // Whether current user has liked this post
    comments: [], // Comments will be loaded separately
    timestamp: apiPost.createdAt,
    status: "visible",
    reports: [],
  };
}
