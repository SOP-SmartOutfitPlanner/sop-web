"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  Star,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Post } from "@/types/community";
import { format, formatDistanceToNow } from "date-fns";
import CommentSection from "@/components/community/comment/CommentSection";
import { CommentInput } from "@/components/community/comment/CommentInput";
import { useAuthStore } from "@/store/auth-store";
import { useScrollLock } from "@/hooks/useScrollLock";
import { communityAPI } from "@/lib/api/community-api";
import { toast } from "sonner";
import { usePostModal } from "@/hooks/community/usePostModal";
import { ReportDialog } from "@/components/community/report/ReportDialog";
import { EditPostDialog } from "@/components/community/EditPostDialog";
import { Badge } from "@/components/ui/badge";
import { PostContent } from "@/components/community/post/PostContent";
import { PostItemsGallery } from "@/components/community/PostItemsGallery";
import { PostOutfitDisplay } from "@/components/community/PostOutfitDisplay";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onLike: () => void;
  onPostUpdated?: () => void;
  onPostDeleted?: () => void;
}

/**
 * ✅ OPTIMIZED: Instagram-style post detail modal
 * - Uses usePostModal hook for image navigation and avatar fetching
 * - Fixed scrolling issue
 * - Clean separation of concerns
 */
export function PostModal({
  post,
  isOpen,
  onClose,
  onLike,
  onPostUpdated,
  onPostDeleted,
}: PostModalProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const commentInputRef = useRef<HTMLInputElement>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Check if current user is the post owner
  const isOwnPost = user && user.id === post.userId;
  const isAuthorStylist = post.userRole?.toUpperCase() === "STYLIST";

  // Lock body scroll when modal is open
  useScrollLock(isOpen);

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

  const hasTimestamp = Boolean(post.timestamp);
  const relativeTimestamp = hasTimestamp
    ? formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })
    : "Recently";

  const absoluteTimestamp = hasTimestamp
    ? format(new Date(post.timestamp), "PPP 'at' HH:mm")
    : undefined;

  const handleCommentButtonClick = () => {
    commentInputRef.current?.focus();
    commentInputRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
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

  const handleDeletePost = async () => {
    if (!user) {
      toast.error("Please login to delete post");
      return;
    }

    try {
      setIsDeleting(true);
      await communityAPI.deletePost(parseInt(post.id));
      toast.success("Post deleted successfully");
      setIsDeleteDialogOpen(false);
      onPostDeleted?.();
      onClose();
    } catch (error) {
      console.error("Error deleting post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete post";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReportPost = async (description: string) => {
    if (!user) {
      toast.error("Please login to report post");
      return;
    }

    try {
      await communityAPI.createReport({
        userId: parseInt(user.id),
        postId: parseInt(post.id),
        type: "POST",
        description,
      });
      toast.success("Report submitted successfully");
      setIsReportDialogOpen(false);
    } catch (error) {
      console.error("Error reporting post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit report";
      toast.error(errorMessage);
      throw error; // Re-throw to let ReportDialog handle it
    }
  };

  const handleEditPostSuccess = async () => {
    setIsEditDialogOpen(false);
    onPostUpdated?.();
  };

  // Ensure EditPostDialog has higher z-index than PostModal
  useEffect(() => {
    if (isEditDialogOpen) {
      const style = document.createElement("style");
      style.id = "edit-post-dialog-z-index";
      style.textContent = `
        [data-radix-portal] [data-slot="dialog-overlay"]:last-of-type {
          z-index: 60 !important;
        }
        [data-radix-portal] [data-slot="dialog-content"]:last-of-type {
          z-index: 60 !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        const existingStyle = document.getElementById(
          "edit-post-dialog-z-index"
        );
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [isEditDialogOpen]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          overlayClassName="z-[70]"
          className={`z-[71] !p-0 !gap-0 backdrop-blur-2xl bg-slate-950/60 border border-cyan-400/15 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden flex flex-col ${
            hasMultipleImages || currentImage
              ? "!max-w-[1200px] !w-[90vw] !h-[85vh]"
              : "!max-w-[700px] !w-[90vw] !h-[85vh]"
          }`}
          aria-describedby={undefined}
          showCloseButton={false}
        >
          {/* Hidden title for accessibility */}
          <DialogTitle className="sr-only">
            {post.userDisplayName}&apos;s post
          </DialogTitle>

          <div
            className={`flex min-h-0 rounded-3xl ${
              hasMultipleImages || currentImage
                ? "h-full w-full"
                : "flex-col h-full"
            }`}
          >
            {/* Left: Image - Only show if has images */}
            {(hasMultipleImages || currentImage) && (
              <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-950/30 rounded-l-3xl min-w-0">
                {currentImage ? (
                  <>
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Image
                        src={currentImage}
                        alt={post.caption}
                        width={1080}
                        height={1080}
                        className="w-full h-full object-contain"
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
              className={`flex flex-col border-l border-slate-700/30 bg-slate-900/40 min-h-0 ${
                hasMultipleImages || currentImage
                  ? "w-[450px] rounded-r-3xl h-full"
                  : "w-full rounded-3xl flex-1"
              }`}
            >
              {/* HEADER: Avatar + Name + Time - FIXED */}
              <div className="flex-shrink-0 flex items-center justify-between py-4 px-4 border-b border-slate-700/20 bg-slate-900/80 backdrop-blur-md z-20">
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
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">
                        {post.userDisplayName}
                      </span>
                      {isAuthorStylist && (
                        <Badge
                          variant="secondary"
                          className="text-xs uppercase tracking-wide bg-gradient-to-r from-cyan-500/25 via-blue-500/25 to-purple-500/25 text-cyan-100 border border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.35)]"
                        >
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Stylist
                        </Badge>
                      )}
                    </div>
                    <TooltipProvider delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs text-slate-400 font-medium cursor-default">
                            {relativeTimestamp}
                          </span>
                        </TooltipTrigger>
                        {absoluteTimestamp && (
                          <TooltipContent className="backdrop-blur-md bg-slate-900/80 border border-cyan-400/20 text-white/90">
                            {absoluteTimestamp}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-cyan-400/20 transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5 text-cyan-300" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="min-w-[180px] backdrop-blur-xl bg-gradient-to-br from-cyan-950/90 via-blue-950/85 to-indigo-950/90 border-2 border-cyan-400/25 shadow-2xl shadow-cyan-500/20 text-white/90 z-[9999]"
                  >
                    {isOwnPost ? (
                      <>
                        <DropdownMenuItem
                          onClick={() => setIsEditDialogOpen(true)}
                          className="focus:bg-cyan-500/20 focus:text-white cursor-pointer"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit post
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setIsDeleteDialogOpen(true)}
                          className="text-red-400 focus:text-red-300 focus:bg-red-500/20 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete post
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => {
                          if (!user) {
                            toast.error("Please login to report post");
                            return;
                          }
                          setIsReportDialogOpen(true);
                        }}
                        className="focus:bg-cyan-500/20 focus:text-white cursor-pointer"
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* SCROLLABLE CONTENT - Everything scrolls together */}
              <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                {/* Caption Content */}
                <div className="py-4 px-4">
                  <PostContent
                    caption={post.caption}
                    tags={post.tags}
                    onTagClick={(tag) =>
                      router.push(`/community?hashtag=${tag.id}`)
                    }
                    isModal={true}
                  />
                </div>

                {/* Items Display */}
                {post.items && post.items.length > 0 && (
                  <div className="px-4 pb-4">
                    <PostItemsGallery
                      items={post.items}
                      postId={parseInt(post.id)}
                    />
                  </div>
                )}

                {/* Outfit Display */}
                {post.outfit && (
                  <div className="px-4 pb-4">
                    <PostOutfitDisplay
                      outfit={post.outfit}
                      postId={parseInt(post.id)}
                    />
                  </div>
                )}

                {/* Interactions Bar */}
                <div className="py-3 px-4 border-y border-slate-700/20 bg-slate-900/60">
                  {/* Action buttons */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-4">
                      <button
                        onClick={onLike}
                        className="p-2 rounded-lg hover:bg-cyan-500/10 transition-all"
                        aria-label={post.isLiked ? "Unlike post" : "Like post"}
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
                        aria-label="Comment on post"
                      >
                        <MessageCircle className="w-6 h-6" />
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

                {/* Comment Input - Now inside scrollable area */}
                {user && (
                  <div className="px-4 py-3 border-b border-slate-700/20 bg-slate-900/40">
                    <CommentInput
                      ref={commentInputRef}
                      userName={user.displayName || user.email || "User"}
                      onSubmit={handlePostComment}
                    />
                  </div>
                )}

                {/* Comments Section */}
                <div className="py-4 px-4">
                  <CommentSection
                    postId={post.id}
                    commentCount={commentCount}
                    onCommentCountChange={setCommentCount}
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>

        {/* Report Dialog */}
        <ReportDialog
          open={isReportDialogOpen}
          onOpenChange={setIsReportDialogOpen}
          onSubmit={handleReportPost}
          title="Report Post"
          description="Select a reason for reporting this post. Our team will review it as soon as possible."
          confirmLabel="Submit report"
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent className="backdrop-blur-xl bg-gradient-to-br from-cyan-950/70 via-blue-950/60 to-indigo-950/60 border border-cyan-400/20 shadow-2xl shadow-cyan-500/20 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete post</AlertDialogTitle>
              <AlertDialogDescription className="text-blue-100/80">
                Are you sure you want to delete this post? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3">
              <AlertDialogCancel className="border backdrop-blur-xl bg-gradient-to-br from-cyan-950/70 via-blue-950/60 to-indigo-950/60 border-transparent text-slate-200 hover:border-cyan-400/40 hover:bg-cyan-500/10">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="bg-red-500/80 hover:bg-red-500 text-white"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </Dialog>

      {/* Edit Post Dialog - Render outside PostModal to ensure proper z-index */}
      {isEditDialogOpen && (
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => !open && setIsEditDialogOpen(false)}
        >
          <DialogContent
            showCloseButton={false}
            className="max-w-2xl max-h-[90vh] !overflow-hidden p-0 flex flex-col backdrop-blur-xl bg-gradient-to-br from-cyan-950/60 via-blue-950/50 to-indigo-950/60 border-2 border-cyan-400/25 shadow-2xl shadow-cyan-500/20"
          >
            <EditPostDialog
              post={post}
              onSuccess={handleEditPostSuccess}
              onClose={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
