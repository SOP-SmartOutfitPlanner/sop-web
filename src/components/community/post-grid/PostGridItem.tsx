"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import { Post } from "@/types/community";

interface PostGridItemProps {
  post: Post;
  index: number;
  onSelect: (post: Post) => void;
}

/**
 * Reusable grid item component for post grids
 * Memoized to prevent unnecessary re-renders
 */
export const PostGridItem = memo(function PostGridItem({
  post,
  index,
  onSelect,
}: PostGridItemProps) {
  const firstImage = post.images[0];
  const hasMultipleImages = post.images.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="aspect-square relative group cursor-pointer bg-muted"
      onClick={() => onSelect(post)}
    >
      {/* Image */}
      {firstImage ? (
        <Image
          src={firstImage}
          alt={post.caption}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <span className="text-xs">No image</span>
          </div>
        </div>
      )}

      {/* Multiple images indicator */}
      {hasMultipleImages && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
        </div>
      )}

      {/* Hover overlay with stats */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Heart className="w-6 h-6 fill-white" />
          <span>{post.likes}</span>
        </div>
        <div className="flex items-center gap-2 text-white font-semibold">
          <MessageCircle className="w-6 h-6 fill-white" />
          <span>{post.comments.length}</span>
        </div>
      </div>
    </motion.div>
  );
});

PostGridItem.displayName = "PostGridItem";

