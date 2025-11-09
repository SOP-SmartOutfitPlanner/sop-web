"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
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

interface PostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onLike: () => void;
}

/**
 * Instagram-style post detail modal
 * Layout: Image on left, Comments/Info on right
 */
export function PostModal({ post, isOpen, onClose, onLike }: PostModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [commentCount, setCommentCount] = useState(post.comments.length);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(
    post.userAvatarUrl
  );
  const { user } = useAuthStore();
  const hasMultipleImages = post.images.length > 1;
  const currentImage = post.images[currentImageIndex] || post.images[0];

  const handleNextImage = () => {
    if (currentImageIndex < post.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Fetch user avatar if not available from post
  useEffect(() => {
    if (!post.userAvatarUrl && isOpen) {
      const fetchUserAvatar = async () => {
        try {
          const userAPI = await import("@/lib/api/user-api").then(
            (m) => m.userAPI
          );
          const userData = await userAPI.getUserById(parseInt(post.userId));
          if (userData.data.avtUrl) {
            setUserAvatarUrl(userData.data.avtUrl);
          }
        } catch (error) {
          console.error("[PostModal] Error fetching user avatar:", error);
        }
      };
      fetchUserAvatar();
    }
  }, [post.userAvatarUrl, post.userId, isOpen]);

  const handlePostComment = async (comment: string) => {
    if (!user) {
      toast.error("Please login to comment");
      return;
    }

    try {
      await communityAPI.createComment({
        postId: parseInt(post.id),
        userId: parseInt(user.id),
        comment: comment,
        parentCommentId: null,
      });

      // Trigger refresh comments
      window.dispatchEvent(
        new CustomEvent("refreshComments", { detail: { postId: post.id } })
      );

      toast.success("Comment posted!");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="!max-w-[1200px] !w-[90vw] !h-[85vh] !p-0 !gap-0 bg-background overflow-hidden flex flex-col"
        aria-describedby={undefined}
        showCloseButton={false}
      >
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">
          {post.userDisplayName}&apos;s post
        </DialogTitle>

        <div className="flex flex-1 h-full w-full min-h-0">
          {/* Left: Image */}
          <div className="flex-1 bg-white relative flex items-center justify-center overflow-hidden">
            {currentImage ? (
              <>
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={currentImage}
                    alt={post.caption}
                    width={1080}
                    height={1080}
                    className="max-w-full max-h-full w-auto h-auto object-contain"
                    priority
                  />
                </div>

                {/* Image navigation */}
                {hasMultipleImages && (
                  <>
                    {currentImageIndex > 0 && (
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center z-10"
                      >
                        <svg
                          className="w-4 h-4"
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center z-10"
                      >
                        <svg
                          className="w-4 h-4"
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
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                      {post.images.map((_, index) => (
                        <div
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full ${
                            index === currentImageIndex
                              ? "bg-primary"
                              : "bg-white/50"
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
          <div className="w-[450px] min-w-[450px] flex flex-col border-l flex-shrink-0 bg-background">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  {userAvatarUrl && (
                    <AvatarImage
                      src={userAvatarUrl}
                      alt={post.userDisplayName || "User"}
                    />
                  )}
                  {/* <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-white">
                    {post.userDisplayName.charAt(0)}
                  </AvatarFallback> */}
                </Avatar>
                <div className="font-semibold text-sm">
                  {post.userDisplayName}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>

            {/* Caption & Comments */}
            <div className="flex-1 overflow-y-auto px-4">
              {/* Original post caption */}
              <div className="flex gap-3 py-4 border-b">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  {userAvatarUrl && (
                    <AvatarImage
                      src={userAvatarUrl}
                      alt={post.userDisplayName || "User"}
                    />
                  )}
                  {/* <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-white">
                    {post.userDisplayName.charAt(0)}
                  </AvatarFallback> */}
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-semibold mr-2">
                      {post.userDisplayName}
                    </span>
                    {post.caption}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(post.timestamp), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="text-xs text-primary hover:underline cursor-pointer"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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
            <div className="border-t">
              {/* Action buttons */}
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex gap-4">
                  <button
                    onClick={onLike}
                    className="hover:opacity-60 transition-opacity"
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        post.isLiked ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </button>
                  <button className="hover:opacity-60 transition-opacity">
                    <MessageCircle className="w-6 h-6" />
                  </button>
                  <button className="hover:opacity-60 transition-opacity">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
                <button className="hover:opacity-60 transition-opacity">
                  <Bookmark className="w-6 h-6" />
                </button>
              </div>

              {/* Like count */}
              <div className="px-4 pb-2">
                <div className="font-semibold text-sm">
                  {post.likes} {post.likes === 1 ? "like" : "likes"}
                </div>
                <div className="text-xs text-muted-foreground">
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
