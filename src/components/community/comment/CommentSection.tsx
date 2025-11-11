"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { communityAPI } from "@/lib/api/community-api";
import { useAuthStore } from "@/store/auth-store";
import { ApiComment } from "@/types/community";
import { toast } from "sonner";

interface CommentSectionProps {
  postId: string;
  commentCount: number;
  onCommentCountChange?: (newCount: number) => void;
}

interface CommentItemProps {
  comment: ApiComment;
  postId: string;
  onNewReply: (parentId: number) => void;
  replies?: ApiComment[];
}

interface ReplyItemProps {
  reply: ApiComment;
  postId: string;
}

function ReplyItem({ reply, postId }: ReplyItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.comment);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { user } = useAuthStore();
  
  const isOwnReply = user && reply.userId === parseInt(user.id);

  const handleEdit = async () => {
    if (!editText.trim()) return;

    setIsUpdating(true);
    try {
      await communityAPI.updateComment(reply.id, editText.trim());
      window.dispatchEvent(
        new CustomEvent("refreshComments", { detail: { postId } })
      );
      setIsEditing(false);
      toast.success("Reply updated successfully");
    } catch (error) {
      console.error("Error updating reply:", error);
      toast.error("Failed to update reply");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await communityAPI.deleteComment(reply.id);
      window.dispatchEvent(
        new CustomEvent("refreshComments", { detail: { postId } })
      );
      toast.success("Reply deleted successfully");
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting reply:", error);
      toast.error("Failed to delete reply");
    }
  };

  return (
    <div className="flex gap-3 group">
      <Avatar className="w-6 h-6 flex-shrink-0 ring-1 ring-cyan-400/15">
        {reply.userAvatarUrl && (
          <AvatarImage
            src={reply.userAvatarUrl}
            alt={reply.userDisplayName || "User"}
          />
        )}
        <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
          {reply.userDisplayName?.charAt(0)?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex flex-col gap-2 p-2 rounded-lg bg-gradient-to-br from-cyan-400/5 to-blue-400/5 border border-cyan-400/10">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleEdit();
                }
                if (e.key === "Escape") {
                  setEditText(reply.comment);
                  setIsEditing(false);
                }
              }}
              className="flex-1 outline-none bg-transparent text-sm text-blue-100 placeholder:text-blue-300/50"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleEdit}
                disabled={isUpdating || !editText.trim()}
                variant="ghost"
                className="h-auto px-2 py-0.5 text-xs text-cyan-300 hover:text-cyan-200 font-semibold hover:bg-cyan-400/10 transition-colors disabled:opacity-50"
              >
                {isUpdating ? "..." : "Save"}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEditText(reply.comment);
                  setIsEditing(false);
                }}
                disabled={isUpdating}
                variant="ghost"
                className="h-auto px-2 py-0.5 text-xs text-slate-400 hover:text-slate-300 font-semibold hover:bg-slate-400/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm">
              <span className="font-semibold text-white mr-2">
                {reply.userDisplayName || "User"}
              </span>
              <span className="text-white/95 font-medium break-words">
                {reply.comment}
              </span>
              {/* {reply.updatedDate && (
                <span className="text-xs text-slate-400 ml-2">(edited)</span>
              )} */}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-slate-400 font-medium">
                {new Date(reply.createdDate).toLocaleDateString("vi-VN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {isOwnReply && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-auto p-0 text-xs text-blue-400 hover:text-blue-300 font-semibold hover:bg-transparent transition-all opacity-0 group-hover:opacity-100"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="h-auto p-0 text-xs text-red-400 hover:text-red-300 font-semibold hover:bg-transparent transition-all opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </Button>

                  {/* Delete Confirmation Dialog */}
                  <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-red-500/20">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-red-400">
                          Delete Reply
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-300">
                          Are you sure you want to delete this reply? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  postId,
  onNewReply,
  replies = [],
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { user } = useAuthStore();

  // Check if current user owns this comment
  const isOwnComment = user && comment.userId === parseInt(user.id);

  const handleReply = async () => {
    if (!user || !replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await communityAPI.createComment({
        postId: parseInt(postId),
        userId: parseInt(user.id),
        comment: replyText.trim(),
        parentCommentId: comment.id,
      });

      onNewReply(comment.id);

      setReplyText("");
      setShowReplyForm(false);
      toast.success(response.message || "Reply added successfully");
    } catch {
      toast.error("Failed to add reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!user || !isOwnComment || !editText.trim()) return;

    setIsSubmitting(true);
    try {
      await communityAPI.updateComment(comment.id, editText.trim());
      
      // Dispatch event to refresh comments
      window.dispatchEvent(
        new CustomEvent("refreshComments", { detail: { postId } })
      );
      
      setIsEditing(false);
      toast.success("Comment updated successfully");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(comment.comment);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!user || !isOwnComment) return;

    setIsDeleting(true);
    try {
      await communityAPI.deleteComment(comment.id);
      
      // Dispatch event to refresh comments
      window.dispatchEvent(
        new CustomEvent("refreshComments", { detail: { postId } })
      );
      
      toast.success("Comment deleted successfully");
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Main Comment */}
      <div className="flex gap-3 group">
        <Avatar className="w-8 h-8 flex-shrink-0 ring-1.5 ring-cyan-400/20">
          {comment.userAvatarUrl && (
            <AvatarImage
              src={comment.userAvatarUrl}
              alt={comment.userDisplayName || "User"}
            />
          )}
          <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
            {comment.userDisplayName?.charAt(0)?.toUpperCase() ||
              comment.userId.toString().charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          {/* Edit Mode */}
          {isEditing ? (
            <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-gradient-to-br from-cyan-400/5 to-blue-400/5 border border-cyan-400/10">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleEdit();
                  }
                  if (e.key === "Escape") {
                    handleCancelEdit();
                  }
                }}
                className="flex-1 outline-none bg-transparent text-sm text-blue-100 placeholder:text-blue-300/50 focus:placeholder:text-blue-300/70 transition-colors"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={isSubmitting || !editText.trim()}
                  variant="ghost"
                  className="h-auto px-2 py-1 text-xs text-cyan-300 hover:text-cyan-200 font-semibold hover:bg-cyan-400/10 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  variant="ghost"
                  className="h-auto px-2 py-1 text-xs text-slate-400 hover:text-slate-300 font-semibold hover:bg-slate-400/10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-sm">
                <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-200 mr-2">
                  {comment.userDisplayName || `User ${comment.userId}`}
                </span>
                <span className="text-white/95 font-medium break-words">
                  {comment.comment}
                </span>
                {/* {comment.updatedDate && (
                  <span className="text-xs text-slate-400 ml-2">(edited)</span>
                )} */}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-blue-200/70 font-medium">
                  {new Date(comment.createdDate).toLocaleDateString("vi-VN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="h-auto p-0 text-xs text-cyan-200 hover:text-cyan-100 font-semibold hover:bg-transparent transition-colors"
                >
                  Reply
                </Button>
                {isOwnComment && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-auto p-0 text-xs text-blue-400 hover:text-blue-300 font-semibold hover:bg-transparent transition-all opacity-0 group-hover:opacity-100"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={isDeleting}
                      className="h-auto p-0 text-xs text-red-400 hover:text-red-300 font-semibold hover:bg-transparent transition-all disabled:opacity-50 opacity-0 group-hover:opacity-100"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>

                    {/* Delete Confirmation Dialog */}
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <AlertDialogContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-red-500/20">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-bold text-red-400">
                            Delete Comment
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-300">
                            Are you sure you want to delete this comment? This action cannot be undone and will also delete all replies.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-11 space-y-2 border-l border-slate-700/20 pl-3">
          {replies.map((reply) => (
            <ReplyItem key={reply.id} reply={reply} postId={postId} />
          ))}
        </div>
      )}

      {/* Reply Form */}
      {showReplyForm && (
        <div className="ml-11 flex gap-2 p-2.5 rounded-lg bg-gradient-to-br from-cyan-400/5 to-blue-400/5 border border-cyan-400/10 group">
          <Avatar className="w-6 h-6 flex-shrink-0 ring-1 ring-cyan-400/20">
            <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
              {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="Add a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleReply();
                }
              }}
              className="flex-1 outline-none bg-transparent text-sm text-blue-100 placeholder:text-blue-300/50 focus:placeholder:text-blue-300/70 transition-colors disabled:opacity-50"
              autoFocus
            />
            {replyText.trim() && (
              <Button
                size="sm"
                onClick={handleReply}
                disabled={isSubmitting}
                variant="ghost"
                className="h-auto p-0 text-xs text-cyan-300 hover:text-cyan-200 font-semibold hover:bg-transparent transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "..." : "Post"}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommentSection({
  postId,
  onCommentCountChange,
}: CommentSectionProps) {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const parentComments = await communityAPI.getComments(parseInt(postId));

      // Load child comments for each parent comment
      const commentsWithReplies = await Promise.all(
        parentComments.map(async (comment) => {
          try {
            const childComments = await communityAPI.getChildComments(
              comment.id
            );
            return { ...comment, replies: childComments };
          } catch (error) {
            console.error(
              `Error loading replies for comment ${comment.id}:`,
              error
            );
            return { ...comment, replies: [] };
          }
        })
      );

      setComments(commentsWithReplies);
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();

    // Listen for refresh event
    const handleRefresh = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.postId === postId) {
        loadComments();
      }
    };

    window.addEventListener("refreshComments", handleRefresh);
    return () => window.removeEventListener("refreshComments", handleRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleNewReply = async (parentId: number) => {
    // Refresh child comments for the parent comment
    try {
      const updatedChildComments = await communityAPI.getChildComments(
        parentId
      );

      const updatedComments = comments.map((comment) => {
        if (comment.id === parentId) {
          return { ...comment, replies: updatedChildComments };
        }
        return comment;
      });

      setComments(updatedComments);

      // Calculate total comments including all replies
      const totalComments = updatedComments.reduce((total, comment) => {
        return total + 1 + (comment.replies?.length || 0);
      }, 0);

      onCommentCountChange?.(totalComments);
      // Note: Success toast is already shown in handleReply
    } catch (error) {
      console.error("Error refreshing replies:", error);
      toast.error("Failed to refresh replies");
    }
  };

  // Filter only parent comments (those with parentCommentId === null)
  const parentComments = comments.filter(
    (comment) => comment.parentCommentId === null
  );

  return (
    <div className="flex flex-col h-full">
      {/* Comments List - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : parentComments.length > 0 ? (
          <>
            {parentComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                onNewReply={handleNewReply}
                replies={comment.replies || []}
              />
            ))}
          </>
        ) : (
          <p className="text-center text-blue-200/70 font-medium   text-sm py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}
