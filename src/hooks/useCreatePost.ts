import { useState, useCallback } from "react";
import { toast } from "sonner";
import { communityAPI } from "@/lib/api/community-api";
import { useAuthStore } from "@/store/auth-store";

interface CreatePostData {
  caption: string;
  tags: string[];
  image?: string;
}

/**
 * Custom hook to handle post creation logic
 * Separates post creation business logic from UI
 */
export function useCreatePost() {
  const { user } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);

  const createPost = useCallback(
    async (postData: CreatePostData) => {
      if (!user) {
        toast.error("Please login to create a post");
        return false;
      }

      setIsCreating(true);

      try {
        await communityAPI.createPost({
          userId: parseInt(user.id),
          body: postData.caption,
          hashtags: postData.tags,
          imageUrls: postData.image ? [postData.image] : [],
        });

        toast.success("Post created!", {
          description: "Your outfit has been shared with the community",
        });

        // React Query will auto-refetch via useFeed invalidation
        return true;
      } catch (error) {
        console.error("Error creating post:", error);
        toast.error("Failed to create post", {
          description: "Please try again",
        });
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [user]
  );

  return {
    createPost,
    isCreating,
  };
}
