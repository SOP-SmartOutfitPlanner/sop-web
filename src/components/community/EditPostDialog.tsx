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
  }) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("Body", data.caption);

      // Add hashtags
      data.tags.forEach((tag) => {
        formData.append("Hashtags", tag);
      });

      // Add new images
      data.files?.forEach((file) => {
        formData.append("Images", file);
      });

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
