"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MonthlyPulseChart } from "../components/MonthlyPulseChart";
import {
  StylistPostHighlight,
  StylistPostsMonthlyStat,
  StylistPostsStats,
} from "@/lib/api";
import { FileText } from "lucide-react";
import { formatDate, stripHtml } from "../utils";
import { PostModal } from "@/components/community/profile/PostModal";
import { Post } from "@/types/community";
import { communityAPI, CommunityPost } from "@/lib/api/community-api";
import { toast } from "sonner";

interface CommunityTabProps {
  isLoading: boolean;
  postsStats?: StylistPostsStats;
  postsActivityLabel: string;
  onPostsChanged?: () => void;
}

export function CommunityTab({
  isLoading,
  postsStats,
  postsActivityLabel,
  onPostsChanged,
}: CommunityTabProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);

  // Convert StylistPostHighlight to Post format
  const convertToPost = (highlight: StylistPostHighlight, fullPost?: CommunityPost): Post => {
    return {
      id: String(highlight.id),
      userId: String(fullPost?.userId || ""),
      userDisplayName: fullPost?.userDisplayName || "",
      images: highlight.images || [],
      caption: highlight.body || "",
      tags: fullPost?.hashtags || [],
      likes: highlight.likeCount,
      isLiked: fullPost?.isLiked || false,
      isFollowing: fullPost?.isFollowing || false,
      comments: [],
      commentCount: highlight.commentCount,
      timestamp: highlight.createdDate,
      status: "visible",
      reports: [],
      userAvatarUrl: fullPost?.avatarUrl || fullPost?.userAvatarUrl || undefined,
      userRole: fullPost?.role || undefined,
    };
  };

  const handlePostClick = async (post: StylistPostHighlight) => {
    if (isLoadingPost) return; // Prevent multiple clicks
    
    setIsLoadingPost(true);
    toast.loading("Loading post...", { id: "load-post" });
    
    try {
      // Fetch full post details from API
      const fullPost = await communityAPI.getPostById(post.id);
      const convertedPost = convertToPost(post, fullPost);
      setSelectedPost(convertedPost);
      setIsModalOpen(true);
      toast.dismiss("load-post");
    } catch (error) {
      console.error("Error loading post:", error);
      toast.error("Failed to load post details", { id: "load-post" });
    } finally {
      setIsLoadingPost(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handleLike = async () => {
    // Modal will handle like internally
  };

  const handleRefetchPostDetails = async (postId: number) => {
    try {
      // Refetch post details to get updated data
      const fullPost = await communityAPI.getPostById(postId);
      const highlight: StylistPostHighlight = {
        id: postId,
        body: fullPost.body || fullPost.caption || "",
        images: fullPost.images,
        likeCount: fullPost.likeCount,
        commentCount: fullPost.commentCount,
        totalEngagement: fullPost.likeCount + fullPost.commentCount,
        createdDate: fullPost.createdAt,
      };
      const convertedPost = convertToPost(highlight, fullPost);
      setSelectedPost(convertedPost);
    } catch (error) {
      console.error("Error refetching post details:", error);
      toast.error("Failed to refresh post details");
    }
  };

  const handlePostUpdated = async () => {
    // Refresh post details in modal and stats
    if (selectedPost) {
      await handleRefetchPostDetails(parseInt(selectedPost.id));
    }
    onPostsChanged?.();
    // Note: EditPostDialog already shows success toast
  };

  const handlePostDeleted = () => {
    // Close modal and refresh stats after post is deleted
    handleCloseModal();
    onPostsChanged?.();
    toast.success("Post deleted successfully");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96 rounded-3xl bg-white/10" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-80 rounded-3xl bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <section>
        <MonthlyPulseChart
          title="Community activity"
          icon={<FileText className="h-5 w-5 text-purple-400" />}
          stats={postsStats?.monthlyStats}
          emptyMessage="No posts were published during this time range."
          extraLabel="📝 Posts:"
          color={{
            stroke: "#c084fc",
            gradientFrom: "rgba(192, 132, 252, 0.9)",
            gradientTo: "rgba(192, 132, 252, 0.1)",
          }}
          mapExtra={(stat) => (stat as StylistPostsMonthlyStat).postsCreated}
        />
      </section>

      <section className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-white">Top performing posts</h3>
          <p className="text-sm text-white/60">
            Your most engaging community content this year
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(postsStats?.topPosts ?? []).length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
              <FileText className="mx-auto h-12 w-12 text-white/20" />
              <p className="mt-4 text-lg font-semibold text-white/60">No posts yet</p>
              <p className="mt-1 text-sm text-white/40">
                Share content to see your top posts here
              </p>
            </div>
          )}
          {(postsStats?.topPosts ?? []).map((post: StylistPostHighlight) => (
            <button
              key={post.id}
              onClick={() => handlePostClick(post)}
              disabled={isLoadingPost}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left w-full"
            >
              {post.images?.length > 0 && (
                <div className="relative aspect-square overflow-hidden bg-slate-950/50">
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${post.images[0]})`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5 space-y-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium leading-relaxed text-white/90 line-clamp-4">
                      {stripHtml(post.body ?? "")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-purple-400/60" />
                      {formatDate(post.createdDate)}
                    </span>
                    <span className="text-white/30">•</span>
                    <span>Post #{post.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/20 to-pink-600/10">
                      <span className="text-sm font-bold text-pink-300">{post.likeCount}</span>
                    </div>
                    <span className="text-xs font-medium text-white/60">Likes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10">
                      <span className="text-sm font-bold text-blue-300">{post.commentCount}</span>
                    </div>
                    <span className="text-xs font-medium text-white/60">Comments</span>
                  </div>
                  <div className="ml-auto flex items-center gap-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 px-3 py-1.5">
                    <span className="text-sm font-bold text-purple-300">{post.totalEngagement}</span>
                    <span className="text-xs font-medium text-purple-300/70">Total</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onLike={handleLike}
          onPostUpdated={handlePostUpdated}
          onPostDeleted={handlePostDeleted}
        />
      )}
    </>
  );
}

