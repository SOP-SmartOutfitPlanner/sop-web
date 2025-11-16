"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionAPI, outfitAPI, CollectionRecord } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload,
  X,
  Check,
  Search,
  ImageIcon,
  FileImage,
  Sparkles,
  AlertCircle,
  Loader2,
  Edit,
} from "lucide-react";
import type { Outfit } from "@/types/outfit";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/hooks/useScrollLock";
import { COLLECTION_QUERY_KEYS } from "@/lib/collections/constants";

interface EditCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: number;
  onSuccess?: () => void;
}

export function EditCollectionDialog({
  open,
  onOpenChange,
  collectionId,
  onSuccess,
}: EditCollectionDialogProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Lock scroll when dialog is open
  useScrollLock(open);

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [selectedOutfits, setSelectedOutfits] = useState<
    Map<number, { outfitId: number; description: string }>
  >(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Fetch collection data
  const collectionQuery = useQuery<CollectionRecord>({
    queryKey: COLLECTION_QUERY_KEYS.collection(collectionId),
    queryFn: async () => {
      const response = await collectionAPI.getCollectionById(collectionId);
      return response.data;
    },
    enabled: open && !!collectionId,
    staleTime: 1000 * 60,
  });

  // Initialize form with collection data
  useEffect(() => {
    if (collectionQuery.data) {
      const collection = collectionQuery.data;
      setTitle(collection.title);
      setShortDescription(collection.shortDescription || "");
      
      // Set thumbnail preview from existing URL
      if (collection.thumbnailURL) {
        setThumbnailPreview(collection.thumbnailURL);
      }

      // Initialize selected outfits from collection
      const outfitsMap = new Map<number, { outfitId: number; description: string }>();
      collection.outfits?.forEach((entry) => {
        if (entry.outfit) {
          outfitsMap.set(entry.outfit.outfitId, {
            outfitId: entry.outfit.outfitId,
            description: entry.description || "",
          });
        }
      });
      setSelectedOutfits(outfitsMap);
    }
  }, [collectionQuery.data]);

  // Fetch user outfits
  const outfitsQuery = useQuery({
    queryKey: ["user-outfits", user?.id],
    queryFn: async () => {
      const response = await outfitAPI.getOutfits({
        pageIndex: 1,
        pageSize: 100,
        takeAll: true,
      });
      return response.data?.data ?? [];
    },
    enabled: open && !!user?.id,
    staleTime: 1000 * 60,
  });

  // Filter outfits based on search
  const filteredOutfits = useMemo(() => {
    if (!outfitsQuery.data) return [];
    if (!searchQuery.trim()) return outfitsQuery.data;

    const query = searchQuery.toLowerCase();
    return outfitsQuery.data.filter(
      (outfit) =>
        outfit.name.toLowerCase().includes(query) ||
        outfit.description?.toLowerCase().includes(query)
    );
  }, [outfitsQuery.data, searchQuery]);

  // Validation
  const validation = useMemo(
    () => ({
      title: title.trim().length === 0 ? "Title is required" : null,
      outfits:
        selectedOutfits.size === 0
          ? "Please select at least one outfit"
          : null,
    }),
    [title, selectedOutfits.size]
  );

  const isFormValid = title.trim().length > 0 && selectedOutfits.size > 0;

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      if (!title.trim()) {
        throw new Error("Title is required");
      }
      if (selectedOutfits.size === 0) {
        throw new Error("Please select at least one outfit");
      }

      const formData = new FormData();
      formData.append("Title", title.trim());
      formData.append("ShortDescription", shortDescription.trim() || "");

      // Only append thumbnail if a new file was selected
      if (thumbnailFile) {
        formData.append("ThumbnailImg", thumbnailFile);
      }

      // Add outfits as JSON string
      const outfitsArray = Array.from(selectedOutfits.values());
      formData.append("Outfits", JSON.stringify(outfitsArray));

      return collectionAPI.updateCollection(collectionId, formData);
    },
    onSuccess: () => {
      toast.success("Collection updated successfully");
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.collection(collectionId),
      });
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.collections,
      });
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.userCollections(
          parseInt(user?.id || "0", 10)
        ),
      });
      handleClose();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update collection");
    },
  });

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please select a valid image file");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleOutfitToggle = (outfit: Outfit) => {
    const newSelected = new Map(selectedOutfits);
    if (newSelected.has(outfit.id)) {
      newSelected.delete(outfit.id);
    } else {
      newSelected.set(outfit.id, {
        outfitId: outfit.id,
        description: outfit.description || "",
      });
    }
    setSelectedOutfits(newSelected);
  };

  const handleOutfitDescriptionChange = (
    outfitId: number,
    description: string
  ) => {
    const newSelected = new Map(selectedOutfits);
    const existing = newSelected.get(outfitId);
    if (existing) {
      newSelected.set(outfitId, { ...existing, description });
      setSelectedOutfits(newSelected);
    }
  };

  const handleClose = () => {
    setTitle("");
    setShortDescription("");
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setSelectedOutfits(new Map());
    setSearchQuery("");
    setIsDragging(false);
    onOpenChange(false);
  };

  const isLoading = collectionQuery.isLoading || outfitsQuery.isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[90rem] sm:!max-w-[90rem] md:!max-w-[90rem] lg:!max-w-[90rem] xl:!max-w-[90rem] !w-[95vw] max-h-[95vh] overflow-hidden backdrop-blur-xl bg-gradient-to-br from-slate-900/98 via-slate-800/95 to-slate-900/98 border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20 p-0">
        {/* Two-Column Layout */}
        <div className="flex h-[calc(95vh-80px)]">
          {/* Left Column: Collection Configuration (Sticky - ~40%) */}
          <div className="w-[40%] flex flex-col border-r border-slate-700/50 bg-gradient-to-b from-slate-900/50 to-slate-900/40 backdrop-blur-sm">
            {/* Header */}
            <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/80 to-slate-800/60">
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                  <Edit className="h-5 w-5 text-cyan-400" />
                </div>
                Edit Collection
              </DialogTitle>
              <p className="text-sm text-slate-400 mt-2">
                Update collection details and outfits
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full rounded-lg bg-slate-800/60" />
                  <Skeleton className="h-24 w-full rounded-lg bg-slate-800/60" />
                  <Skeleton className="h-64 w-full rounded-lg bg-slate-800/60" />
                </div>
              ) : (
                <>
                  {/* Basic Information Section */}
                  <div className="space-y-5">
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-cyan-500/20 border border-cyan-500/30">
                        <FileImage className="h-3.5 w-3.5 text-cyan-400" />
                      </div>
                      Basic Information
                    </h3>

                    {/* Title */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                        Title
                        <span className="text-rose-400 font-bold">*</span>
                      </label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter collection title"
                        className={cn(
                          "bg-slate-900/60 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/20 transition-all",
                          validation.title &&
                            "border-rose-500/70 focus:border-rose-500/70 focus:ring-rose-500/20"
                        )}
                      />
                      {validation.title && (
                        <div className="flex items-center gap-1.5 text-xs text-rose-400 animate-in fade-in slide-in-from-top-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>{validation.title}</span>
                        </div>
                      )}
                    </div>

                    {/* Short Description */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">
                        Short Description
                        <span className="text-slate-500 text-xs ml-2">
                          (Optional)
                        </span>
                      </label>
                      <Textarea
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        placeholder="Describe your collection..."
                        rows={3}
                        className="bg-slate-900/60 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/20 resize-none transition-all"
                      />
                      <div className="flex items-center justify-between">
                        <p
                          className={cn(
                            "text-xs transition-colors",
                            shortDescription.length > 180
                              ? "text-amber-400"
                              : "text-slate-400"
                          )}
                        >
                          {shortDescription.length}/200 characters
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Upload Section */}
                  <div className="space-y-5">
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-cyan-500/20 border border-cyan-500/30">
                        <ImageIcon className="h-3.5 w-3.5 text-cyan-400" />
                      </div>
                      Thumbnail Image
                      <span className="text-slate-500 text-xs ml-2">
                        (Optional - leave empty to keep current)
                      </span>
                    </h3>

                    <div
                      ref={dropZoneRef}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={cn(
                        "relative rounded-xl border-2 border-dashed transition-all duration-300",
                        isDragging
                          ? "border-cyan-400/90 bg-cyan-500/20 scale-[1.02] shadow-lg shadow-cyan-500/30"
                          : "border-cyan-400/60 bg-white/5 hover:border-cyan-400/80 hover:bg-white/8 hover:shadow-md"
                      )}
                    >
                      {thumbnailPreview ? (
                        <div className="relative w-full h-64 rounded-lg overflow-hidden">
                          <Image
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <button
                            onClick={() => {
                              setThumbnailFile(null);
                              setThumbnailPreview(
                                collectionQuery.data?.thumbnailURL || null
                              );
                              if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                              }
                            }}
                            className="absolute top-3 right-3 p-2 rounded-full bg-rose-500/90 hover:bg-rose-500 text-white shadow-lg transition-all hover:scale-110"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-3 left-3 right-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                            >
                              Change Image
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                          <div className="mb-4 p-4 rounded-full bg-cyan-500/15 border border-cyan-400/40 shadow-md shadow-cyan-500/20">
                            <Upload className="h-8 w-8 text-cyan-300" />
                          </div>
                          <p className="text-sm font-medium text-white mb-1">
                            Drop your image here or click to browse
                          </p>
                          <p className="text-xs text-slate-300 mb-4">
                            PNG, JPG, GIF up to 10MB
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="border-cyan-500/50 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20"
                          >
                            Select Image
                          </Button>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer - Sticky at bottom of left column */}
            <div className="p-6 border-t border-slate-700/50 bg-gradient-to-t from-slate-900/95 to-slate-900/80 backdrop-blur-sm space-y-3 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
              {/* Error Messages */}
              {validation.outfits && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-rose-500/20 border border-rose-400/40 animate-in fade-in slide-in-from-bottom-1 shadow-md shadow-rose-500/10">
                  <AlertCircle className="h-4 w-4 text-rose-300 shrink-0" />
                  <p className="text-sm font-medium text-rose-200">
                    {validation.outfits}
                  </p>
                </div>
              )}

              {/* Selected Count */}
              {selectedOutfits.size > 0 && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <Check className="h-4 w-4 text-cyan-400" />
                  <p className="text-sm font-medium text-cyan-200">
                    {selectedOutfits.size} outfit
                    {selectedOutfits.size > 1 ? "s" : ""} selected
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="flex-1 text-slate-300 hover:text-white hover:bg-slate-800/70 border border-slate-700/50 hover:border-slate-600/70 transition-all font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending || !isFormValid || isLoading}
                  className={cn(
                    "flex-1 bg-gradient-to-r from-cyan-500/90 via-blue-500/90 to-indigo-500/90 text-white hover:from-cyan-500 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 transition-all",
                    !isFormValid && "opacity-50 cursor-not-allowed",
                    isFormValid &&
                      "hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/30"
                  )}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Collection
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Select Outfits (Scrollable - ~60%) */}
          <div className="w-[60%] flex flex-col bg-gradient-to-b from-slate-900/30 to-slate-900/20">
            {/* Header - Sticky */}
            <div className="p-6 border-b border-slate-700/50 bg-gradient-to-b from-slate-900/80 to-slate-900/60 backdrop-blur-sm sticky top-0 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-cyan-500/20 border border-cyan-500/30">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    Select Outfits
                    <span className="text-rose-400 font-bold">*</span>
                  </h3>
                </div>
                {selectedOutfits.size > 0 && (
                  <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 border-cyan-400/40 px-3 py-1.5 shadow-md shadow-cyan-500/10">
                    <Check className="h-3 w-3 mr-1.5" />
                    {selectedOutfits.size} selected
                  </Badge>
                )}
              </div>

              {/* Search Bar - Sticky */}
              {outfitsQuery.data && outfitsQuery.data.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search outfits by name or description..."
                    className="pl-10 bg-slate-800/60 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Scrollable Outfits List */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {outfitsQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="h-28 w-full rounded-xl bg-slate-800/60 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredOutfits.length > 0 ? (
                <div className="space-y-3">
                  {filteredOutfits.map((outfit) => {
                    const isSelected = selectedOutfits.has(outfit.id);
                    const selectedData = selectedOutfits.get(outfit.id);

                    return (
                      <div
                        key={outfit.id}
                        className={cn(
                          "group relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer",
                          isSelected
                            ? "border-cyan-400/80 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 shadow-lg shadow-cyan-500/30 scale-[1.01]"
                            : "border-slate-600/40 bg-slate-800/60 hover:border-cyan-500/60 hover:bg-slate-700/60 hover:shadow-md hover:scale-[1.005]"
                        )}
                        onClick={() => handleOutfitToggle(outfit)}
                      >
                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 p-2 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/40 z-10 animate-in zoom-in-50 duration-200">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          {/* Outfit Image */}
                          <div
                            className={cn(
                              "relative w-28 h-28 rounded-xl overflow-hidden border-2 shrink-0 transition-all duration-300",
                              isSelected
                                ? "border-cyan-400/70 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-500/20"
                                : "border-slate-600/40 group-hover:border-cyan-500/60 group-hover:shadow-md"
                            )}
                          >
                            {outfit.items && outfit.items.length > 0 && outfit.items[0].imgUrl ? (
                              <div className="relative w-full h-full">
                                <Image
                                  src={outfit.items[0].imgUrl}
                                  alt={outfit.name}
                                  fill
                                  className={cn(
                                    "object-cover transition-all duration-300 brightness-110",
                                    isSelected
                                      ? "scale-105 brightness-125"
                                      : "group-hover:scale-110 group-hover:brightness-115"
                                  )}
                                />
                                <div
                                  className={cn(
                                    "absolute inset-0 transition-opacity duration-300",
                                    isSelected
                                      ? "bg-cyan-500/10"
                                      : "bg-transparent group-hover:bg-cyan-500/5"
                                  )}
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-slate-700/60 to-slate-800/60 flex items-center justify-center">
                                <ImageIcon className="h-7 w-7 text-slate-400" />
                              </div>
                            )}
                          </div>

                          {/* Outfit Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <h3
                                className={cn(
                                  "font-semibold transition-colors",
                                  isSelected
                                    ? "text-cyan-200"
                                    : "text-white group-hover:text-cyan-300"
                                )}
                              >
                                {outfit.name}
                              </h3>
                              {outfit.items && outfit.items.length > 0 && (
                                <Badge
                                  className={cn(
                                    "text-xs transition-colors",
                                    isSelected
                                      ? "bg-cyan-500/20 text-cyan-200 border-cyan-400/40"
                                      : "bg-slate-700/50 text-slate-300 border-slate-600/50"
                                  )}
                                >
                                  {outfit.items.length} items
                                </Badge>
                              )}
                            </div>
                            {outfit.description && (
                              <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                                {outfit.description}
                              </p>
                            )}

                            {/* Items Thumbnails Row */}
                            {outfit.items && outfit.items.length > 0 && (
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {outfit.items.slice(0, 3).map((item) => (
                                    <div
                                      key={item.itemId}
                                      className={cn(
                                        "relative w-10 h-10 rounded-lg overflow-hidden border transition-all duration-200",
                                        isSelected
                                          ? "border-cyan-400/50 shadow-md shadow-cyan-500/20"
                                          : "border-slate-600/40 group-hover:border-cyan-500/50"
                                      )}
                                      title={item.name}
                                    >
                                      {item.imgUrl ? (
                                        <Image
                                          src={item.imgUrl}
                                          alt={item.name}
                                          fill
                                          className="object-cover"
                                          sizes="40px"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-slate-700/60 to-slate-800/60 flex items-center justify-center">
                                          <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  {outfit.items.length > 3 && (
                                    <div
                                      className={cn(
                                        "flex items-center justify-center w-10 h-10 rounded-lg border font-semibold text-xs transition-all duration-200",
                                        isSelected
                                          ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-200 shadow-md shadow-cyan-500/20"
                                          : "border-slate-600/40 bg-slate-700/50 text-slate-300 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 group-hover:text-cyan-200"
                                      )}
                                      title={`${outfit.items.length - 3} more items`}
                                    >
                                      +{outfit.items.length - 3}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Expandable Description Field */}
                            {isSelected && (
                              <div className="mt-3 pt-3 border-t border-slate-700/50 animate-in slide-in-from-top-2 fade-in duration-300">
                                <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                                  Outfit Description{" "}
                                  <span className="text-slate-500">(Optional)</span>
                                </label>
                                <Textarea
                                  value={selectedData?.description || ""}
                                  onChange={(e) =>
                                    handleOutfitDescriptionChange(
                                      outfit.id,
                                      e.target.value
                                    )
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  onFocus={(e) => e.stopPropagation()}
                                  placeholder="Add a description for this outfit in the collection..."
                                  rows={2}
                                  className="bg-slate-900/70 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/20 resize-none text-sm transition-all"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : outfitsQuery.data && outfitsQuery.data.length === 0 ? (
                <div className="py-12 text-center border border-slate-700/50 rounded-lg bg-slate-800/40">
                  <Sparkles className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">
                    No outfits available
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Create outfits first to add them to collections
                  </p>
                </div>
              ) : searchQuery.trim() ? (
                <div className="py-12 text-center border border-slate-700/50 rounded-lg bg-slate-800/40">
                  <Search className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">
                    No outfits found
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Try adjusting your search query
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

