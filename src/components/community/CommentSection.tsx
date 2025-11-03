"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Reply, Send, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

function CommentItem({ comment, postId, onNewReply, replies = [] }: CommentItemProps) {
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
    <div className="space-y-3">
      {/* Main Comment */}
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {comment.userDisplayName?.charAt(0)?.toUpperCase() || comment.userId.toString().charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="font-medium text-sm text-gray-900">
              {comment.userDisplayName || `User ${comment.userId}`}
            </p>
            <p className="text-sm text-gray-700">{comment.comment}</p>
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{new Date(comment.createdDate).toLocaleDateString()}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="h-auto p-0 text-xs text-gray-500 hover:text-blue-600"
            >
              <Reply className="w-3 h-3 mr-1" />
              Reply
            </Button>
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-11 space-y-3">
          {replies.map((reply) => (
            <div key={reply.id} className="flex space-x-3">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {reply.userDisplayName?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                  <p className="font-medium text-xs text-gray-900">
                    {reply.userDisplayName || "User"}
                  </p>
                  <p className="text-sm text-gray-700">{reply.comment}</p>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                  <span>{new Date(reply.createdDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {showReplyForm && (
        <div className="ml-11">
          <div className="flex space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[60px] text-sm resize-none"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyText("");
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyText.trim() || isSubmitting}
                  className="text-xs"
                >
                  {isSubmitting ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                  ) : (
                    <Send className="w-3 h-3 mr-1" />
                  )}
                  Reply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ postId, commentCount, onCommentCountChange }: CommentSectionProps) {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const parentComments = await communityAPI.getComments(parseInt(postId));
      
      // Load child comments for each parent comment
      const commentsWithReplies = await Promise.all(
        parentComments.map(async (comment) => {
          try {
            const childComments = await communityAPI.getChildComments(comment.id);
            return { ...comment, replies: childComments };
          } catch (error) {
            console.error(`Error loading replies for comment ${comment.id}:`, error);
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
    if (isExpanded) {
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded, postId]);

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const createdComment = await communityAPI.createComment({
        postId: parseInt(postId),
        userId: parseInt(user.id),
        comment: newComment.trim(),
        parentCommentId: null,
      });

      const commentWithUser = {
        ...createdComment,
        userDisplayName: user.displayName,
        replies: [] // New comments start with empty replies
      };

      const newComments = [commentWithUser, ...comments];
      setComments(newComments);
      setNewComment("");
      // Update comment count (including all replies)
      const totalComments = newComments.reduce((total, comment) => {
        return total + 1 + (comment.replies?.length || 0);
      }, 0);
      onCommentCountChange?.(totalComments);
      toast.success("Comment added!");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewReply = async (parentId: number) => {
    // Refresh child comments for the parent comment
    try {
      const updatedChildComments = await communityAPI.getChildComments(parentId);
      
      setComments(comments.map(comment => {
        if (comment.id === parentId) {
          return { ...comment, replies: updatedChildComments };
        }
        return comment;
      }));
      
      // Update total comment count (including all replies)
      const totalComments = comments.reduce((total, comment) => {
        return total + 1 + (comment.replies?.length || 0);
      }, 0) + 1; // +1 for the new reply
      
      onCommentCountChange?.(totalComments);
    } catch (error) {
      console.error('Error refreshing replies:', error);
      toast.error('Failed to refresh replies');
    }
  };

  // Filter only parent comments (those with parentCommentId === null)
  const parentComments = comments.filter(comment => comment.parentCommentId === null);

  return (
    <div className="space-y-3">
      {/* Comment Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 p-0"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm">
          {commentCount} {commentCount === 1 ? "comment" : "comments"}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>

      {/* Comments Section */}
      {isExpanded && (
        <div className="space-y-4 border-t pt-4">
          {/* Add Comment Form */}
          {user && (
            <div className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user.displayName?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmitting}
                    size="sm"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : parentComments.length > 0 ? (
            <div className="space-y-4">
              {parentComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postId={postId}
                  onNewReply={handleNewReply}
                  replies={comment.replies || []}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </div>
  );
}