"use client";

import { useRef } from "react";
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
  const commentInputRef = useRef<HTMLInputElement>(null);

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

  const handleCommentButtonClick = () => {
    commentInputRef.current?.focus();
    commentInputRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

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

      // Show API message or default success message
      toast.success(response.message || "Comment posted successfully");
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
        className={`!p-0 !gap-0 backdrop-blur-2xl bg-slate-950/60 border border-cyan-400/15 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden flex flex-col ${
          hasMultipleImages || currentImage
            ? "!max-w-[1200px] !w-[90vw] !h-[85vh]"
            : "!max-w-[700px] !w-[90vw] !h-auto"
        }`}
        aria-describedby={undefined}
        showCloseButton={false}
      >
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">
          {post.userDisplayName}&apos;s post
        </DialogTitle>

        <div
          className={`flex flex-1 min-h-0 overflow-hidden rounded-3xl ${
            hasMultipleImages || currentImage ? "h-full w-full" : "flex-col"
          }`}
        >
          {/* Left: Image - Only show if has images */}
          {(hasMultipleImages || currentImage) && (
            <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-950/30 rounded-l-3xl">
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
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/5">
                        {post.images.map((_, index) => (
                          <div
                            key={index}
                            className={`rounded-full transition-all duration-300 ${
                              index === currentImageIndex
                                ? "bg-cyan-400 w-2.5 h-2.5 shadow-lg shadow-cyan-500/40"
                                : "bg-white/30 w-2 h-2 hover:bg-white/50"
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
          )}

          {/* Right: Post info and comments */}
          <div
            className={`flex flex-col border-l border-slate-700/30 flex-shrink-0 bg-slate-900/40 ${
              hasMultipleImages || currentImage
                ? "w-[450px] min-w-[450px] rounded-r-3xl"
                : "w-full rounded-3xl"
            }`}
          >
            {/* HEADER: Avatar + Name + Time */}
            <div className="flex items-center justify-between py-4 px-4 border-b border-slate-700/20 group flex-shrink-0">
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
                  <div className="font-semibold text-sm text-white">
                    {post.userDisplayName}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {formatDistanceToNow(new Date(post.timestamp), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-cyan-400/20 transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-cyan-300" />
              </Button>
            </div>

            {/* BODY: Caption + Interactions + Comments */}
            <div className="flex-1 overflow-y-auto px-4 flex flex-col min-h-0">
              {/* Caption Content */}
              <div className="py-4 border-b border-slate-700/20">
                <p
                  className={`text-white font-medium leading-relaxed ${
                    post.caption && post.caption.length < 100
                      ? "text-lg"
                      : "text-base"
                  }`}
                >
                  {post.caption}
                </p>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.map((tag, index) => (
                      <span
                        key={`${tag.id}-${index}`}
                        className="text-xs px-3 py-1 rounded-full bg-slate-800/25 hover:bg-slate-800/40 border border-slate-400/45 hover:border-cyan-400/50 text-slate-200 hover:text-cyan-300 font-medium transition-all duration-300 cursor-pointer"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Interactions Bar */}
              <div className="py-3 border-b border-slate-700/20">
                {/* Action buttons */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-4">
                    <button
                      onClick={onLike}
                      className="p-2 rounded-lg hover:bg-cyan-500/10 transition-all"
                    >
                      <Heart
                        className={`w-6 h-6 ${
                          post.isLiked
                            ? "fill-red-500 text-red-500"
                            : "text-white hover:text-cyan-300"
                        }`}
                      />
                    </button>
                    <button 
                      onClick={handleCommentButtonClick}
                      className="p-2 rounded-lg hover:bg-cyan-500/10 transition-all text-white hover:text-cyan-300"
                    >
                      <MessageCircle className="w-6 h-6" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-cyan-500/10 transition-all text-white hover:text-cyan-300">
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Like count */}
                <div>
                  <div className="font-semibold text-sm text-white">
                    {post.likes} {post.likes === 1 ? "like" : "likes"}
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="py-4 flex-1 min-h-0">
                <CommentSection
                  postId={post.id}
                  commentCount={commentCount}
                  onCommentCountChange={setCommentCount}
                />
              </div>
            </div>

            {/* FOOTER (Sticky): Comment Input */}
            {user && (
              <div className="border-t border-slate-700/20 bg-slate-900/30 flex-shrink-0 px-4 py-3">
                <CommentInput
                  ref={commentInputRef}
                  userName={user.displayName || user.email || "User"}
                  onSubmit={handlePostComment}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
