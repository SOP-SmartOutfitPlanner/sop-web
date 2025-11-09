import { useState, useCallback } from "react";
import { Post } from "@/types/community";
import { toast } from "sonner";

interface UsePostInteractionsProps {
  post: Post;
  isOwnPost: boolean;
  onLike: () => void;
  onReport: (reason: string) => void;
  onDelete?: () => Promise<void>;
}

export function usePostInteractions({
  post,
  isOwnPost,
  onLike,
  onReport,
  onDelete,
}: UsePostInteractionsProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = useCallback(() => {
    if (isLiking) return;
    setIsLiking(true);

    try {
      onLike();
    } finally {
      setTimeout(() => setIsLiking(false), 300);
    }
  }, [isLiking, onLike]);

  const handleDoubleClick = useCallback(() => {
    if (!post.isLiked) {
      handleLike();
    }
  }, [post.isLiked, handleLike]);

  const handleImageClick = useCallback(() => {
    setIsCommentModalOpen(true);
  }, []);

  const handleOpenComments = useCallback(() => {
    setIsCommentModalOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!isOwnPost || !onDelete) return;

    try {
      setIsDeleting(true);
      await onDelete();
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete post";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [isOwnPost, onDelete]);

  const handleReport = useCallback(
    (reason: string) => {
      onReport(reason);
    },
    [onReport]
  );

  return {
    // State
    isLiking,
    isCommentModalOpen,
    isChatModalOpen,
    isDeleting,
    setIsCommentModalOpen,
    setIsChatModalOpen,
    // Handlers
    handleLike,
    handleDoubleClick,
    handleImageClick,
    handleOpenComments,
    handleDelete,
    handleReport,
  };
}

