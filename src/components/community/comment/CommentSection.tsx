"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

function CommentItem({
  comment,
  postId,
  onNewReply,
  replies = [],
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  const handleReply = async () => {
    if (!user || !replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await communityAPI.createComment({
        postId: parseInt(postId),
        userId: parseInt(user.id),
        comment: replyText.trim(),
        parentCommentId: comment.id,
      });

      onNewReply(comment.id);

      setReplyText("");
      setShowReplyForm(false);
      toast.success("Reply added!");
    } catch {
      toast.error("Failed to add reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Main Comment */}
      <div className="flex gap-3">
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
          <div className="text-sm">
            <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-200 mr-2">
              {comment.userDisplayName || `User ${comment.userId}`}
            </span>
            <span className="text-white/95 font-medium break-words">
              {comment.comment}
            </span>
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
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-11 space-y-2">
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
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
                <div className="text-sm">
                  <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-200 mr-2">
                    {reply.userDisplayName || "User"}
                  </span>
                  <span className="text-white/95 font-medium break-words">
                    {reply.comment}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-blue-200/70 font-medium">
                    {new Date(reply.createdDate).toLocaleDateString("vi-VN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-cyan-200 hover:text-cyan-100 font-semibold hover:bg-transparent transition-colors"
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </div>
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

      setComments(
        comments.map((comment) => {
          if (comment.id === parentId) {
            return { ...comment, replies: updatedChildComments };
          }
          return comment;
        })
      );

      // Update total comment count (including all replies)
      const totalComments =
        comments.reduce((total, comment) => {
          return total + 1 + (comment.replies?.length || 0);
        }, 0) + 1; // +1 for the new reply

      onCommentCountChange?.(totalComments);
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
