"use client";

import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Post } from "@/types/community";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import CommentSection from "@/components/community/comment/CommentSection";
import { CommentInput } from "@/components/community/comment/CommentInput";
import { useAuthStore } from "@/store/auth-store";
import { communityAPI } from "@/lib/api/community-api";
import { toast } from "sonner";
import { usePostModal } from "@/hooks/community/usePostModal";

interface PostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onLike: () => void;
}

/**
 * ✅ OPTIMIZED: Instagram-style post detail modal
 * - Uses usePostModal hook for image navigation and avatar fetching
 * - Reduced from ~330 lines to ~200 lines
 * - Clean separation of concerns
 */
export function PostModal({ post, isOpen, onClose, onLike }: PostModalProps) {
  const { user } = useAuthStore();
  
  // Use custom hook for modal logic
  const {
    currentImageIndex,
    currentImage,
    hasMultipleImages,
    commentCount,
    setCommentCount,
    userAvatarUrl,
    handleNextImage,
    handlePrevImage,
  } = usePostModal({ post, isOpen });

  const handlePostComment = async (comment: string) => {
    if (!user) {
      toast.error("Please login to comment");
      return;
    }

    try {
      const response = await communityAPI.createComment({
        postId: parseInt(post.id),
        userId: parseInt(user.id),
        comment: comment,
        parentCommentId: null,
      });

      // Trigger refresh comments
      window.dispatchEvent(
        new CustomEvent("refreshComments", { detail: { postId: post.id } })
      );

      // Show API message
      if (response.comment) {
        toast.success(response.comment);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to post comment";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="!max-w-[1200px] !w-[90vw] !h-[85vh] !p-0 !gap-0 backdrop-blur-2xl bg-gradient-to-br from-cyan-400/15 via-blue-400/10 to-indigo-400/15 border-2 border-cyan-400/25 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden flex flex-col"
        aria-describedby={undefined}
        showCloseButton={false}
      >
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">
          {post.userDisplayName}&apos;s post
        </DialogTitle>

        <div className="flex flex-1 h-full w-full min-h-0 overflow-hidden rounded-3xl">
          {/* Left: Image */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-indigo-900/5 px-2 rounded-l-3xl">
            {currentImage ? (
              <>
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={currentImage}
                    alt={post.caption}
                    width={1080}
                    height={1080}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>

                {/* Image navigation */}
                {hasMultipleImages && (
                  <>
                    {currentImageIndex > 0 && (
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/60 to-blue-500/60 hover:from-cyan-500/80 hover:to-blue-500/80 flex items-center justify-center z-10 transition-all shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 backdrop-blur-sm border border-cyan-400/30 hover:border-cyan-400/50 text-white"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                    )}
                    {currentImageIndex < post.images.length - 1 && (
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/60 to-blue-500/60 hover:from-cyan-500/80 hover:to-blue-500/80 flex items-center justify-center z-10 transition-all shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 backdrop-blur-sm border border-cyan-400/30 hover:border-cyan-400/50 text-white"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Dots indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
                      {post.images.map((_, index) => (
                        <div
                          key={index}
                          className={`rounded-full transition-all duration-300 ${
                            index === currentImageIndex
                              ? "bg-cyan-400 w-2.5 h-2.5 shadow-lg shadow-cyan-500/50"
                              : "bg-white/40 w-2 h-2 hover:bg-white/60"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-white">No image</div>
            )}
          </div>

          {/* Right: Post info and comments */}
          <div className="w-[450px] min-w-[450px] flex flex-col border-l border-cyan-400/20 flex-shrink-0 bg-gradient-to-b from-cyan-400/5 to-blue-400/5 rounded-r-3xl">
            {/* Caption & Comments */}
            <div className="flex-1 overflow-y-auto px-4 flex flex-col">
              {/* Post Header with Avatar */}
              <div className="flex items-center justify-between py-4 px-0 border-b border-cyan-400/5 group">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 ring-2 ring-cyan-400/30 hover:ring-cyan-400/50 transition-all">
                    {userAvatarUrl && (
                      <AvatarImage
                        src={userAvatarUrl}
                        alt={post.userDisplayName || "User"}
                      />
                    )}
                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
                      {post.userDisplayName?.charAt(0)?.toUpperCase() ||
                        post.userId.toString().charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-200">
                      {post.userDisplayName}
                    </div>
                    <div className="text-xs text-blue-200/70 font-medium">
                      {formatDistanceToNow(new Date(post.timestamp), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-cyan-400/20 transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-cyan-300" />
                </Button>
              </div>

              {/* Caption Content */}
              <div className="py-3">
                <p className="text-white font-medium leading-relaxed">
                  {post.caption}
                </p>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.map((tag, index) => (
                      <span
                        key={`${tag.id}-${index}`}
                        className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/40 text-white font-semibold transition-all duration-300 cursor-pointer backdrop-blur-sm hover:shadow-lg hover:shadow-cyan-500/20"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="py-4">
                <CommentSection
                  postId={post.id}
                  commentCount={commentCount}
                  onCommentCountChange={setCommentCount}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-cyan-400/5 bg-gradient-to-r from-cyan-400/5 to-blue-400/5">
              {/* Action buttons */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-400/3">
                <div className="flex gap-4">
                  <button
                    onClick={onLike}
                    className="p-2 rounded-lg hover:bg-cyan-400/20 transition-all hover:text-cyan-300"
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        post.isLiked ? "fill-red-500 text-red-500" : "text-cyan-300"
                      }`}
                    />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-cyan-400/20 transition-all text-cyan-300 hover:text-cyan-200">
                    <MessageCircle className="w-6 h-6" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-cyan-400/20 transition-all text-cyan-300 hover:text-cyan-200">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
                <button className="p-2 rounded-lg hover:bg-cyan-400/20 transition-all text-cyan-300 hover:text-cyan-200">
                  <Bookmark className="w-6 h-6" />
                </button>
              </div>

              {/* Like count */}
              <div className="px-4 py-3">
                <div className="font-semibold text-sm bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-200">
                  {post.likes} {post.likes === 1 ? "like" : "likes"}
                </div>
                <div className="text-xs text-blue-200/60 mt-1">
                  {formatDistanceToNow(new Date(post.timestamp), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </div>
              </div>

              {/* Comment input */}
              {user && (
                <CommentInput
                  userName={user.displayName || user.email || "User"}
                  onSubmit={handlePostComment}
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
