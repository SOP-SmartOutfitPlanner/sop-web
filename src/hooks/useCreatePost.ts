import { useState, useCallback } from "react";
import { toast } from "sonner";
import { communityAPI } from "@/lib/api/community-api";
import { useAuthStore } from "@/store/auth-store";
import { useQueryClient } from "@tanstack/react-query";

interface CreatePostData {
  caption: string;
  tags: string[];
  files?: File[]; // Changed to File[] for actual file upload
}

/**
 * Custom hook to handle post creation logic
 * API handles the image upload directly via multipart/form-data
 */
export function useCreatePost() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createPost = useCallback(
    async (postData: CreatePostData) => {
      if (!user) {
        console.error("No user found");
        toast.error("Please login to create a post");
        return false;
      }

      setIsCreating(true);
      setUploadProgress(0);

      try {
        // API handles everything in one request: multipart/form-data
        // - Accepts raw File objects
        // - Uploads images internally
        // - Returns post with image URLs from API
        const response = await communityAPI.createPost({
          userId: parseInt(user.id),
          body: postData.caption,
          hashtags: postData.tags,
          images: postData.files || [], // Pass raw files directly
        });

        // Invalidate queries to refetch posts
        queryClient.invalidateQueries({
          queryKey: ["posts", "all", user.id],
        });

        toast.success("Post created!", {
          description: "Your outfit has been shared with the community",
        });

        return true;
      } catch (error) {
        console.error("Error creating post:", error);
        toast.error("Failed to create post", {
          description:
            error instanceof Error ? error.message : "Please try again",
        });
        return false;
      } finally {
        setIsCreating(false);
        setUploadProgress(0);
      }
    },
    [user, queryClient]
  );

  return {
    createPost,
    isCreating,
    uploadProgress,
  };
}
