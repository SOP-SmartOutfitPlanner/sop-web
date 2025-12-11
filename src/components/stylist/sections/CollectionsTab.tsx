"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
import { MonthlyPulseChart } from "../components/MonthlyPulseChart";
import {
  StylistCollectionHighlight,
  StylistCollectionsMonthlyStat,
  StylistCollectionsStats,
  collectionAPI,
} from "@/lib/api";
import { Layers, Edit, Trash2, Globe2, Lock, RefreshCw, Eye } from "lucide-react";
import { UserCollectionsScreen } from "@/components/collections/UserCollectionsScreen";
import { EditCollectionDialog } from "@/components/collections/EditCollectionDialog";
import { usePublishCollection } from "@/hooks/useCollectionMutations";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CollectionsTabProps {
  isLoading: boolean;
  collectionsStats?: StylistCollectionsStats;
  collectionsActivityLabel: string;
  userId: number | null;
}

export function CollectionsTab({
  isLoading,
  collectionsStats,
  collectionsActivityLabel,
  userId,
}: CollectionsTabProps) {
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [collectionToEdit, setCollectionToEdit] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<number | null>(null);
  const [publishingId, setPublishingId] = useState<number | null>(null);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (collectionId: number) =>
      collectionAPI.deleteCollection(collectionId),
    onSuccess: () => {
      toast.success("Collection deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["stylist-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setDeleteDialogOpen(false);
      setCollectionToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete collection");
    },
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: (collectionId: number) =>
      collectionAPI.togglePublishCollection(collectionId),
    onSuccess: (_, collectionId) => {
      const collection = collectionsStats?.topCollections?.find(c => c.id === collectionId);
      toast.success(
        collection?.isPublished
          ? "Collection unpublished successfully"
          : "Collection published successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["stylist-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setPublishingId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update publish status");
      setPublishingId(null);
    },
  });

  const handleEditClick = (collectionId: number) => {
    setCollectionToEdit(collectionId);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (collectionId: number) => {
    setCollectionToDelete(collectionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (collectionToDelete) {
      deleteMutation.mutate(collectionToDelete);
    }
  };

  const handlePublishClick = (collectionId: number) => {
    setPublishingId(collectionId);
    publishMutation.mutate(collectionId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96 rounded-3xl bg-white/10" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-80 rounded-3xl bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <section>
        <MonthlyPulseChart
          title="Collections activity"
          icon={<Layers className="h-5 w-5 text-cyan-400" />}
          stats={collectionsStats?.monthlyStats}
          emptyMessage="No collection activity for the selected period."
          extraLabel="💾 Saves:"
          color={{
            stroke: "#22d3ee",
            gradientFrom: "rgba(34, 211, 238, 0.9)",
            gradientTo: "rgba(34, 211, 238, 0.1)",
          }}
          mapExtra={(stat) =>
            (stat as StylistCollectionsMonthlyStat).savesReceived
          }
        />
      </section>

      <section className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-white">Top performing collections</h3>
          <p className="text-sm text-white/60">
            Your most engaging collections this period
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(collectionsStats?.topCollections ?? []).length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
              <Layers className="mx-auto h-12 w-12 text-white/20" />
              <p className="mt-4 text-lg font-semibold text-white/60">No collections yet</p>
              <p className="mt-1 text-sm text-white/40">
                Create and publish collections to see them here
              </p>
            </div>
          )}
          {(collectionsStats?.topCollections ?? []).map(
            (collection: StylistCollectionHighlight) => (
              <div
                key={collection.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-1"
              >
                {/* Action Buttons - Always visible on top right */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                  {/* View Button */}
                  <Link
                    href={`/collections/${collection.id}`}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-white/80 hover:text-white hover:bg-white/20 hover:border-white/40 transition-all duration-200 shadow-lg shadow-black/50"
                    title="View collection"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  {/* Edit Button */}
                  <button
                    onClick={() => handleEditClick(collection.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-black/70 backdrop-blur-md border border-cyan-500/50 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/70 transition-all duration-200 shadow-lg shadow-black/50"
                    title="Edit collection"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {/* Publish/Unpublish Button */}
                  <button
                    onClick={() => handlePublishClick(collection.id)}
                    disabled={publishingId === collection.id}
                    className={cn(
                      "h-8 px-3 flex items-center justify-center gap-1.5 rounded-lg backdrop-blur-md text-xs font-medium transition-all duration-200 shadow-lg shadow-black/50",
                      collection.isPublished
                        ? "bg-slate-600/80 hover:bg-slate-500/90 border border-slate-500/50 text-white"
                        : "bg-gradient-to-r from-emerald-500/90 to-green-500/90 hover:from-emerald-500 hover:to-green-500 border border-emerald-400/50 text-white",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                    title={collection.isPublished ? "Unpublish" : "Publish"}
                  >
                    {publishingId === collection.id ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : collection.isPublished ? (
                      <Lock className="h-3.5 w-3.5" />
                    ) : (
                      <Globe2 className="h-3.5 w-3.5" />
                    )}
                    {collection.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteClick(collection.id)}
                    disabled={deleteMutation.isPending}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-black/70 backdrop-blur-md border border-rose-500/50 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/70 transition-all duration-200 shadow-lg shadow-black/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete collection"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="aspect-[4/3] overflow-hidden">
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${collection.thumbnailURL})`,
                    }}
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-lg font-bold text-white line-clamp-1">{collection.title}</h4>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        collection.isPublished
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {collection.isPublished ? "Live" : "Draft"}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 line-clamp-2">
                    {collection.shortDescription}
                  </p>
                  <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{collection.likeCount}</p>
                      <p className="text-xs text-white/60">Likes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{collection.commentCount}</p>
                      <p className="text-xs text-white/60">Comments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{collection.saveCount}</p>
                      <p className="text-xs text-white/60">Saves</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* {userId && (
        <section className="space-y-4">
          <div>
            <h3 className="text-2xl font-semibold text-white">
              Manage your collections
            </h3>
            <p className="text-sm text-white/70">
              Reuse the full stylist collection workspace without leaving the studio.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
            <UserCollectionsScreen userId={userId} variant="embedded" />
          </div>
        </section>
      )} */}

      {/* Edit Collection Dialog */}
      {collectionToEdit && (
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
            queryClient.invalidateQueries({ queryKey: ["stylist-dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["collections"] });
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
    </>
  );
}

