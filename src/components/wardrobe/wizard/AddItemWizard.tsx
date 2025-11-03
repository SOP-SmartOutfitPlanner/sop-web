"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import { Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { useWardrobeStore } from "@/store/wardrobe-store";
import { wardrobeAPI, type ApiWardrobeItem } from "@/lib/api/wardrobe-api";
import { useWardrobeOptions } from "@/hooks/useWardrobeOptions";
import {
  transformWizardDataToAPI,
  validateWizardFormData,
  getUserIdFromAuth,
  apiItemToFormData,
} from "@/lib/utils/wizard-transform";
import { StepPhotoAI } from "./StepPhotoAI";
import { ItemFormContent } from "./ItemFormContent";
import ImageCropper from "./ImageCropper";
import { AnalysisToast } from "./AnalysisToast";
import { STATUS, INITIAL_FORM_DATA, AI_ANALYSIS_CONFIG } from "./wizard-config";
import type { StatusType } from "./wizard-config";
import type { WizardFormData, AISuggestions } from "./types";

interface AddItemWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFile?: File; // Optional: pre-selected file from gallery
  autoAnalyze?: boolean; // Auto-trigger analysis when initialFile is provided (default: true)
  skipCrop?: boolean; // Skip cropping step (default: false)
  // Edit mode props
  editMode?: boolean; // Whether wizard is in edit mode
  editItemId?: number; // ID of item being edited
  editItem?: ApiWardrobeItem; // API item to edit (will be transformed to form data)
  // Callback when user wants to edit after auto-save
  onEditAfterSave?: (itemId: number) => void;
}

export function AddItemWizard({
  open,
  onOpenChange,
  initialFile,
  autoAnalyze = true,
  skipCrop = false,
  editMode = false,
  editItemId,
  editItem,
  onEditAfterSave,
}: AddItemWizardProps) {
  const [status, setStatus] = useState<StatusType>(STATUS.IDLE);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<WizardFormData>(INITIAL_FORM_DATA);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(
    null
  );
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [savedItemId, setSavedItemId] = useState<number | null>(null); // Store saved item ID for edit
  const [autoCloseTimeoutId, setAutoCloseTimeoutId] = useState<NodeJS.Timeout | null>(null); // Track auto-close timeout

  const { user } = useAuthStore();
  const { fetchItems } = useWardrobeStore();

  // Fetch available options from API
  const { categories, styles, seasons, occasions } = useWardrobeOptions();

  // Initialize form data in edit mode OR reset when switching modes
  useEffect(() => {
    if (editMode && editItem && open) {
      const transformedData = apiItemToFormData(editItem);
      const finalFormData = { ...INITIAL_FORM_DATA, ...transformedData };
      setFormData(finalFormData);
      setPreviewUrl(
        transformedData.imageRemBgURL || transformedData.uploadedImageURL || ""
      );
      setStatus(STATUS.FORM); // Go directly to form in edit mode
      setHasChanges(false);
    }
  }, [editMode, editItem, open]);

  // Reset when opening fresh (not from edit mode)
  useEffect(() => {
    if (open && !editMode && !editItem) {
      // Only reset if opening fresh in add mode
      setStatus(STATUS.IDLE);
      setFormData(INITIAL_FORM_DATA);
      setAiSuggestions(null);
      setSavedItemId(null);
      setSelectedFile(null);
      setPreviewUrl("");
      setAnalysisProgress(0);
    }
  }, [open, editMode, editItem]);

  // Auto-save after AI analysis
  const autoSaveAfterAnalysis = useCallback(
    async (data: WizardFormData) => {
      try {
        setIsSubmitting(true);

        const errors = validateWizardFormData(data);
        if (errors.length > 0) {
          // If validation fails, show form for manual edit
          setStatus(STATUS.FORM);
          setIsSubmitting(false);
          return;
        }

        const userId = await getUserIdFromAuth(user);
        const payload = transformWizardDataToAPI(data, userId);

        const response = await wardrobeAPI.createItem(payload);

        if (!response) {
          console.error("❌ API returned undefined response!");
          throw new Error("Failed to create item - no response from API");
        }

        // Store the created item ID (try different possible locations)
        let createdItemId: number | undefined;
        if (response?.id) {
          createdItemId = response.id;
          setSavedItemId(response.id);
        } else if (typeof response === 'object' && response !== null) {
          // Try to find id in response
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const anyResponse = response as any;
          createdItemId = anyResponse.id || anyResponse.itemId || anyResponse.data?.id;
          if (createdItemId) {
            setSavedItemId(createdItemId);
          }
        }

        // Set to SAVED to hide AnalysisToast
        setStatus(STATUS.SAVED);

        // Close modal immediately after save
        onOpenChange(false);

        // Refresh items in background
        fetchItems();

        // Show toast with edit button
        toast.success(
          '✅ Item added successfully! Click "Edit Details" to customize.',
          {
            duration: 6000,
            position: "bottom-right",
            action: {
              label: "Edit Details",
              onClick: () => {
                // Notify parent to open edit mode
                if (createdItemId && onEditAfterSave) {
                  onEditAfterSave(createdItemId);
                } else {
                  console.warn("❌ Cannot edit: no itemId or callback missing");
                }
              },
            },
          }
        );
      } catch (error) {
        console.error("❌ Auto-save failed:", error);

        // Show form for manual save if auto-save fails
        setStatus(STATUS.FORM);
        toast.error("Auto-save failed. Please review and save manually.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, fetchItems, onOpenChange, onEditAfterSave]
  );

  // AI Analysis with retry logic
  const analyzeImage = useCallback(
    async (file: File, url: string, attempt = 1) => {
      try {
        setRetryCount(attempt - 1);
        const result = await wardrobeAPI.getImageSummary(file);

        setAiSuggestions(result);

        const newFormData = {
          uploadedImageURL: url,
          imageRemBgURL: result.imageRemBgURL || url,
          name: result.name || result.aiDescription || "",
          colors: result.colors || [],
          pattern: result.pattern || "",
          fabric: result.fabric || "",
          condition: result.condition || "New",
          weatherSuitable: result.weatherSuitable || "",
          notes: result.aiDescription || "",
          categoryId: result.category?.id || 0,
          categoryName: result.category?.name || "",
          brand: "default", // AI doesn't detect brand
          seasons:
            result.seasons?.map((s: { id: number; name: string }) => s.name) ||
            [],
          styleIds:
            result.styles?.map(
              (style: { id: number; name: string }) => style.id
            ) || [],
          occasionIds:
            result.occasions?.map(
              (occ: { id: number; name: string }) => occ.id
            ) || [],
          tags: [],
          wornToday: false,
        };

        setFormData(newFormData);

        // ✅ Update preview to show removed background image
        if (result.imageRemBgURL) {
          setPreviewUrl(result.imageRemBgURL);
        }

        setRetryCount(0);
        setIsRetrying(false);
        setAnalysisProgress(100); // Set to 100% when complete

        // 🎯 Auto-save after analysis completes
        setTimeout(async () => {
          await autoSaveAfterAnalysis(newFormData);
        }, 500);
      } catch (error) {
        console.error(
          `Analysis failed (attempt ${attempt}/${AI_ANALYSIS_CONFIG.MAX_RETRIES}):`,
          error
        );

        if (attempt < AI_ANALYSIS_CONFIG.MAX_RETRIES) {
          setIsRetrying(true);
          // toast.error(
          //   `Analysis failed. Retrying in 30s... (${attempt}/${AI_ANALYSIS_CONFIG.MAX_RETRIES})`
          // );

          setTimeout(() => {
            analyzeImage(file, url, attempt + 1);
          }, AI_ANALYSIS_CONFIG.RETRY_DELAY);
        } else {
          setIsRetrying(false);
          toast.error(
            "Failed to analyze image after 5 attempts. Please try again."
          );
          setStatus(STATUS.PREVIEW);
        }
      }
    },
    [autoSaveAfterAnalysis]
  );

  // Handle initialFile from GalleryPickerFlow
  useEffect(() => {
    if (initialFile && open) {
      setSelectedFile(initialFile);
      const url = URL.createObjectURL(initialFile);
      setPreviewUrl(url);
      setHasChanges(true);

      // Auto-analyze or show preview based on settings
      if (autoAnalyze && skipCrop) {
        // Skip crop and go directly to analyzing
        setStatus(STATUS.ANALYZING);
        setAnalysisProgress(0);

        // Trigger analysis with retry logic
        setTimeout(() => {
          analyzeImage(initialFile, url);
        }, 500);
      } else if (skipCrop) {
        // Skip crop, show preview with analyze button
        setStatus(STATUS.PREVIEW);
      } else {
        // Show cropper
        setStatus(STATUS.CROPPING);
      }
    }
  }, [initialFile, open, autoAnalyze, skipCrop, analyzeImage]);

  // Reset form to initial state
  const resetAndClose = useCallback(() => {
    // Clear auto-close timeout if exists
    if (autoCloseTimeoutId) {
      clearTimeout(autoCloseTimeoutId);
      setAutoCloseTimeoutId(null);
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setStatus(STATUS.IDLE);
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData(INITIAL_FORM_DATA);
    setAiSuggestions(null);
    setHasChanges(false);
    setShowConfirmClose(false);
    setIsSubmitting(false);
    setAnalysisProgress(0);
    setSavedItemId(null); // Clear saved item ID
    onOpenChange(false);
  }, [onOpenChange, previewUrl, autoCloseTimeoutId]);

  // Clear selected file
  const handleClearFile = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    setStatus(STATUS.IDLE);
    setAiSuggestions(null);
    setAnalysisProgress(0);
  }, [previewUrl]);

  // Handle file selection - go to cropping
  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStatus(STATUS.CROPPING); // Changed from PREVIEW to CROPPING
    setHasChanges(true);
  }, []);

  // Handle crop complete
  const handleCropComplete = useCallback(
    (croppedFile: File) => {
      // Replace the selected file with cropped version
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(croppedFile);
      const newUrl = URL.createObjectURL(croppedFile);
      setPreviewUrl(newUrl);
      setStatus(STATUS.PREVIEW);
    },
    [previewUrl]
  );

  // Handle crop cancel - go back to idle
  const handleCropCancel = useCallback(() => {
    handleClearFile();
  }, [handleClearFile]);

  // Handle dialog close with unsaved changes confirmation
  const handleClose = useCallback(() => {
    if (hasChanges && status !== STATUS.SAVED) {
      setShowConfirmClose(true);
    } else {
      resetAndClose();
    }
  }, [hasChanges, status, resetAndClose]);

  // Handle analyze button
  const handleAnalyze = useCallback(async () => {
    if (!selectedFile || !previewUrl) return;

    setStatus(STATUS.ANALYZING);
    setAnalysisProgress(0);

    // Use retry logic
    analyzeImage(selectedFile, previewUrl);
  }, [selectedFile, previewUrl, analyzeImage]);

  // Submit form to API
  const handleSave = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const errors = validateWizardFormData(formData);
      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error));
        setIsSubmitting(false);
        return;
      }

      const userId = await getUserIdFromAuth(user);
      const payload = transformWizardDataToAPI(formData, userId);

      // Edit mode: update existing item
      if (editMode && editItemId) {
        await wardrobeAPI.updateItem(editItemId, payload);
        toast.success("Item updated successfully!");
      } else {
        // Create mode: add new item
        await wardrobeAPI.createItem(payload);
        toast.success("Item added successfully!");
      }

      // Show saved state
      setStatus(STATUS.SAVED);

      // Refresh items in background
      fetchItems();

      // Auto-close after showing success
      setTimeout(() => {
        resetAndClose();
      }, 2000);
    } catch (error) {
      console.error("❌ API Error:", error);

      // Enhanced error message
      let errorMessage = editMode
        ? "Cannot update item. Please try again."
        : "Cannot add item. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Check for specific error responses
      if (typeof error === "object" && error !== null) {
        const err = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
      }

      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  }, [formData, user, fetchItems, resetAndClose, editMode, editItemId]);

  // Update form data
  const updateFormData = useCallback((updates: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  }, []);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (status === STATUS.IDLE || !hasChanges) {
      resetAndClose();
    } else {
      setShowConfirmClose(true);
    }
  }, [status, hasChanges, resetAndClose]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose]);

  // Cleanup auto-close timeout on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimeoutId) {
        clearTimeout(autoCloseTimeoutId);
      }
    };
  }, [autoCloseTimeoutId]);

  // Simulate progress when analyzing
  useEffect(() => {
    if (status !== STATUS.ANALYZING) {
      setAnalysisProgress(0);
      return;
    }

    // Simulate smooth progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 95) {
        currentProgress = 95; // Stop at 95% until real completion
        clearInterval(interval);
      }
      setAnalysisProgress(currentProgress);
    }, 500);

    return () => clearInterval(interval);
  }, [status]);

  return (
    <>
      {/* Global Analyzing Toast - renders outside modal */}
      <AnalysisToast
        isVisible={status === STATUS.ANALYZING}
        progress={analysisProgress}
        retryCount={retryCount}
        isRetrying={isRetrying}
      />

      <Dialog
        open={open && status !== STATUS.ANALYZING}
        onOpenChange={(open) => !open && handleClose()}
      >
        <DialogContent
          className="max-w-[95vw] sm:max-w-xl p-0 gap-0 max-h-[95vh] flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-white/10"
          showCloseButton={false}
        >
          {/* Accessible title (hidden visually but available to screen readers) */}
          <DialogTitle className="sr-only">
            {editMode ? "Edit Item" : "Add Item by Image"}
          </DialogTitle>

          {/* Background gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(147,51,234,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.3))]" />

          {/* Header */}
          <div className="relative border-b border-white/10 bg-gradient-to-r from-black/40 via-black/30 to-black/40 backdrop-blur-xl px-6 sm:px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/30 ring-1 ring-blue-400/40 shadow-lg"
                >
                  <Sparkles className="w-5 h-5 text-blue-300" />
                </motion.div>
                <div>
                  <motion.h2
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl sm:text-2xl font-bold text-white"
                  >
                    {editMode ? "Edit Item" : "Add Item by Image"}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-white/50"
                  >
                    {editMode
                      ? "Update item details"
                      : "AI-powered wardrobe analysis"}
                  </motion.p>
                </div>
              </div>

              {/* Close button */}
              <motion.button
                onClick={handleClose}
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "rgba(255,255,255,0.15)",
                }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-white/90" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="relative px-6 sm:px-8 py-8 max-h-[calc(95vh-6rem)] overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              {/* IDLE & PREVIEW State */}
              {(status === STATUS.IDLE || status === STATUS.PREVIEW) && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <StepPhotoAI
                    formData={formData}
                    updateFormData={updateFormData}
                    aiSuggestions={aiSuggestions}
                    setAiSuggestions={setAiSuggestions}
                    onFileSelect={handleFileSelect}
                    onClearFile={handleClearFile}
                    selectedFile={selectedFile}
                    previewUrl={previewUrl}
                  />

                  {status === STATUS.PREVIEW && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex justify-center gap-3"
                    >
                      <motion.button
                        onClick={handleCancel}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={handleAnalyze}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-400 hover:to-blue-500 text-white font-semibold shadow-2xl shadow-blue-500/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 flex items-center gap-2"
                      >
                        <Sparkles className="w-5 h-5" />
                        Upload & Analyze
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* CROPPING State */}
              {status === STATUS.CROPPING && (
                <ImageCropper
                  imageUrl={previewUrl}
                  onCropComplete={handleCropComplete}
                  onCancel={handleCropCancel}
                />
              )}

              {/* FORM State */}
              {status === STATUS.FORM && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <ItemFormContent
                    previewUrl={previewUrl}
                    formData={formData}
                    aiSuggestions={aiSuggestions}
                    onFormDataChange={updateFormData}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isSaving={isSubmitting}
                    availableCategories={categories}
                    availableStyles={styles}
                    availableOccasions={occasions}
                    availableSeasons={seasons}
                  />
                </motion.div>
              )}

              {/* SAVED State */}
              {status === STATUS.SAVED && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-[400px] text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6 shadow-2xl shadow-green-500/30"
                  >
                    <motion.svg
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        delay: 0.4,
                        duration: 0.5,
                        ease: "easeInOut",
                      }}
                      className="w-10 h-10 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <motion.path d="M20 6L9 17l-5-5" />
                    </motion.svg>
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Item Saved!
                  </h2>
                  <p className="text-white/60">Added to your wardrobe</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Close Dialog */}
      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue editing</AlertDialogCancel>
            <AlertDialogAction onClick={resetAndClose}>
              Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
