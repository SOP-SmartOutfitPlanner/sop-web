"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageCircle,
  UserPlus,
  Smile,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  X,
  Check,
} from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { toast } from "sonner";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { collectionAPI } from "@/lib/api";
import type { CollectionRecord, CollectionComment } from "@/lib/api";
import { COLLECTION_QUERY_KEYS } from "@/lib/collections/constants";
import { formatDate } from "@/lib/collections/utils";

const COMMENTS_PAGE_SIZE = 3;

interface CommentItemProps {
  comment: CollectionComment;
  userId: string | null;
  collectionId: number;
  onUpdate: () => void;
}

function CommentItem({
  comment,
  userId,
  collectionId,
  onUpdate,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setEditText(comment.comment);
  }, [comment.comment]);

  const updateMutation = useMutation({
    mutationFn: async (text: string) => {
      return collectionAPI.updateCollectionComment(comment.id, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.collectionComments(collectionId),
      });
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.collectionCommentsCount(collectionId),
      });
      setIsEditing(false);
      toast.success("Comment updated successfully");
      onUpdate();
    },
    onError: (error) => {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return collectionAPI.deleteCollectionComment(comment.id);
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.collectionComments(collectionId),
      });
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.collectionCommentsCount(collectionId),
      });
      toast.success("Comment deleted successfully");
      onUpdate();
    },
    onError: (error) => {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    },
  });

  const handleSave = useCallback(() => {
    if (!editText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    updateMutation.mutate(editText.trim());
  }, [editText, updateMutation]);

  const handleCancel = useCallback(() => {
    setEditText(comment.comment);
    setIsEditing(false);
  }, [comment.comment]);

  const handleDelete = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    deleteMutation.mutate();
    setIsDeleteDialogOpen(false);
  }, [deleteMutation]);

  const isOwner = userId && parseInt(userId, 10) === comment.userId;

  return (
    <div className="flex gap-3 border-b border-slate-700/40 pb-4 last:border-b-0 last:pb-0">
      <Avatar className="h-10 w-10 shrink-0 border border-white/10 ring-1 ring-cyan-400/20">
        {comment.userAvatarUrl && (
          <AvatarImage
            src={comment.userAvatarUrl}
            alt={comment.userDisplayName}
          />
        )}
        <AvatarFallback className="bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-cyan-200 text-xs font-semibold">
          {comment.userDisplayName
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white">
              {comment.userDisplayName}
            </p>
            <span className="text-xs text-slate-500">
              {formatDate(comment.createdDate, {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {isOwner && !isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-md transition-colors"
                title="Edit comment"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md transition-colors disabled:opacity-50"
                title="Delete comment"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                }
                if (e.key === "Escape") {
                  handleCancel();
                }
              }}
              className="w-full px-3 py-2 rounded-lg border border-cyan-500/30 bg-slate-900/50 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending || !editText.trim()}
                size="sm"
                className="h-7 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/30"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Lưu
              </Button>
              <Button
                onClick={handleCancel}
                disabled={updateMutation.isPending}
                size="sm"
                variant="ghost"
                className="h-7 px-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Hủy
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-slate-300">
            {comment.comment}
          </p>
        )}
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="backdrop-blur-xl bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/90 border border-slate-700/50 shadow-2xl shadow-slate-900/50 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete comment
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600/50 bg-slate-900/30 text-slate-300 hover:bg-slate-800/50 hover:text-white hover:border-slate-500/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-rose-500/80 hover:bg-rose-500 text-white"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface CommentsSectionProps {
  collectionId: number;
  collection: CollectionRecord;
  user: { id: string; avatar?: string; displayName?: string } | null;
}

export function CommentsSection({
  collectionId,
  collection,
  user,
}: CommentsSectionProps) {
  const [commentText, setCommentText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: COLLECTION_QUERY_KEYS.collectionComments(collectionId, pageIndex),
    queryFn: async () => {
      const response = await collectionAPI.getCollectionComments(collectionId, {
        pageSize: COMMENTS_PAGE_SIZE,
        pageIndex,
        takeAll: false,
      });
      return {
        comments: response.data.data,
        metaData: response.data.metaData,
        totalCount: response.data.metaData.totalCount,
      };
    },
    enabled: !!collectionId,
  });

  const commentCount =
    commentsQuery.data?.totalCount ?? collection.commentCount;

  const createCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return collectionAPI.createCollectionComment({
        collectionId,
        userId: parseInt(user.id, 10),
        comment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.collectionComments(collectionId),
      });
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.collectionCommentsCount(collectionId),
      });
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.collection(collectionId),
      });
      setCommentText("");
      setPageIndex(1);
      toast.success("Comment posted successfully");
    },
    onError: (error) => {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    },
  });

  const handleSubmitComment = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentText.trim()) {
        return;
      }
      if (!user?.id) {
        toast.error("Please login to comment");
        return;
      }
      createCommentMutation.mutate(commentText);
    },
    [commentText, user?.id, createCommentMutation]
  );

  const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
    setCommentText((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  }, []);

  const toggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  return (
    <GlassCard
      padding="1.75rem"
      blur="18px"
      glowColor="rgba(59, 130, 246, 0.4)"
      glowIntensity={14}
      shadowColor="rgba(15, 23, 42, 0.5)"
      className="border border-slate-700/40 !overflow-visible"
      style={{ overflow: 'visible' }}
    >
      <div className="mb-4 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-cyan-300" />
        <h3 className="text-base font-semibold text-white">
          Comments ({commentCount})
        </h3>
      </div>

      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-br from-cyan-400/15 to-blue-400/15 border border-cyan-400/20 group hover:border-cyan-400/40 transition-all">
          <Avatar className="h-8 w-8 flex-shrink-0 ring-1.5 ring-cyan-400/20">
            {user?.avatar && (
              <AvatarImage src={user.avatar} alt={user.displayName || "User"} />
            )}
            <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
              {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <input
            type="text"
            placeholder="Share your thoughts about this collection..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={createCommentMutation.isPending}
            className="flex-1 outline-none bg-transparent text-sm text-blue-100 placeholder:text-cyan-400/50 focus:placeholder:text-blue-400/50 transition-colors disabled:opacity-50"
          />

          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="fixed z-[9999]"
              style={{
                top: 'auto',
                bottom: '80px',
                right: '20px',
              }}
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={320}
                height={400}
                searchDisabled
                skinTonesDisabled
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleEmojiPicker}
            className="h-auto p-1.5 text-cyan-400/70 hover:text-cyan-300 hover:bg-cyan-400/10 rounded-md transition-colors flex-shrink-0"
          >
            <Smile className="h-4 w-4" />
          </Button>

          {commentText.trim() && (
            <Button
              type="submit"
              disabled={createCommentMutation.isPending}
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-cyan-300 hover:text-cyan-200 font-semibold hover:bg-transparent transition-colors disabled:opacity-50"
            >
              {createCommentMutation.isPending ? "..." : "Send"}
            </Button>
          )}
        </div>
      </form>

      {commentsQuery.isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl bg-slate-900/50" />
          <Skeleton className="h-20 w-full rounded-xl bg-slate-900/50" />
        </div>
      )}

      {!commentsQuery.isLoading &&
        !commentsQuery.data?.comments?.length &&
        commentCount === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            No comments yet. Be the first to comment!
          </p>
        )}

      {commentsQuery.data?.comments &&
        commentsQuery.data.comments.length > 0 && (
          <>
            <div className="space-y-4">
              {commentsQuery.data.comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  userId={user?.id || null}
                  collectionId={collectionId}
                  onUpdate={() => {
                    queryClient.invalidateQueries({
                      queryKey:
                        COLLECTION_QUERY_KEYS.collectionComments(collectionId),
                    });
                  }}
                />
              ))}
            </div>

            {commentsQuery.data.metaData &&
              commentsQuery.data.metaData.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-slate-700/40 pt-4">
                  <div className="text-sm text-slate-400">
                    Page {commentsQuery.data.metaData.currentPage} /{" "}
                    {commentsQuery.data.metaData.totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPageIndex((prev) => Math.max(1, prev - 1))
                      }
                      disabled={
                        commentsQuery.isLoading ||
                        !commentsQuery.data.metaData.hasPrevious
                      }
                      className="border-slate-600/50 bg-slate-900/30 text-slate-300 hover:bg-slate-800/50 hover:text-white disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Forward
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPageIndex((prev) =>
                          Math.min(
                            commentsQuery.data.metaData.totalPages,
                            prev + 1
                          )
                        )
                      }
                      disabled={
                        commentsQuery.isLoading ||
                        !commentsQuery.data.metaData.hasNext
                      }
                      className="border-slate-600/50 bg-slate-900/30 text-slate-300 hover:bg-slate-800/50 hover:text-white disabled:opacity-50"
                    >
                      Backward
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
          </>
        )}
    </GlassCard>
  );
}
