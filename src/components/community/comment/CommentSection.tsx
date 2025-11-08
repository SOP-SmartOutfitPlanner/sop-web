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
        <Avatar className="w-8 h-8 flex-shrink-0">
          {comment.userAvatarUrl && (
            <AvatarImage
              src={comment.userAvatarUrl}
              alt={comment.userDisplayName || "User"}
            />
          )}
          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            {comment.userDisplayName?.charAt(0)?.toUpperCase() ||
              comment.userId.toString().charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-sm">
            <span className="font-semibold mr-2">
              {comment.userDisplayName || `User ${comment.userId}`}
            </span>
            <span className="text-foreground break-words">
              {comment.comment}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground">
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
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground font-semibold hover:bg-transparent"
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
              <Avatar className="w-6 h-6 flex-shrink-0">
                {reply.userAvatarUrl && (
                  <AvatarImage
                    src={reply.userAvatarUrl}
                    alt={reply.userDisplayName || "User"}
                  />
                )}
                <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  {reply.userDisplayName?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="font-semibold mr-2">
                    {reply.userDisplayName || "User"}
                  </span>
                  <span className="text-foreground break-words">
                    {reply.comment}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {new Date(reply.createdDate).toLocaleDateString("vi-VN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground font-semibold hover:bg-transparent"
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
        <div className="ml-11 flex gap-2">
          <Avatar className="w-6 h-6 flex-shrink-0">
            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white">
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
              className="flex-1 outline-none bg-transparent text-sm placeholder:text-muted-foreground"
              autoFocus
            />
            {replyText.trim() && (
              <Button
                size="sm"
                onClick={handleReply}
                disabled={isSubmitting}
                variant="ghost"
                className="h-auto p-0 text-xs text-primary font-semibold hover:bg-transparent"
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
          <p className="text-center text-muted-foreground text-sm py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}
