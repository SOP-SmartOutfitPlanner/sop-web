"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bookmark,
  Heart,
  Shirt,
  Share2,
  UserPlus,
  Send,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import GlassCard from "@/components/ui/glass-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { collectionAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { formatDate } from "@/lib/collections/utils";
import { COLLECTION_QUERY_KEYS } from "@/lib/collections/constants";
import { OutfitCard } from "./OutfitCard";
import { CommentsSection } from "./CommentsSection";
import { CollectionInfoSidebar } from "./CollectionInfoSidebar";
import {
  useLikeCollection,
  useSaveCollection,
  useFollowStylist,
  usePublishCollection,
} from "@/hooks/useCollectionMutations";

const DEFAULT_DESCRIPTION =
  "A carefully curated collection of professional outfits that blend comfort with sophistication. Perfect for office environments and business meetings.";

interface CollectionDetailProps {
  collectionId: number;
}

export function CollectionDetail({ collectionId }: CollectionDetailProps) {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const userId = user?.id ? parseInt(user.id, 10) : null;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !user) {
      router.replace("/login");
    }
  }, [isInitialized, user, router]);

  const query = useQuery({
    queryKey: COLLECTION_QUERY_KEYS.collection(collectionId),
    queryFn: async () => {
      const response = await collectionAPI.getCollectionById(collectionId, {
        params: userId ? { callerUserId: userId } : undefined,
      });
      return response.data;
    },
    enabled: !!userId, // Only fetch if user is logged in
  });

  const collection = query.data;

  const likeMutation = useLikeCollection(
    collectionId,
    userId,
    collection?.isLiked
  );

  const saveMutation = useSaveCollection(
    collectionId,
    userId,
    collection?.isSaved
  );

  const followMutation = useFollowStylist(
    collectionId,
    userId,
    collection?.userId ?? 0,
    collection?.isFollowing
  );

  const publishMutation = usePublishCollection(
    collectionId,
    collection?.isPublished
  );

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return (
      name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    );
  };

  // Check if current user is the owner of this collection
  const isOwner = userId !== null && userId === collection?.userId;
  const canPublish = isOwner && collection?.isPublished === false;

  // Show loading while checking auth
  if (!isInitialized || (isInitialized && !user)) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 space-y-8">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="grid gap-6 sm:grid-cols-2">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (query.isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 space-y-8">
        <Skeleton className="h-48 w-full rounded-3xl " />
        <Skeleton className="h-40 w-full rounded-3xl " />
        <div className="grid gap-6 sm:grid-cols-2">
          <Skeleton className="h-64 rounded-3xl " />
          <Skeleton className="h-64 rounded-3xl " />
        </div>
      </div>
    );
  }

  // Check permission - private collection and user is not owner
  if (collection && !collection.isPublished && !isOwner) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-white/40" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-white mb-2">
            Private Collection
          </h2>

          {/* Description */}
          <p className="text-sm text-white/50 mb-8">
            This collection is private and can only be viewed by its owner.
          </p>

          {/* Action */}
          <Link href="/collections">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white/90 text-sm font-medium hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to collections
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (query.isError || !collection) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <Bookmark className="w-8 h-8 text-white/40" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-white mb-2">
            Collection not found
          </h2>

          {/* Description */}
          <p className="text-sm text-white/50 mb-8">
            This collection may have been removed or you don&apos;t have
            permission to view it.
          </p>

          {/* Action */}
          <Link href="/collections">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white/90 text-sm font-medium hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to collections
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl px-6 pt-35 space-y-8">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b  blur-3xl" />

      {/* Back Button */}
      <Link
        href="/collections"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white/90 text-sm font-medium hover:bg-white/20 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Hero Section with Thumbnail and Collection Info */}
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Left: Thumbnail Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-slate-700/40 ">
          {collection.thumbnailURL ? (
            <Image
              src={collection.thumbnailURL}
              alt={collection.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <Shirt className="h-24 w-24" />
            </div>
          )}
        </div>

        {/* Right: Collection Info */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-1">
            <h1 className="text-6xl font-bold text-white">
              {collection.title}
            </h1>
            <p className="text-lg leading-relaxed text-slate-300">
              {collection.shortDescription || DEFAULT_DESCRIPTION}
            </p>
          </div>

          {/* Stylist Info */}
          <div className="flex items-center gap-3">
            <Link
              href={`/community/profile/${collection.userId}`}
              className="shrink-0 cursor-pointer"
            >
              <Avatar className="w-10 h-10 border-2 border-white/20 bg-white/10 hover:border-cyan-400/50 transition-colors">
                <AvatarImage
                  src={collection.avtUrl || ""}
                  alt={collection.userDisplayName || "User"}
                />
                <AvatarFallback className="bg-linear-to-br from-blue-500 to-cyan-500 text-white text-sm font-semibold">
                  {getInitials(collection.userDisplayName)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Link
                  href={`/community/profile/${collection.userId}`}
                  className="text-lg font-semibold text-white hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {collection.userDisplayName}
                </Link>
                {user?.id && parseInt(user.id, 10) !== collection.userId && (
                  <Button
                    onClick={() => {
                      if (!user?.id) {
                        toast.error("Please login to follow");
                        return;
                      }
                      followMutation.mutate();
                    }}
                    disabled={followMutation.isPending}
                    variant="outline"
                    size="sm"
                    className="shrink-0 border-white/40 bg-white/10 text-white hover:bg-white/20"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {collection.isFollowing ? "Following" : "+ Follow"}
                  </Button>
                )}
              </div>
              <p className="text-sm text-slate-400">Stylist</p>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-sm text-slate-400">
            Updated at:{" "}
            {formatDate(collection.updatedDate ?? collection.createdDate, {
              day: "numeric",
              month: "numeric",
              year: "numeric",
            })}
          </div>

          {/* Interaction Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (!user?.id) {
                  toast.error("Please login to like collections");
                  return;
                }
                likeMutation.mutate();
              }}
              disabled={likeMutation.isPending}
              className={cn(
                "group relative inline-flex items-center gap-2.5 rounded-xl border-2 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 shadow-lg",
                "border-rose-400/60 bg-rose-500/25 backdrop-blur-sm",
                "hover:border-rose-300/80 hover:bg-rose-500/35 hover:shadow-xl hover:shadow-rose-500/30 hover:scale-105",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-rose-400/60 disabled:hover:bg-rose-500/25 disabled:hover:scale-100"
              )}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-all duration-200",
                  collection.isLiked
                    ? "fill-rose-300 text-rose-300 scale-110"
                    : "text-rose-200 group-hover:scale-110"
                )}
              />
              <span className="font-bold text-white">
                {collection.likeCount}
              </span>
              <span className="text-white/90">Like</span>
            </button>
            <button
              onClick={() => {
                if (!user?.id) {
                  toast.error("Please login to save collections");
                  return;
                }
                saveMutation.mutate();
              }}
              disabled={saveMutation.isPending}
              className={cn(
                "group relative inline-flex items-center gap-2.5 rounded-xl border-2 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 shadow-lg",
                "border-blue-400/60 bg-blue-500/25 backdrop-blur-sm",
                "hover:border-blue-300/80 hover:bg-blue-500/35 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-blue-400/60 disabled:hover:bg-blue-500/25 disabled:hover:scale-100"
              )}
            >
              <Bookmark
                className={cn(
                  "h-4 w-4 transition-all duration-200",
                  collection.isSaved
                    ? "fill-blue-300 text-blue-300 scale-110"
                    : "text-blue-200 group-hover:scale-110"
                )}
              />
              <span className="font-bold text-white">
                {collection.savedCount ?? 0}
              </span>
              <span className="text-white/90">Save</span>
            </button>
            <button
              onClick={() => {
                const url = `${window.location.origin}/collections/${collectionId}`;
                navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard");
              }}
              className={cn(
                "group relative inline-flex items-center gap-2.5 rounded-xl border-2 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 shadow-lg",
                "border-slate-400/60 bg-slate-500/25 backdrop-blur-sm",
                "hover:border-slate-300/80 hover:bg-slate-500/35 hover:shadow-xl hover:shadow-slate-500/30 hover:scale-105"
              )}
            >
              <Share2 className="h-4 w-4 text-slate-200 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
              <span className="text-white/90">Share</span>
            </button>
            {canPublish && (
              <button
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending}
                className={cn(
                  "group relative inline-flex items-center gap-2.5 rounded-xl border-2 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 shadow-lg",
                  "border-emerald-400/60 bg-emerald-500/25 backdrop-blur-sm",
                  "hover:border-emerald-300/80 hover:bg-emerald-500/35 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-emerald-400/60 disabled:hover:bg-emerald-500/25 disabled:hover:scale-100"
                )}
              >
                <Send className="h-4 w-4 text-emerald-200 transition-transform duration-200 group-hover:scale-110" />
                <span className="text-white/90">
                  {publishMutation.isPending ? "Publishing..." : "Publish"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <section className="space-y-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">
              Outfits in the collection
            </h2>
          </div>

          <div className="space-y-8">
            {collection.outfits.length === 0 && (
              <GlassCard
                padding="2rem"
                blur="18px"
                glowColor="rgba(148, 163, 184, 0.35)"
                glowIntensity={14}
                shadowColor="rgba(15, 23, 42, 0.4)"
                className=" text-center text-sm text-slate-300"
              >
                No outfits have been added to this collection yet.
              </GlassCard>
            )}
            {collection.outfits.map((entry, index) => {
              const outfit = entry.outfit;
              const items = outfit?.items ?? [];

              return (
                <OutfitCard
                  key={`${collection.id}-${index}`}
                  outfit={outfit}
                  entry={entry}
                  items={items}
                  collectionId={collectionId}
                  isOwner={isOwner}
                />
              );
            })}
          </div>

          <CommentsSection
            collectionId={collectionId}
            collection={collection}
            user={user}
          />
        </section>

        <aside className="space-y-6">
          <CollectionInfoSidebar collection={collection} />
        </aside>
      </div>
    </div>
  );
}
