import { useState, useCallback } from "react";
import { toast } from "sonner";
import { communityAPI } from "@/lib/api/community-api";
import { useAuthStore } from "@/store/auth-store";

interface CreatePostData {
  caption: string;
  tags: string[];
  files?: File[]; // Changed to File[] for actual file upload
}

/**
 * Custom hook to handle post creation logic
 * Handles image upload to MinIO then creates post with URLs
 */
export function useCreatePost() {
  const { user } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createPost = useCallback(
    async (postData: CreatePostData) => {
      if (!user) {
        toast.error("Please login to create a post");
        return false;
      }

      setIsCreating(true);
      setUploadProgress(0);

      try {
        let imageUrls: string[] = [];

        // Step 1: Upload images to MinIO if any
        if (postData.files && postData.files.length > 0) {
          //   toast.loading("Uploading images...", { id: "upload-images" });

          try {
            imageUrls = await communityAPI.uploadMultipleImages(postData.files);
            // toast.success(`${imageUrls.length} image(s) uploaded!`, { id: "upload-images" });
          } catch (error) {
            console.error("Error uploading images:", error);
            toast.error("Failed to upload images", { id: "upload-images" });
            return false;
          }
        }

        // Step 2: Create post with image URLs
        await communityAPI.createPost({
          userId: parseInt(user.id),
          body: postData.caption,
          hashtags: postData.tags,
          imageUrls: imageUrls, // Use URLs from MinIO
        });

        toast.success("Post created!", {
          description: "Your outfit has been shared with the community",
        });

        return true;
      } catch (error) {
        console.error("Error creating post:", error);
        toast.error("Failed to create post", {
          description: "Please try again",
        });
        return false;
      } finally {
        setIsCreating(false);
        setUploadProgress(0);
      }
    },
    [user]
  );

  return {
    createPost,
    isCreating,
    uploadProgress,
  };
}
