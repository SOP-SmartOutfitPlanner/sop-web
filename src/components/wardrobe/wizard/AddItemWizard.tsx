"use client";

import { useState, useCallback, memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Image, Select } from "antd";
import GlassButton from "@/components/ui/glass-button";
import { useAuthStore } from "@/store/auth-store";
import { useWardrobeStore } from "@/store/wardrobe-store";
import { minioAPI } from "@/lib/api/minio-api";
import { wardrobeAPI } from "@/lib/api/wardrobe-api";
import { getUserIdFromAuth } from "@/lib/utils/wizard-transform";
import { StepPhotoAI } from "./StepPhotoAI";

interface AddItemWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editMode?: boolean;
  editItemId?: number;
  editItem?: {
    id?: number;
    imgUrl: string;
    name: string;
    categoryName: string;
  };
}

const STEP = {
  UPLOAD: 0,
  MANUAL_CATEGORIZE: 1,
  AI_ANALYSIS: 2,
} as const;

type Step = typeof STEP[keyof typeof STEP];

interface FailedItem {
  imageUrl: string;
  reason: string;
  categoryId?: number;
}

// Memoized item card to prevent unnecessary re-renders
interface ItemCardProps {
  item: {
    id?: number;
    imgUrl: string;
    name: string;
    categoryName?: string;
    category?: { id: number; name: string };
  };
  isSelected: boolean;
  onToggle: (id: number) => void;
}

const AnalysisItemCard = memo(({ item, isSelected, onToggle }: ItemCardProps) => {
  const handleClick = () => {
    if (item.id) onToggle(item.id);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative w-full flex flex-col cursor-pointer p-1"
    >
      {/* GlassCard wrapper */}
      <div
        className={
          isSelected
            ? "relative flex flex-col p-2 rounded-2xl transition-all duration-100 bg-gradient-to-br from-cyan-300/30 via-blue-200/10 to-indigo-300/30 backdrop-blur-md border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/40 ring-2 ring-cyan-400/30 ring-offset-2 ring-offset-transparent"
            : "relative flex flex-col p-2 rounded-2xl transition-all duration-100 bg-gradient-to-br from-cyan-300/30 via-blue-200/10 to-indigo-300/30 backdrop-blur-md border-2 border-white/20 hover:border-cyan-400/40"
        }
      >
        {/* Selection Indicator */}
        <div className={
          isSelected
            ? "absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-100 border-2 bg-cyan-500 border-white/50 shadow-lg"
            : "absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-100 border-2 bg-white/20 backdrop-blur-md border-white/30"
        }>
          {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
        </div>

        {/* Image Container */}
        <div className="bg-white/5 rounded-lg aspect-square overflow-hidden relative mb-2">
          <Image
            src={item.imgUrl}
            alt={item.name}
            width="100%"
            height="100%"
            className="object-cover rounded-lg"
            preview={false}
            loading="lazy"
            placeholder={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              borderRadius: '0.5rem'
            }}
            wrapperClassName="w-full h-full"
            rootClassName="w-full h-full !block"
          />
        </div>

        {/* Item Details */}
        <div className="flex flex-col px-1">
          {/* Name */}
          <h3 className="text-white font-semibold text-sm truncate mb-1">
            {item.name}
          </h3>

          {/* Category */}
          <span className="px-1.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/70 text-[9px] font-medium truncate text-center">
            {item.categoryName || item.category?.name || "Uncategorized"}
          </span>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if isSelected changes or item.id changes
  return prevProps.isSelected === nextProps.isSelected &&
         prevProps.item.id === nextProps.item.id;
});

AnalysisItemCard.displayName = 'AnalysisItemCard';

// Manual Categorize Card Component
interface ManualCategorizeCardProps {
  item: FailedItem;
  index: number;
  categories: { id: number; name: string }[];
  onCategoryChange: (index: number, categoryId: number) => void;
}

const ManualCategorizeCard = memo(({ item, index, categories, onCategoryChange }: ManualCategorizeCardProps) => {
  return (
    <div className="group relative w-full flex flex-col p-1">
      <div className="relative flex flex-col p-2 rounded-2xl transition-all duration-100 bg-gradient-to-br from-cyan-300/30 via-blue-200/10 to-indigo-300/30 backdrop-blur-md border-2 border-white/20">
        {/* Alert Badge */}
        <div className="absolute top-2 right-2 z-10">
          <div className="w-6 h-6 rounded-full bg-orange-500/90 backdrop-blur-md border-2 border-white/50 flex items-center justify-center shadow-lg">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Image Container */}
        <div className="bg-white/5 rounded-lg aspect-square overflow-hidden relative mb-2">
          <Image
            src={item.imageUrl}
            alt={`Item ${index + 1}`}
            width="100%"
            height="100%"
            className="object-cover rounded-lg"
            preview={false}
            loading="lazy"
            placeholder={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              borderRadius: '0.5rem'
            }}
            wrapperClassName="w-full h-full"
            rootClassName="w-full h-full !block"
          />
        </div>

        {/* Reason */}
        <div className="px-1 mb-2">
          <p className="text-xs text-orange-200/90 font-medium truncate">
            {item.reason}
          </p>
        </div>

        {/* Category Selector */}
        <div className="px-1">
          <Select
            placeholder="Select category"
            value={item.categoryId}
            onChange={(value) => onCategoryChange(index, value)}
            className="w-full"
            size="small"
            style={{ width: '100%' }}
            dropdownStyle={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
            }}
            options={categories.map(cat => ({
              label: cat.name,
              value: cat.id,
            }))}
          />
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.categoryId === nextProps.item.categoryId &&
         prevProps.item.imageUrl === nextProps.item.imageUrl &&
         prevProps.categories === nextProps.categories;
});

ManualCategorizeCard.displayName = 'ManualCategorizeCard';

export function AddItemWizard({ open, onOpenChange, editMode, editItemId, editItem }: AddItemWizardProps) {
  // Suppress unused variable warnings - edit mode is not yet implemented
  void editMode;
  void editItemId;
  void editItem;

  const [currentStep, setCurrentStep] = useState<Step>(STEP.UPLOAD);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedItemIds, setUploadedItemIds] = useState<number[]>([]);
  const [selectedItemsForAnalysis, setSelectedItemsForAnalysis] = useState<number[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [failedItems, setFailedItems] = useState<FailedItem[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [isCategorizing, setIsCategorizing] = useState(false);

  const { user } = useAuthStore();
  const { getRawItemById } = useWardrobeStore();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await wardrobeAPI.getCategories();
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  // Reset and close
  const resetAndClose = useCallback(() => {
    setSelectedFiles([]);
    setCurrentStep(STEP.UPLOAD);
    setUploadedItemIds([]);
    setSelectedItemsForAnalysis([]);
    setFailedItems([]);
    setIsUploading(false);
    setIsAnalyzing(false);
    setIsCategorizing(false);
    onOpenChange(false);
  }, [onOpenChange]);

  // Handle file selection from StepPhotoAI
  const handleFilesSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  // Handle clear files
  const handleClearFiles = () => {
    setSelectedFiles([]);
  };

  // Toggle item selection for AI analysis (memoized to prevent re-renders)
  const toggleItemSelection = useCallback((itemId: number) => {
    setSelectedItemsForAnalysis(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  // Select/Deselect all items
  const toggleSelectAll = () => {
    if (selectedItemsForAnalysis.length === uploadedItemIds.length) {
      setSelectedItemsForAnalysis([]);
    } else {
      setSelectedItemsForAnalysis(uploadedItemIds);
    }
  };

  // Handle AI analysis
  const handleRunAnalysis = async () => {
    if (selectedItemsForAnalysis.length === 0) {
      toast.error("Please select at least one item for analysis");
      return;
    }

    setIsAnalyzing(true);
    const loadingToast = toast.loading(`Running AI analysis on ${selectedItemsForAnalysis.length} item${selectedItemsForAnalysis.length > 1 ? 's' : ''}...`);

    try {
      const confidenceScores = await wardrobeAPI.analyzeItems(selectedItemsForAnalysis);
      toast.success(
        `AI analysis complete for ${confidenceScores.length} item${confidenceScores.length > 1 ? 's' : ''}!`,
        { id: loadingToast }
      );

      // Refresh wardrobe items to get updated analysis data
      const state = useWardrobeStore.getState();
      await state.fetchItems();

      // Close wizard after successful analysis
      setTimeout(() => {
        resetAndClose();
      }, 1000);
    } catch (error) {
      console.error("❌ AI analysis error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to run AI analysis",
        { id: loadingToast }
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Skip AI analysis
  const handleSkipAnalysis = () => {
    resetAndClose();
  };

  // Update category for a failed item
  const updateFailedItemCategory = (index: number, categoryId: number) => {
    setFailedItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], categoryId };
      return updated;
    });
  };

  // Handle manual categorization submission
  const handleCategorizeSubmit = async () => {
    // Validate all items have categories
    const uncategorizedItems = failedItems.filter(item => !item.categoryId);
    if (uncategorizedItems.length > 0) {
      toast.error("Please select a category for all items");
      return;
    }

    setIsCategorizing(true);
    const loadingToast = toast.loading(`Categorizing ${failedItems.length} item${failedItems.length > 1 ? 's' : ''}...`);

    try {
      const userId = await getUserIdFromAuth(user);

      // Submit to bulk manual API
      const result = await wardrobeAPI.bulkUploadManual({
        userId,
        itemsUpload: failedItems.map(item => ({
          imageURLs: item.imageUrl,
          categoryId: item.categoryId!,
        })),
      });

      toast.success(
        `Successfully categorized ${result.itemIds.length} item${result.itemIds.length > 1 ? 's' : ''}!`,
        { id: loadingToast }
      );

      // Fetch each manually categorized item and add to store
      const state = useWardrobeStore.getState();
      for (const itemId of result.itemIds) {
        try {
          const item = await wardrobeAPI.getItem(itemId);
          state.addItemOptimistic(item);
        } catch (error) {
          console.error(`Failed to fetch item ${itemId}:`, error);
        }
      }

      // Merge all uploaded item IDs (from auto + manual)
      const allItemIds = [...uploadedItemIds, ...result.itemIds];
      setUploadedItemIds(allItemIds);
      setSelectedItemsForAnalysis(allItemIds); // Pre-select all items

      // Clear failed items and move to AI analysis
      setFailedItems([]);
      setCurrentStep(STEP.AI_ANALYSIS);
    } catch (error) {
      console.error("❌ Manual categorization error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to categorize items",
        { id: loadingToast }
      );
    } finally {
      setIsCategorizing(false);
    }
  };

  // Handle submit - upload all images
  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading(`Uploading ${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''}...`);

    try {
      const userId = await getUserIdFromAuth(user);

      // Phase 1: Upload all images to MinIO
      const bulkUploadResult = await minioAPI.uploadImagesBulk(selectedFiles);

      // Extract successful URLs
      const successfulUrls = bulkUploadResult.successfulUploads.map(upload => upload.downloadUrl);

      // Handle failed uploads
      if (bulkUploadResult.failedUploads.length > 0) {
        console.warn(`⚠️ ${bulkUploadResult.failedUploads.length} files failed to upload:`, bulkUploadResult.failedUploads);
        bulkUploadResult.failedUploads.forEach(failed => {
          toast.error(`Failed to upload ${failed.fileName}: ${failed.reason}`);
        });
      }

      // If no files uploaded successfully, stop here
      if (successfulUrls.length === 0) {
        toast.error("All files failed to upload. Please try again.", { id: loadingToast });
        setIsUploading(false);
        return;
      }

      toast.loading(`Creating ${successfulUrls.length} item${successfulUrls.length > 1 ? 's' : ''}...`, { id: loadingToast });

      // Phase 2: Bulk upload with auto categorization
      const response = await wardrobeAPI.bulkUploadAuto({
        userId,
        imageURLs: successfulUrls,
      });

      const succeededCount = response.itemIds.length;
      const hasFailedItems = response.failedItems && response.failedItems.length > 0;

      // Case 1: All items failed (0 succeeded, all failed)
      if (succeededCount === 0 && hasFailedItems) {
        toast.warning(
          `All ${response.failedItems!.length} item${response.failedItems!.length > 1 ? 's' : ''} couldn't be auto-categorized. Please categorize manually.`,
          { id: loadingToast }
        );
        setFailedItems(response.failedItems!);
        setCurrentStep(STEP.MANUAL_CATEGORIZE);
      }
      // Case 2: Some succeeded, some failed (partial success)
      else if (succeededCount > 0 && hasFailedItems) {
        toast.success(
          `Successfully added ${succeededCount} item${succeededCount > 1 ? 's' : ''}!`,
          { id: loadingToast }
        );
        toast.warning(
          `${response.failedItems!.length} item${response.failedItems!.length > 1 ? 's' : ''} couldn't be auto-categorized. Please categorize manually.`
        );

        // Refresh wardrobe items
        const state = useWardrobeStore.getState();
        await state.fetchItems();

        // Store uploaded item IDs
        setUploadedItemIds(response.itemIds);
        setFailedItems(response.failedItems!);
        setCurrentStep(STEP.MANUAL_CATEGORIZE);
      }
      // Case 3: All succeeded (full success)
      else if (succeededCount > 0) {
        toast.success(
          `Successfully added ${succeededCount} item${succeededCount > 1 ? 's' : ''}!`,
          { id: loadingToast }
        );

        // Fetch each uploaded item individually and add to store
        const state = useWardrobeStore.getState();
        for (const itemId of response.itemIds) {
          try {
            const item = await wardrobeAPI.getItem(itemId);
            state.addItemOptimistic(item);
          } catch (error) {
            console.error(`Failed to fetch item ${itemId}:`, error);
          }
        }

        // Store uploaded item IDs and go directly to AI analysis
        setUploadedItemIds(response.itemIds);
        setSelectedItemsForAnalysis(response.itemIds); // Pre-select all items
        setCurrentStep(STEP.AI_ANALYSIS);
      }
      // Case 4: Complete failure (shouldn't happen, but handle it)
      else {
        toast.error("Failed to create items. Please try again.", { id: loadingToast });
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload images",
        { id: loadingToast }
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (!open) return null;

  // Get uploaded items data from store
  const uploadedItems = uploadedItemIds
    .map(id => getRawItemById(id))
    .filter((item): item is NonNullable<typeof item> => item !== undefined);

  // Use Set for O(1) selection lookup instead of array includes
  const selectedSet = new Set(selectedItemsForAnalysis);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed h-full inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-hidden overscroll-none"
        style={{ position: 'fixed', inset: 0 }}
        onClick={() => {
          if (!isUploading && !isAnalyzing && !isCategorizing) {
            resetAndClose();
          }
        }}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none overflow-hidden">
        <div
          className="w-[1400px] max-w-[60vw] h-[85vh] rounded-3xl overflow-hidden shadow-2xl pointer-events-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Full Background Container with Glassmorphism */}
          <div className="absolute inset-0 bg-gradient-to-br bg-opacity-70 from-slate-900/50 via-blue-900/90 to-slate-900/50">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 -right-32 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-cyan-200/30 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 h-full flex flex-col">
            {/* Header */}
            <div className="px-12 pt-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-dela-gothic text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                    {currentStep === STEP.UPLOAD
                      ? "Add Items to Wardrobe"
                      : currentStep === STEP.MANUAL_CATEGORIZE
                      ? "Manual Categorization"
                      : "AI Analysis"
                    }
                  </h2>
                  <p className="font-bricolage text-lg text-gray-200 mt-2">
                    {currentStep === STEP.UPLOAD
                      ? "Upload up to 10 images to add to your wardrobe"
                      : currentStep === STEP.MANUAL_CATEGORIZE
                      ? "Select a category for each item that couldn't be auto-categorized"
                      : "Select items to analyze with AI for detailed attributes"
                    }
                  </p>
                </div>
                <button
                  onClick={resetAndClose}
                  disabled={isUploading || isAnalyzing || isCategorizing}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 px-12 py-4 overflow-hidden min-h-0 flex flex-col">
              <AnimatePresence mode="wait">
                {currentStep === STEP.UPLOAD && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 overflow-hidden"
                  >
                    <StepPhotoAI
                      onFilesSelect={handleFilesSelect}
                      onClearFiles={handleClearFiles}
                    />
                  </motion.div>
                )}

                {currentStep === STEP.MANUAL_CATEGORIZE && (
                  <motion.div
                    key="categorize"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 overflow-hidden flex flex-col"
                  >
                    {/* Categorization Header */}
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-orange-400" />
                        <span className="font-bricolage text-lg text-white font-semibold">
                          {failedItems.filter(item => item.categoryId).length} of {failedItems.length} items categorized
                        </span>
                      </div>
                    </div>

                    {/* Items Grid */}
                    <div className="flex-1 overflow-y-auto min-h-0 wizard-scrollbar">
                      <div className="grid grid-cols-5 gap-4">
                        {failedItems.map((item, index) => (
                          <ManualCategorizeCard
                            key={`failed-${index}`}
                            item={item}
                            index={index}
                            categories={categories}
                            onCategoryChange={updateFailedItemCategory}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === STEP.AI_ANALYSIS && (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 overflow-hidden flex flex-col"
                  >
                    {/* Selection Header */}
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                        <span className="font-bricolage text-lg text-white font-semibold">
                          {selectedItemsForAnalysis.length} of {uploadedItemIds.length} items selected
                        </span>
                      </div>
                      <GlassButton
                        onClick={toggleSelectAll}
                        variant="custom"
                        backgroundColor="rgba(255, 255, 255, 0.2)"
                        borderColor="rgba(255, 255, 255, 0.4)"
                        textColor="white"
                        size="sm"
                      >
                        {selectedItemsForAnalysis.length === uploadedItemIds.length ? "Deselect All" : "Select All"}
                      </GlassButton>
                    </div>

                    {/* Items Grid */}
                    <div className="flex-1 overflow-y-auto min-h-0 hide-scrollbar" data-lenis-prevent>
                      <div className="grid grid-cols-5 gap-4">
                        {uploadedItems.map((item) => (
                          <AnalysisItemCard
                            key={item.id}
                            item={item}
                            isSelected={selectedSet.has(item.id!)}
                            onToggle={toggleItemSelection}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="px-12 pb-8">
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-4">
                  {currentStep === STEP.UPLOAD ? (
                    <>
                      <GlassButton
                        onClick={resetAndClose}
                        disabled={isUploading}
                        variant="custom"
                        backgroundColor="rgba(255, 255, 255, 0.3)"
                        borderColor="rgba(255, 255, 255, 0.5)"
                        textColor="#374151"
                        size="md"
                      >
                        <X className="w-5 h-5" />
                        Cancel
                      </GlassButton>

                      <GlassButton
                        onClick={handleSubmit}
                        disabled={isUploading || selectedFiles.length === 0}
                        variant="custom"
                        backgroundColor="rgba(59, 130, 246, 0.6)"
                        borderColor="rgba(59, 130, 246, 0.8)"
                        textColor="white"
                        size="md"
                      >
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            Upload & Add to Wardrobe
                          </>
                        )}
                      </GlassButton>
                    </>
                  ) : currentStep === STEP.MANUAL_CATEGORIZE ? (
                    <>
                      <GlassButton
                        onClick={resetAndClose}
                        disabled={isCategorizing}
                        variant="custom"
                        backgroundColor="rgba(255, 255, 255, 0.3)"
                        borderColor="rgba(255, 255, 255, 0.5)"
                        textColor="#374151"
                        size="md"
                      >
                        <X className="w-5 h-5" />
                        Cancel
                      </GlassButton>

                      <GlassButton
                        onClick={handleCategorizeSubmit}
                        disabled={isCategorizing || failedItems.some(item => !item.categoryId)}
                        variant="custom"
                        backgroundColor="rgba(59, 130, 246, 0.6)"
                        borderColor="rgba(59, 130, 246, 0.8)"
                        textColor="white"
                        size="md"
                      >
                        {isCategorizing ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Categorizing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            Continue to AI Analysis
                          </>
                        )}
                      </GlassButton>
                    </>
                  ) : (
                    <>
                      <GlassButton
                        onClick={handleSkipAnalysis}
                        disabled={isAnalyzing}
                        variant="custom"
                        backgroundColor="rgba(255, 255, 255, 0.3)"
                        borderColor="rgba(255, 255, 255, 0.5)"
                        textColor="#374151"
                        size="md"
                      >
                        Skip Analysis
                      </GlassButton>

                      <GlassButton
                        onClick={handleRunAnalysis}
                        disabled={isAnalyzing || selectedItemsForAnalysis.length === 0}
                        variant="custom"
                        backgroundColor="rgba(59, 130, 246, 0.6)"
                        borderColor="rgba(59, 130, 246, 0.8)"
                        textColor="white"
                        size="md"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Run AI Analysis ({selectedItemsForAnalysis.length})
                          </>
                        )}
                      </GlassButton>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
