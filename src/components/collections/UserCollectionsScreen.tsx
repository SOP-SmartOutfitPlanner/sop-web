"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collectionAPI,
  CollectionRecord,
  userAPI,
  communityAPI,
} from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { CollectionCard } from "./CollectionCard";
import { CreateCollectionDialog } from "./CreateCollectionDialog";
import { EditCollectionDialog } from "./EditCollectionDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { filterCollectionsByStatus } from "@/lib/collections/utils";
import { COLLECTION_QUERY_KEYS } from "@/lib/collections/constants";
import {
  RefreshCw,
  Sparkles,
  UserPlus,
  Users,
  Plus,
  Globe2,
  FileText,
  Trash2,
  Heart,
  Bookmark,
  Lock,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type CollectionsScreenVariant = "standalone" | "embedded";

interface UserCollectionsScreenProps {
  userId: number;
  variant?: CollectionsScreenVariant;
}

interface CollectionListData {
  collections: CollectionRecord[];
  count: number;
}

export function UserCollectionsScreen({
  userId,
  variant = "standalone",
}: UserCollectionsScreenProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [collectionToEdit, setCollectionToEdit] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"published" | "drafts">(
    "published"
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<number | null>(
    null
  );
  const isOwnProfile = user?.id && parseInt(user.id, 10) === userId;

  // Fetch user info
  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await userAPI.getUserById(userId);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Fetch stylist profile (includes stats)
  const stylistProfileQuery = useQuery({
    queryKey: COLLECTION_QUERY_KEYS.stylistProfile(userId),
    queryFn: async () => {
      const response = await userAPI.getStylistProfile(userId);
      return response.data;
    },
    staleTime: 1000 * 60,
  });

  // Fetch follower and following counts
  const followerCountQuery = useQuery({
    queryKey: ["follower-count", userId],
    queryFn: () => communityAPI.getFollowerCount(userId),
    staleTime: 1000 * 60,
  });

  // Fetch all collections (both published and drafts)
  const collectionsQuery = useQuery<CollectionListData>({
    queryKey: COLLECTION_QUERY_KEYS.userCollections(userId),
    queryFn: async () => {
      const { data } = await collectionAPI.getCollectionsByUserId(userId);
      const collections: CollectionRecord[] = data?.data ?? [];

      // If not owner, only show published collections
      // If owner, show all collections (will be filtered by tabs)
      const filteredCollections = isOwnProfile
        ? collections
        : collections.filter((collection) => collection.isPublished);

      return {
        collections: filteredCollections,
        count: data?.metaData?.totalCount ?? filteredCollections.length,
      };
    },
    staleTime: 1000 * 60,
  });

  // Filter collections by tab
  const filteredCollections = useMemo(() => {
    if (!collectionsQuery.data) return [];

    if (!isOwnProfile) {
      // Non-owners only see published
      return collectionsQuery.data.collections;
    }

    // Owners can filter by tab
    return filterCollectionsByStatus(
      collectionsQuery.data.collections,
      activeTab
    );
  }, [collectionsQuery.data, activeTab, isOwnProfile]);

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: (collectionId: number) =>
      collectionAPI.togglePublishCollection(collectionId),
    onSuccess: (data) => {
      const wasPublished = data.data.isPublished;
      toast.success(
        wasPublished
          ? "Collection published successfully"
          : "Collection unpublished successfully"
      );
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.userCollections(userId),
      });
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.collections,
      });
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.stylistProfile(userId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update publish status");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (collectionId: number) =>
      collectionAPI.deleteCollection(collectionId),
    onSuccess: () => {
      toast.success("Collection deleted successfully");
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.userCollections(userId),
      });
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.collections,
      });
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.stylistProfile(userId),
      });
      setDeleteDialogOpen(false);
      setCollectionToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete collection");
    },
  });

  const handleDeleteClick = (collectionId: number) => {
    setCollectionToDelete(collectionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (collectionToDelete) {
      deleteMutation.mutate(collectionToDelete);
    }
  };

  const userDisplayName =
    userQuery.data?.displayName ||
    collectionsQuery.data?.collections[0]?.userDisplayName ||
    "Stylist";

  const isEmbedded = variant === "embedded";

  return (
    <div
      className={cn(
        "w-full",
        isEmbedded ? "space-y-10" : "space-y-16",
        isEmbedded
          ? "relative px-0 pt-0 pb-8"
          : "relative mx-auto max-w-6xl px-6 pb-24 pt-20"
      )}
    >
      {!isEmbedded && (
        <>
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 blur-3xl" />
          <header className="space-y-4">
            <GlassCard
              padding="2rem"
              blur="20px"
              glowColor="rgba(56, 189, 248, 0.6)"
              glowIntensity={28}
              shadowColor="rgba(15, 23, 42, 0.55)"
              className="relative overflow-hidden border-2 border-cyan-400/50 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-slate-900/70 shadow-2xl shadow-cyan-500/20"
            >
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.75),transparent_60%)] opacity-90" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(76,29,149,0.75),transparent_65%)] opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/75 via-slate-800/60 to-slate-900/40 backdrop-blur-sm" />
                <div className="absolute inset-y-0 left-0 w-full md:w-2/3 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
              </div>
              <div className="relative space-y-4">
                <p className="inline-flex items-center gap-2 rounded-full border-2 border-cyan-400/60 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.4em] text-white backdrop-blur-md shadow-lg shadow-cyan-500/30">
                  Stylist Collections
                </p>

                {/* User Info Section */}
                <div className="flex flex-col gap-6 md:flex-row md:items-start">
                  {/* Avatar */}
                  <div className="relative h-28 w-28 shrink-0 md:h-32 md:w-32">
                    {/* Glow ring effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 opacity-75 blur-xl animate-pulse" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/60 via-blue-400/60 to-indigo-400/60 p-[3px]">
                      <div className="h-full w-full rounded-full bg-slate-900/90 backdrop-blur-sm" />
                    </div>
                    <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-cyan-400/80 bg-slate-800/50 shadow-2xl shadow-cyan-500/50 ring-4 ring-cyan-500/30 ring-offset-2 ring-offset-slate-900">
                      {userQuery.data?.avtUrl ? (
                        <Image
                          src={userQuery.data.avtUrl}
                          alt={userDisplayName}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 112px, 128px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <UserPlus className="h-14 w-14 md:h-16 md:w-16 text-cyan-300" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h1 className="text-3xl font-black leading-tight text-white drop-shadow-lg md:text-4xl">
                        <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                          {userDisplayName}
                        </span>
                      </h1>
                      {userQuery.data?.jobName && (
                        <p className="mt-1 text-sm text-cyan-300/80">
                          {userQuery.data.jobName}
                        </p>
                      )}
                    </div>

                    {userQuery.data?.bio && (
                      <p className="max-w-2xl text-base text-slate-200 leading-relaxed">
                        {userQuery.data.bio}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-5 md:gap-6">
                      <div className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5">
                        <Users className="h-4 w-4 text-cyan-300" />
                        <span className="text-sm font-semibold text-white">
                          {followerCountQuery.data ?? 0}
                        </span>
                        <span className="text-xs text-slate-300">
                          Followers
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5">
                        <Sparkles className="h-4 w-4 text-purple-300" />
                        <span className="text-sm font-semibold text-white">
                          {stylistProfileQuery.data
                            ?.publishedCollectionsCount ??
                            filteredCollections.length ??
                            0}
                        </span>
                        <span className="text-xs text-slate-300">
                          Published
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5">
                        <Heart className="h-4 w-4 text-rose-300" />
                        <span className="text-sm font-semibold text-white">
                          {stylistProfileQuery.data?.totalCollectionsLikes ?? 0}
                        </span>
                        <span className="text-xs text-slate-300">
                          Total Likes
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5">
                        <Bookmark className="h-4 w-4 text-amber-300" />
                        <span className="text-sm font-semibold text-white">
                          {stylistProfileQuery.data?.totalCollectionsSaves ?? 0}
                        </span>
                        <span className="text-xs text-slate-300">
                          Total Saves
                        </span>
                      </div>
                    </div>

                    {/* User Styles */}
                    {userQuery.data?.userStyles &&
                      userQuery.data.userStyles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {userQuery.data.userStyles
                            .slice(0, 5)
                            .map((style) => (
                              <Badge
                                key={style.id}
                                className="border-cyan-400/30 bg-cyan-500/15 text-cyan-200 px-2.5 py-1 text-xs"
                              >
                                {style.styleName}
                              </Badge>
                            ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </header>
        </>
      )}

      <section className="space-y-8">
        <div className="rounded-3xl border border-white/10  px-4 py-5 shadow-lg shadow-black/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
              {isOwnProfile ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-slate-900/30 p-2 backdrop-blur-lg shadow-lg shadow-cyan-500/10">
                  <button
                    onClick={() => setActiveTab("published")}
                    className={cn(
                      "inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300",
                      activeTab === "published"
                        ? "bg-gradient-to-r from-cyan-500/90 to-blue-500/90 text-white shadow-lg shadow-cyan-500/30"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Globe2 className="h-4 w-4" />
                    Published
                  </button>
                  <button
                    onClick={() => setActiveTab("drafts")}
                    className={cn(
                      "inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300",
                      activeTab === "drafts"
                        ? "bg-gradient-to-r from-cyan-500/90 to-blue-500/90 text-white shadow-lg shadow-cyan-500/30"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    Drafts
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    Stylist collections
                  </p>
                  <h2 className="text-2xl font-semibold text-white">
                    Published Collections
                  </h2>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-300">
                {filteredCollections.length}{" "}
                {activeTab === "published" ? "Published" : "Draft"}
              </span>
              {isOwnProfile && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-cyan-500/30 transition-all duration-300 hover:scale-[1.02]"
                >
                  <Plus className="h-4 w-4" />
                  Create Collection
                </Button>
              )}
            </div>
          </div>
        </div>

        {collectionsQuery.isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-64 rounded-3xl bg-slate-900/40"
              />
            ))}
          </div>
        ) : filteredCollections.length === 0 ? (
          <GlassCard
            padding="3rem"
            blur="18px"
            glowColor="rgba(79, 70, 229, 0.4)"
            glowIntensity={16}
            shadowColor="rgba(15, 23, 42, 0.45)"
            className="border border-slate-700/40 bg-slate-950/60 text-center"
          >
            <h3 className="mb-2 text-xl font-semibold text-white">
              {activeTab === "published"
                ? "No published collections yet"
                : "No drafts yet"}
            </h3>
            <p className="text-slate-400">
              {activeTab === "published"
                ? "This stylist hasn't published any collections yet."
                : "You don't have any draft collections. Create a new collection to get started."}
            </p>
          </GlassCard>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredCollections.map((collection) => (
              <div key={collection.id} className="relative group">
                <CollectionCard
                  collection={collection}
                  canManage={isOwnProfile || false}
                />
                {isOwnProfile && (
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCollectionToEdit(collection.id);
                        setIsEditDialogOpen(true);
                      }}
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg bg-black/70 backdrop-blur-md border border-cyan-500/50 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/70 transition-all duration-200 shadow-lg shadow-black/50"
                      title="Edit collection"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        publishMutation.mutate(collection.id);
                      }}
                      disabled={publishMutation.isPending}
                      size="sm"
                      className={cn(
                        "text-white shadow-lg transition-all duration-200 backdrop-blur-md",
                        collection.isPublished
                          ? "bg-slate-600/80 hover:bg-slate-500/90 border border-slate-500/50 shadow-slate-500/20"
                          : "bg-gradient-to-r from-cyan-500/90 to-blue-500/90 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/25"
                      )}
                    >
                      {collection.isPublished ? (
                        <>
                          <Lock className="h-3.5 w-3.5 mr-1.5" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Globe2 className="h-3.5 w-3.5 mr-1.5" />
                          Publish
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteClick(collection.id);
                      }}
                      disabled={deleteMutation.isPending}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-lg bg-black/70 backdrop-blur-md border border-rose-500/50 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/70 transition-all duration-200 shadow-lg shadow-black/50"
                      title="Delete collection"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create Collection Dialog */}
      {isOwnProfile && (
        <CreateCollectionDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={() => {
            collectionsQuery.refetch();
            queryClient.invalidateQueries({
              queryKey: COLLECTION_QUERY_KEYS.stylistProfile(userId),
            });
          }}
        />
      )}

      {/* Edit Collection Dialog */}
      {isOwnProfile && collectionToEdit && (
        <EditCollectionDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setCollectionToEdit(null);
            }
          }}
          collectionId={collectionToEdit}
          onSuccess={() => {
            collectionsQuery.refetch();
            queryClient.invalidateQueries({
              queryKey: COLLECTION_QUERY_KEYS.stylistProfile(userId),
            });
            queryClient.invalidateQueries({
              queryKey: COLLECTION_QUERY_KEYS.collection(collectionToEdit),
            });
            queryClient.invalidateQueries({
              queryKey: COLLECTION_QUERY_KEYS.collections,
            });
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="backdrop-blur-xl bg-gradient-to-br from-slate-900/98 via-slate-800/95 to-slate-900/98 border-2 border-rose-500/30 shadow-2xl shadow-rose-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-rose-400" />
              Delete Collection
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 pt-2">
              Are you sure you want to delete this collection? This action
              cannot be undone and all associated data will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-0">
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setCollectionToDelete(null);
              }}
              className="bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-gradient-to-r from-rose-500/90 to-red-500/90 text-white hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-500/25 disabled:opacity-50"
            >
              {deleteMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
