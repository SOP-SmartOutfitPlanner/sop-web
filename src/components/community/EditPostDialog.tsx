"use client";

import { useState } from "react";
import { Post } from "@/types/community";
import { communityAPI, CommunityPost } from "@/lib/api/community-api";
import { toast } from "sonner";
import { PostFormDialog } from "./PostFormDialog";

interface EditPostDialogProps {
  post: Post;
  onSuccess?: (updatedPost?: CommunityPost) => void | Promise<void>;
  onClose?: () => void;
}

export function EditPostDialog({
  post,
  onSuccess,
  onClose,
}: EditPostDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: {
    caption: string;
    tags: string[];
    files?: File[];
    existingImageUrls?: string[];
  }) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("Body", data.caption);

      // Add hashtags
      data.tags.forEach((tag) => {
        formData.append("Hashtags", tag);
      });

      // API only accepts File objects in "Images" field, not URLs
      // Convert existing image URLs to File objects and send them along with new files
      const hasExistingUrls = data.existingImageUrls && data.existingImageUrls.length > 0;
      const hasNewFiles = data.files && data.files.length > 0;

      // Convert existing image URLs to File objects
      if (hasExistingUrls && data.existingImageUrls) {
        try {
          const existingImageFiles = await Promise.all(
            data.existingImageUrls.map(async (url) => {
              const response = await fetch(url);
              if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
              }
              const blob = await response.blob();
              const urlParts = url.split("/");
              const filename = urlParts[urlParts.length - 1] || `existing-image.jpg`;
              return new File([blob], filename, { type: blob.type || "image/jpeg" });
            })
          );

          existingImageFiles.forEach((file) => {
            formData.append("Images", file);
          });
        } catch (error) {
          console.error("Error converting existing images to files:", error);
          toast.error("Failed to load existing images. Please try again.");
          throw error;
        }
      }

      // Add new images (File objects)
      if (hasNewFiles && data.files) {
        data.files.forEach((file) => {
          formData.append("Images", file);
        });
      }

      // Call API to update post
      const postId = parseInt(post.id, 10);
      const updatedPost = await communityAPI.updatePost(postId, formData);

      toast.success("Post updated successfully");
      await onSuccess?.(updatedPost);
      onClose?.();
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Không thể cập nhật bài viết");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PostFormDialog
      mode="edit"
      post={post}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
