"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import { communityAPI } from "@/lib/api/community-api";
import { apiPostToPost, Post } from "@/types/community";
import { toast } from "sonner";
import { PostModal } from "./PostModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PostGridProps {
  userId: string;
}

/**
 * Instagram-style 3-column photo grid
 */
export function PostGrid({ userId }: PostGridProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch user posts
  const fetchUserPosts = useCallback(
    async (pageNum: number) => {
      try {
        setIsLoading(true);

        const response = await communityAPI.getPostsByUser(
          parseInt(userId, 10),
          pageNum,
          12 // Load 12 posts at a time (4 rows of 3)
        );

        const transformedPosts = response.data.map(apiPostToPost);

        if (pageNum === 1) {
          setPosts(transformedPosts);
        } else {
          setPosts((prev) => [...prev, ...transformedPosts]);
        }

        setHasMore(response.metaData.hasNext);
      } catch (error) {
        console.error("Error fetching user posts:", error);
        toast.error("Không thể tải bài viết");
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  // Initial load
  useEffect(() => {
    fetchUserPosts(1);
  }, [fetchUserPosts]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchUserPosts(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, page, fetchUserPosts]);

  // Handle like post
  const handleLikePost = async (postId: string) => {
    try {
      // Optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likes: p.isLiked ? p.likes - 1 : p.likes + 1,
              }
            : p
        )
      );

      // Update selected post if open
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          isLiked: !selectedPost.isLiked,
          likes: selectedPost.isLiked
            ? selectedPost.likes - 1
            : selectedPost.likes + 1,
        });
      }

      // TODO: Call API when available
      // await communityAPI.toggleLikePost(postId, currentUserId);
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Không thể like bài viết");

      // Revert optimistic update on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likes: p.isLiked ? p.likes + 1 : p.likes - 1,
              }
            : p
        )
      );
    }
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-1">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="aspect-square bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full border-2 border-foreground mx-auto mb-4 flex items-center justify-center">
          <MessageCircle className="w-8 h-8" />
        </div>
        <h3 className="font-semibold text-2xl mb-2">No Posts Yet</h3>
      </div>
    );
  }

  return (
    <div>
      {/* Instagram 3-column grid */}
      <div className="grid grid-cols-3 gap-1">
        {posts.map((post, index) => {
          const firstImage = post.images[0];
          const hasMultipleImages = post.images.length > 1;

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="aspect-square relative group cursor-pointer bg-muted"
              onClick={() => setSelectedPost(post)}
            >
              {firstImage ? (
                <Image
                  src={firstImage}
                  alt={post.caption}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {post.userDisplayName?.charAt(0)?.toUpperCase() ||
                        post.userId.toString().charAt(0)}
                    </AvatarFallback>
                  </Avatar>
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
        })}
      </div>

      {/* Loading more */}
      {isLoading && posts.length > 0 && (
        <div className="grid grid-cols-3 gap-1 mt-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {/* Infinite scroll trigger */}
      {hasMore && <div ref={observerTarget} className="h-20" />}

      {/* Post detail modal */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          onLike={() => handleLikePost(selectedPost.id)}
        />
      )}
    </div>
  );
}
