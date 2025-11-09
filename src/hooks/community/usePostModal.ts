import { useState, useEffect } from "react";
import { userAPI } from "@/lib/api/user-api";
import { Post } from "@/types/community";

interface UsePostModalProps {
  post: Post;
  isOpen: boolean;
}

/**
 * Custom hook for PostModal logic
 * Handles image navigation and avatar fetching
 */
export function usePostModal({ post, isOpen }: UsePostModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [commentCount, setCommentCount] = useState(post.comments.length);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(
    post.userAvatarUrl
  );

  const hasMultipleImages = post.images.length > 1;
  const currentImage = post.images[currentImageIndex] || post.images[0];

  // Image navigation handlers
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

  // Fetch user avatar if not available
  useEffect(() => {
    if (!post.userAvatarUrl && isOpen) {
      const fetchUserAvatar = async () => {
        try {
          const userData = await userAPI.getUserById(parseInt(post.userId));
          if (userData.data.avtUrl) {
            setUserAvatarUrl(userData.data.avtUrl);
          }
        } catch (error) {
          console.error("[usePostModal] Error fetching user avatar:", error);
        }
      };
      fetchUserAvatar();
    }
  }, [post.userAvatarUrl, post.userId, isOpen]);

  return {
    currentImageIndex,
    currentImage,
    hasMultipleImages,
    commentCount,
    setCommentCount,
    userAvatarUrl,
    handleNextImage,
    handlePrevImage,
  };
}

