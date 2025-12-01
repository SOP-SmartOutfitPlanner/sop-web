"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Post } from "@/types/community";
import { PostFormHeader, type PostFormMode } from "./post-form-header";
import { PostFormContent } from "./post-form-content";
import { PostFormFooter } from "./post-form-footer";
import { ItemSelectorModal } from "./ItemSelectorModal";
import { OutfitSelectorModal } from "./OutfitSelectorModal";
import { Outfit } from "@/types/outfit";
import { ApiWardrobeItem, wardrobeAPI } from "@/lib/api/wardrobe-api";
import GlassButton from "@/components/ui/glass-button";
import { Package, Shirt, X, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { getCategoryIcon } from "@/lib/utils/category-icons";
import { getCategoryColor } from "@/lib/constants/category-colors";

interface SharePostData {
  imageUrl: string | null;
  caption: string;
  outfitId?: number;
  itemIds?: number[];
}

interface PostFormDialogProps {
  mode: PostFormMode;
  post?: Post; // Required for edit mode
  isOpen?: boolean; // To lock/unlock body scroll
  onSubmit: (data: {
    caption: string;
    captionHtml: string;
    tags: string[];
    files?: File[];
    existingImageUrls?: string[];
    itemIds?: number[];
    outfitId?: number;
  }) => void | Promise<void | boolean>;
  isSubmitting?: boolean;
  initialShareData?: SharePostData | null; // For external sharing (e.g., virtual try-on)
}

export function PostFormDialog({
  mode,
  post,
  isOpen = true,
  onSubmit,
  isSubmitting = false,
  initialShareData,
}: PostFormDialogProps) {
  const { user } = useAuthStore();

  // Lock body scroll when dialog is open
  useScrollLock(isOpen);

  const [selectedImages, setSelectedImages] = useState<string[]>(
    mode === "edit" && post ? post.images || [] : []
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [hasLoadedShareData, setHasLoadedShareData] = useState(false);

  // Item/Outfit selection state
  const [selectionMode, setSelectionMode] = useState<"items" | "outfit" | null>(
    null
  );
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [selectedItems, setSelectedItems] = useState<ApiWardrobeItem[]>([]); // Store full item data
  const [selectedOutfitId, setSelectedOutfitId] = useState<number | null>(null);
  const [selectedOutfitData, setSelectedOutfitData] = useState<Outfit | null>(
    null
  );
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isOutfitModalOpen, setIsOutfitModalOpen] = useState(false);
  const [replacingItemId, setReplacingItemId] = useState<number | null>(null);
  const [isReplacingAll, setIsReplacingAll] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("Selected items state changed:", selectedItems);
    console.log("Selected item IDs:", selectedItemIds);
    console.log("Selection mode:", selectionMode);
  }, [selectedItems, selectedItemIds, selectionMode]);

  const isEditMode = mode === "edit";

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        bulletList: false,
        orderedList: false,
        horizontalRule: false,
        blockquote: false,
      }),
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
      Underline,
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm focus:outline-none min-h-[140px] max-w-none text-base p-0 pb-10 text-white placeholder:text-slate-500",
        style: "font-size: 16px;",
      },
    },
    onUpdate: ({ editor }) => {
      setCaption(editor.getText());
    },
  });

  // Load initial share data (from virtual try-on or other external sources)
  useEffect(() => {
    if (
      initialShareData &&
      !hasLoadedShareData &&
      editor &&
      mode === "create"
    ) {
      console.log("Loading share data:", initialShareData);

      // Set caption
      if (initialShareData.caption) {
        editor.commands.setContent(initialShareData.caption);
        setCaption(editor.getText());
      }

      // Load image from URL
      if (initialShareData.imageUrl) {
        // Fetch the image and convert to File
        fetch(initialShareData.imageUrl)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], `virtual-tryon-${Date.now()}.jpg`, {
              type: blob.type,
            });
            setSelectedFiles([file]);

            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              setSelectedImages([result]);
            };
            reader.readAsDataURL(file);
          })
          .catch((err) => console.error("Failed to load share image:", err));
      }

      // Set items/outfit if provided
      if (initialShareData.itemIds && initialShareData.itemIds.length > 0) {
        setSelectionMode("items");
        setSelectedItemIds(initialShareData.itemIds);

        // Fetch full item data
        Promise.all(
          initialShareData.itemIds.map((id) =>
            wardrobeAPI.getItem(id).catch(() => null)
          )
        ).then((items) => {
          const validItems = items.filter(
            (item): item is ApiWardrobeItem => item !== null
          );
          setSelectedItems(validItems);
        });
      } else if (initialShareData.outfitId) {
        setSelectionMode("outfit");
        setSelectedOutfitId(initialShareData.outfitId);
        // Note: Full outfit data would need to be fetched here if needed
      }

      setHasLoadedShareData(true);
    }
  }, [initialShareData, hasLoadedShareData, editor, mode]);

  // Initialize editor with post data in edit mode
  useEffect(() => {
    if (isEditMode && editor && post) {
      // Reconstruct caption with hashtags
      const hashtagsText = post.tags?.map((tag) => `#${tag.name}`).join(" ");
      const fullCaption = hashtagsText
        ? `${post.caption} ${hashtagsText}`
        : post.caption;

      editor.commands.setContent(fullCaption);
      setCaption(editor.getText());

      // Initialize selected images
      if (post.images && post.images.length > 0) {
        setSelectedImages(post.images);
      }

      // Initialize items/outfit from post
      if (post.items && post.items.length > 0) {
        // Filter out deleted items and only keep their IDs
        const nonDeletedItemIds = post.items
          .filter((item) => !item.isDeleted)
          .map((item) => item.id);

        setSelectionMode("items");
        setSelectedItemIds(nonDeletedItemIds);

        // Store full item data for edit mode
        const itemsData = post.items
          .filter((item) => !item.isDeleted)
          .map(
            (item) =>
              ({
                userId: parseInt(post.userId),
                name: item.name,
                categoryId: item.categoryId,
                categoryName: item.categoryName,
                color: item.color || "",
                aiDescription: "",
                brand: item.brand || "",
                imgUrl: item.imgUrl,
                weatherSuitable: "",
                condition: "",
                pattern: "",
                fabric: "",
                id: item.id,
              } as ApiWardrobeItem)
          );
        setSelectedItems(itemsData);
      } else if (post.outfit) {
        setSelectionMode("outfit");
        setSelectedOutfitId(post.outfit.id);

        // Reconstruct outfit data from post
        setSelectedOutfitData({
          id: post.outfit.id,
          userId: parseInt(post.userId),
          userDisplayName: post.userDisplayName,
          name: post.outfit.name,
          description: post.outfit.description || "",
          isFavorite: false,
          isSaved: false,
          createdDate: "",
          updatedDate: null,
          items: post.outfit.items.map((item) => ({
            id: item.id,
            itemId: item.id,
            name: item.name,
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            color: item.color,
            brand: item.brand || "",
            frequencyWorn: "",
            lastWornAt: "",
            imgUrl: item.imgUrl,
            weatherSuitable: "",
            condition: "",
            pattern: "",
            fabric: "",
          })),
        });
      }
    }
  }, [editor, isEditMode, post]);

  const addEmoji = (emojiData: { emoji: string }) => {
    editor?.chain().focus().insertContent(emojiData.emoji).run();
  };

  // Handle selection mode change (items/outfit/none)
  const handleModeChange = (mode: "items" | "outfit" | null) => {
    setSelectionMode(mode);

    // Clear opposite selection when switching modes
    if (mode === "items") {
      setSelectedOutfitId(null);
      setSelectedOutfitData(null);
    } else if (mode === "outfit") {
      setSelectedItemIds([]);
      setSelectedItems([]);
    } else {
      // Clear all selections
      setSelectedItemIds([]);
      setSelectedItems([]);
      setSelectedOutfitId(null);
      setSelectedOutfitData(null);
    }
  };

  // Handle item selection
  const handleItemSelect = async (itemIds: number[]) => {
    console.log("handleItemSelect called with itemIds:", itemIds);

    // Fetch full item data for the selected items
    try {
      const itemsData = await Promise.all(
        itemIds.map(async (id) => {
          try {
            const itemData = await wardrobeAPI.getItem(id);
            console.log(`Fetched item ${id}:`, itemData);
            return itemData;
          } catch (error) {
            console.error(`Failed to fetch item ${id}:`, error);
            return null;
          }
        })
      );
      const validItems = itemsData.filter(
        (item): item is ApiWardrobeItem => item !== null
      );

      console.log("Valid items fetched:", validItems);

      // For all cases (normal, replacing single item, replacing all), directly set the new selection
      // The modal now handles pre-selection of existing items, so user can check/uncheck freely
      setSelectedItemIds(itemIds);
      setSelectedItems(validItems);

      // Reset replace state
      if (isReplacingAll) {
        setIsReplacingAll(false);
      }
      if (replacingItemId !== null) {
        setReplacingItemId(null);
      }

      // Close modal AFTER all state updates complete
      setIsItemModalOpen(false);
    } catch (error) {
      console.error("Failed to fetch item data:", error);
      setIsItemModalOpen(false); // Close even on error
    }
  };

  // Handle replacing single deleted item
  const handleReplaceItem = (deletedItemId: number) => {
    setReplacingItemId(deletedItemId);
    setIsItemModalOpen(true);
  };

  // Handle replacing all deleted items
  const handleReplaceAll = () => {
    setIsReplacingAll(true);
    setIsItemModalOpen(true);
  };

  // Handle outfit selection
  const handleOutfitSelect = (outfitId: number, outfitData: Outfit) => {
    setSelectedOutfitId(outfitId);
    setSelectedOutfitData(outfitData);
    setIsOutfitModalOpen(false);
  };

  // Remove selected item
  const handleRemoveItem = (itemId: number) => {
    setSelectedItemIds((prev) => prev.filter((id) => id !== itemId));
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
    if (selectedItemIds.length === 1) {
      setSelectionMode(null);
    }
  };

  // Remove selected outfit
  const handleRemoveOutfit = () => {
    setSelectedOutfitId(null);
    setSelectedOutfitData(null);
    setSelectionMode(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Store File objects for new uploads
    setSelectedFiles((prev) => [...prev, ...fileArray]);

    // Create preview URLs
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImages((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));

    // In edit mode, only remove from files if it's a newly added image
    if (isEditMode && post) {
      if (index >= post.images.length) {
        const fileIndex = index - post.images.length;
        setSelectedFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      }
    } else {
      // In create mode, simply remove from files
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editor || !user) {
      console.error("Missing editor or user");
      return;
    }

    const plainTextCaption = editor.getText().trim();
    const captionHtmlRaw = editor.getHTML().trim();

    if (!plainTextCaption) {
      return;
    }

    // Extract hashtags (support Unicode letters/numbers)
    const HASHTAG_REGEX = /#([\p{L}\p{N}_]+)/gu;
    const hashtags =
      Array.from(
        plainTextCaption.matchAll(HASHTAG_REGEX),
        (match) => match[1]
      ) || [];

    // Remove hashtags from caption
    const captionWithoutHashtags = plainTextCaption
      .replace(/#([\p{L}\p{N}_]+)/gu, "")
      .trim();
    const captionHtmlWithoutHashtags = captionHtmlRaw
      .replace(/#([\p{L}\p{N}_]+)/gu, "")
      .trim();

    // Calculate remaining original images (images that are still selected but not new files)
    // In edit mode: selectedImages = [original images...] + [new file previews...]
    // We need to find which images are original (URLs) vs new (data URLs from FileReader)
    const originalImages = isEditMode && post ? post.images || [] : [];
    const remainingOriginalImages: string[] = [];

    if (isEditMode && post && originalImages.length > 0) {
      selectedImages.forEach((img) => {
        // Original images are URLs (start with http/https), new images are data URLs (start with data:)
        if (
          (img.startsWith("http://") || img.startsWith("https://")) &&
          originalImages.includes(img)
        ) {
          remainingOriginalImages.push(img);
        }
      });
    }

    const submitData = {
      caption: captionWithoutHashtags,
      captionHtml: captionHtmlWithoutHashtags,
      tags: hashtags,
      files: selectedFiles.length > 0 ? selectedFiles : undefined,
      existingImageUrls: isEditMode ? remainingOriginalImages : undefined,
      itemIds: selectedItemIds.length > 0 ? selectedItemIds : undefined,
      outfitId: selectedOutfitId || undefined,
    };

    const result = await onSubmit(submitData);

    // Reset form for create mode only if submission was successful
    // If result is explicitly false, do not reset (error occurred)
    // If result is undefined (void) or true, proceed with reset
    const success = result !== false;

    if (success && !isEditMode) {
      editor.commands.setContent("");
      setSelectedImages([]);
      setSelectedFiles([]);
      setSelectionMode(null);
      setSelectedItemIds([]);
      setSelectedItems([]);
      setSelectedOutfitId(null);
      setSelectedOutfitData(null);
    }
  };

  return (
    <>
      <div className="w-full h-full max-h-[90vh] flex flex-col gap-0 overflow-hidden z-50">
        {/* Fixed Header */}
        <PostFormHeader
          mode={mode}
          user={
            user
              ? { avatar: user.avatar, displayName: user.displayName }
              : undefined
          }
        />

        {/* Scrollable Content - Only this scrolls */}
        <div className="flex-1 overflow-y-auto modal-scrollbar scrollbar-thin scrollbar-track-transparent scrollbar-thumb-cyan-400/20 hover:scrollbar-thumb-cyan-400/35">
          <PostFormContent
            user={user}
            editor={editor}
            selectedImages={selectedImages}
            onImageUpload={handleImageUpload}
            onRemoveImage={removeImage}
            onAddEmoji={addEmoji}
            caption={caption}
            onCaptionChange={setCaption}
            onSubmit={handleSubmit}
          />

          {/* Item/Outfit Selection Section */}
          <div className="px-6 pb-4">
            <div className="border-t border-white/10 pt-4">
              <h3 className="text-sm font-bricolage font-semibold text-white mb-3">
                Attach Items or Outfit (Optional)
              </h3>

              {/* Selection Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <GlassButton
                  variant={selectionMode === "items" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() =>
                    handleModeChange(selectionMode === "items" ? null : "items")
                  }
                >
                  <Package className="w-4 h-4 mr-2" />
                  Items (0-4)
                </GlassButton>
                <GlassButton
                  variant={selectionMode === "outfit" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() =>
                    handleModeChange(
                      selectionMode === "outfit" ? null : "outfit"
                    )
                  }
                >
                  <Shirt className="w-4 h-4 mr-2" />
                  Outfit
                </GlassButton>
              </div>

              {/* Items Selection */}
              {selectionMode === "items" && (
                <div className="space-y-3">
                  {selectedItemIds.length === 0 &&
                  (!isEditMode || !post?.items?.some((i) => i.isDeleted)) ? (
                    <button
                      onClick={() => setIsItemModalOpen(true)}
                      className="w-full py-8 border-2 border-dashed border-white/20 rounded-xl hover:border-white/40 transition-colors flex flex-col items-center justify-center gap-2"
                    >
                      <Package className="w-8 h-8 text-white/40" />
                      <span className="text-sm text-white/60">
                        Click to select items
                      </span>
                    </button>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {/* Show selected (non-deleted) items */}
                        {selectedItems.map((item) => {
                          return (
                            <div
                              key={item.id}
                              className="relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10"
                            >
                              {item?.imgUrl ? (
                                <Image
                                  src={item.imgUrl}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Package className="w-8 h-8 text-white/40" />
                                </div>
                              )}
                              <button
                                onClick={() => handleRemoveItem(item.id!)}
                                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors z-10"
                                aria-label="Remove item"
                              >
                                <X className="w-3 h-3 text-white" />
                              </button>
                              {item?.name && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                                  <p className="text-xs text-white truncate">
                                    {item.name}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Show deleted items with replace button in edit mode - only if not at max selection */}
                        {isEditMode &&
                          selectedItemIds.length < 4 &&
                          post?.items
                            ?.filter((i) => i.isDeleted)
                            .map((deletedItem) => (
                              <div
                                key={`deleted-${deletedItem.id}`}
                                className="relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-red-500/50 opacity-50 grayscale"
                              >
                                <Image
                                  src={deletedItem.imgUrl}
                                  alt={deletedItem.name}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                                  <span className="text-xs text-red-400 font-bold">
                                    Deleted
                                  </span>
                                  <GlassButton
                                    variant="primary"
                                    size="sm"
                                    onClick={() =>
                                      handleReplaceItem(deletedItem.id)
                                    }
                                    className="text-xs"
                                  >
                                    Replace
                                  </GlassButton>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1">
                                  <p className="text-xs text-white/60 truncate line-through">
                                    {deletedItem.name}
                                  </p>
                                </div>
                              </div>
                            ))}
                      </div>

                      {/* Replace All button if multiple deleted items and not at max selection */}
                      {isEditMode &&
                        selectedItemIds.length < 4 &&
                        post?.items &&
                        post.items.filter((i) => i.isDeleted).length > 1 && (
                          <GlassButton
                            variant="secondary"
                            size="sm"
                            onClick={handleReplaceAll}
                            className="w-full"
                          >
                            Replace All Deleted (
                            {post.items.filter((i) => i.isDeleted).length})
                          </GlassButton>
                        )}

                      <GlassButton
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setReplacingItemId(null);
                          setIsReplacingAll(false);
                          setIsItemModalOpen(true);
                        }}
                        className="w-full"
                      >
                        {selectedItemIds.length < 4
                          ? "Add More Items"
                          : "Change Items"}
                      </GlassButton>
                    </>
                  )}
                </div>
              )}

              {/* Outfit Selection */}
              {selectionMode === "outfit" && (
                <div className="space-y-3">
                  {!selectedOutfitId ? (
                    <button
                      onClick={() => setIsOutfitModalOpen(true)}
                      className="w-full py-8 border-2 border-dashed border-white/20 rounded-xl hover:border-white/40 transition-colors flex flex-col items-center justify-center gap-2"
                    >
                      <Shirt className="w-8 h-8 text-white/40" />
                      <span className="text-sm text-white/60">
                        Click to select outfit
                      </span>
                    </button>
                  ) : (
                    selectedOutfitData && (
                      <OutfitPreviewCard
                        outfit={selectedOutfitData}
                        onRemove={handleRemoveOutfit}
                        onChangeOutfit={() => setIsOutfitModalOpen(true)}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <PostFormFooter
          mode={mode}
          caption={caption}
          editor={editor}
          isSubmitting={isSubmitting}
          onImageUploadClick={handleImageUpload}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Modals - Rendered as portals at root level */}
      {typeof document !== "undefined" &&
        createPortal(
          <>
            <ItemSelectorModal
              isOpen={isItemModalOpen}
              onClose={() => {
                setIsItemModalOpen(false);
                setReplacingItemId(null);
                setIsReplacingAll(false);
              }}
              onSelect={handleItemSelect}
              selectedItemIds={selectedItemIds}
              maxSelection={4}
              excludeItemIds={[]}
              title={
                replacingItemId !== null
                  ? "Replace Deleted Item"
                  : isReplacingAll
                  ? "Replace All Deleted Items"
                  : mode === "create"
                  ? "Select Items for Post"
                  : "Select Items"
              }
              description={
                replacingItemId !== null
                  ? "Update your item selection. Currently selected items are shown checked."
                  : isReplacingAll
                  ? `Select up to ${
                      post?.items?.filter((i) => i.isDeleted).length
                    } replacement items`
                  : mode === "create"
                  ? "Choose items to attach to your post (0-4 items)"
                  : "Select up to 4 items from your wardrobe"
              }
            />

            <OutfitSelectorModal
              isOpen={isOutfitModalOpen}
              onClose={() => setIsOutfitModalOpen(false)}
              onSelect={handleOutfitSelect}
              selectedOutfitId={selectedOutfitId}
              title={
                mode === "create" ? "Select Outfit for Post" : "Select Outfit"
              }
              description={
                mode === "create"
                  ? "Choose an outfit to attach to your post"
                  : "Choose an outfit to attach"
              }
            />
          </>,
          document.body
        )}
    </>
  );
}

// Outfit Preview Card Component
interface OutfitPreviewCardProps {
  outfit: Outfit;
  onRemove: () => void;
  onChangeOutfit: () => void;
}

function OutfitPreviewCard({
  outfit,
  onRemove,
  onChangeOutfit,
}: OutfitPreviewCardProps) {
  const [showAllItems, setShowAllItems] = useState(false);
  const itemCount = outfit.items?.length || 0;
  const hasMoreItems = itemCount > 4;
  const displayedItems = showAllItems
    ? outfit.items
    : outfit.items?.slice(0, 4);

  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-400/30 p-4">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors z-10"
        aria-label="Remove outfit"
      >
        <X className="w-3.5 h-3.5 text-white" />
      </button>

      {/* Outfit Info Section */}
      <div className="bg-white/10 rounded-lg px-3 py-2 mb-3 border border-white/20">
        <div className="flex items-center gap-2 mb-1">
          <Shirt className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-cyan-300 font-medium uppercase tracking-wide">
            Attached Outfit
          </span>
        </div>
        <h4 className="font-bricolage font-bold text-white text-base mb-1">
          {outfit.name}
        </h4>
        {outfit.description && (
          <p className="text-xs text-white/70 line-clamp-2 mb-1">
            {outfit.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/50">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
          {hasMoreItems && (
            <button
              onClick={() => setShowAllItems(!showAllItems)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
            >
              {showAllItems ? (
                <>
                  Show Less <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  Show All ({itemCount - 4} more){" "}
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Items Grid with Category Badges */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {displayedItems?.map((item) => {
          const CategoryIcon = getCategoryIcon(item.categoryId);
          const categoryColor = getCategoryColor(item.categoryId);

          return (
            <div
              key={item.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10 group"
            >
              <Image
                src={item.imgUrl}
                alt={item.name}
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
              {/* Category Badge */}
              <div
                className={`absolute bottom-1 left-1 flex items-center gap-0.5 ${categoryColor} text-white rounded px-1 py-0.5 text-[9px] font-medium`}
              >
                <CategoryIcon className="w-2 h-2" />
              </div>
              {/* Item Name on Hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                <p className="text-[10px] text-white p-1.5 truncate w-full">
                  {item.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Change Outfit Button */}
      <GlassButton
        variant="secondary"
        size="sm"
        onClick={onChangeOutfit}
        className="w-full"
      >
        Change Outfit
      </GlassButton>
    </div>
  );
}
