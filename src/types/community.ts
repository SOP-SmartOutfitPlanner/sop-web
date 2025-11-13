import { CommunityPost, Hashtag } from "@/lib/api/community-api";

// Legacy types for mock data
export interface Post {
  id: string;
  userId: string;
  userDisplayName: string; // Added: Display name of post author
  image?: string; // Deprecated - keep for backward compatibility
  images: string[]; // Array of image URLs
  caption: string;
  tags: Hashtag[];
  likes: number;
  isLiked?: boolean; // Whether current user has liked this post
  isFollowing?: boolean; // Whether current user is following this post author
  comments: Comment[];
  commentCount: number; // Comment count from API
  timestamp: string;
  status: "visible" | "hidden" | "reported";
  reports: Report[];
  userAvatar?: string;
  userAvatarUrl?: string;
  userRole?: string;
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
  userAvatarUrl?: string;
  userRole?: string;
  userAvatar?: string; // Keep for backward compatibility
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
  role?: string;
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
    userDisplayName: apiPost.userDisplayName, // Added: Post author's display name
    userAvatar: apiPost.avatarUrl || apiPost.userAvatarUrl,
    userAvatarUrl: apiPost.avatarUrl || apiPost.userAvatarUrl, // Avatar URL from API (prefer avatarUrl from new API)
    userRole: apiPost.role, // User role: USER | STYLIST | ADMIN
    image: fullImageUrls[0] || "", // Keep first image for backward compatibility
    images: fullImageUrls, // Full array of all images
    caption: apiPost.body,
    tags: apiPost.hashtags,
    likes: apiPost.likeCount,
    isLiked: apiPost.isLiked, // Whether current user has liked this post
    isFollowing: apiPost.isFollowing, // Whether current user is following this post author
    comments: [], // Comments will be loaded separately
    commentCount: apiPost.commentCount, // Comment count from API
    timestamp: apiPost.createdAt,
    status: "visible",
    reports: [],
  };
}
