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
import { useUploadStore } from "@/store/upload-store";
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
}: AddItemWizardProps) {
  const [status, setStatus] = useState<StatusType>(STATUS.IDLE);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<WizardFormData>(INITIAL_FORM_DATA);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadTaskId, setUploadTaskId] = useState<string | null>(null);

  const { user } = useAuthStore();
  const { fetchItems } = useWardrobeStore();
  const { addTask, updateTask, removeTask } = useUploadStore();

  // Fetch available options from API
  const { categories, styles, seasons, occasions } = useWardrobeOptions();

  // Debug: Log status changes
  useEffect(() => {
    console.log("🔄 [STATUS] Status changed:", status, {
      timestamp: new Date().toISOString(),
      open,
      hasChanges,
      isSubmitting,
      uploadTaskId
    });
  }, [status, open, hasChanges, isSubmitting, uploadTaskId]);

  // Initialize form data in edit mode OR reset when switching modes
  useEffect(() => {
    if (editMode && editItem && open && status === STATUS.IDLE) {
      const transformedData = apiItemToFormData(editItem);
      const finalFormData = { ...INITIAL_FORM_DATA, ...transformedData };
      setFormData(finalFormData);
      setPreviewUrl(
        transformedData.imageRemBgURL || transformedData.uploadedImageURL || ""
      );
      setStatus(STATUS.FORM); // Go directly to form in edit mode
      setHasChanges(false);
    }
  }, [editMode, editItem, open, status]);

  // Reset when opening fresh (not from edit mode)
  useEffect(() => {
    if (open && !editMode && !editItem && status === STATUS.IDLE) {
      // Only reset if opening fresh in add mode
      setStatus(STATUS.IDLE);
      setFormData(INITIAL_FORM_DATA);
      setAiSuggestions(null);
      setSelectedFile(null);
      setPreviewUrl("");
    }
  }, [open, editMode, editItem, status]);

  // Reset form to initial state
  const resetAndClose = useCallback(() => {
    console.log("🚪 [CLOSE] resetAndClose() called");
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      console.log("🧹 [CLOSE] Preview URL revoked");
    }
    
    setStatus(STATUS.IDLE);
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData(INITIAL_FORM_DATA);
    setAiSuggestions(null);
    setHasChanges(false);
    setShowConfirmClose(false);
    setIsSubmitting(false);
    
    console.log("🚪 [CLOSE] Calling onOpenChange(false)");
    onOpenChange(false);
    console.log("✅ [CLOSE] Modal closed successfully");
  }, [onOpenChange, previewUrl]);

  // Auto-save after AI analysis
  const autoSaveAfterAnalysis = useCallback(
    async (data: WizardFormData, taskId?: string | null) => {
      try {
        console.log("💾 [SAVE] Step 5: Validating form data...", { taskId });
        setIsSubmitting(true);

        const errors = validateWizardFormData(data);
        if (errors.length > 0) {
          console.warn("⚠️ [SAVE] Validation failed:", errors);
          // If validation fails, show form for manual edit
          setStatus(STATUS.FORM);
          setIsSubmitting(false);
          return;
        }

        console.log("✅ [SAVE] Validation passed");

        const userId = await getUserIdFromAuth(user);
        const payload = transformWizardDataToAPI(data, userId);

        console.log("📤 [SAVE] Step 6: Sending to API...", { payload });

        // Update task: saving
        if (taskId) {
          updateTask(taskId, {
            progress: 90,
            status: "uploading",
          });
          console.log("📊 [SAVE] Progress: 90% - Saving to database");
        }

        const response = await wardrobeAPI.createItem(payload);

        if (!response) {
          console.error("❌ [SAVE] API returned undefined response!");
          throw new Error("Failed to create item - no response from API");
        }

        // Store the created item ID
        const createdItemId = response?.id;
        console.log("✅ [SAVE] Step 7: Item created successfully!", { 
          createdItemId, 
          response,
          taskId // Debug: check if taskId exists
        });

        // Update task: success IMMEDIATELY
        if (taskId) {
          console.log("🔄 [SAVE] Updating upload task to success...", { taskId });
          updateTask(taskId, {
            progress: 100,
            status: "success",
            createdItemId: createdItemId,
          });
          console.log("📊 [SAVE] Progress: 100% - Upload complete!");
          console.log("🎉 [SUCCESS] Upload task marked as success");
        } else {
          console.error("❌ [ERROR] taskId is null! Cannot update task to success");
        }

        // Set to SAVED to hide modal
        console.log("🔄 [MODAL] Setting status to SAVED - Modal will close");
        setStatus(STATUS.SAVED);
        setHasChanges(false);

        // Refresh items in background
        console.log("🔄 [REFRESH] Fetching updated items...");
        await fetchItems();
        console.log("✅ [REFRESH] Items refreshed");

        // Don't show manual toast - GlobalUploadToast will handle it
        console.log("💬 [TOAST] GlobalUploadToast will show success message");

        // Close modal immediately after setting status
        console.log("🚪 [MODAL] Closing modal immediately...");
        setTimeout(() => {
          console.log("🚪 [MODAL] Calling resetAndClose()");
          resetAndClose();
        }, 500); // Reduced from 1500ms to 500ms
      } catch (error) {
        console.error("❌ [ERROR] Auto-save failed:", error);

        // Update task: error
        if (taskId) {
          updateTask(taskId, {
            status: "error",
            errorMessage: "Failed to save item",
          });
          
          // Auto-remove error task after 5 seconds
          setTimeout(() => {
            removeTask(taskId);
          }, 5000);
        }

        // Show form for manual save if auto-save fails
        setStatus(STATUS.FORM);
        toast.error("Auto-save failed. Please review and save manually.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, fetchItems, resetAndClose, updateTask, removeTask]
  );

  // AI Analysis with retry logic
  const analyzeImage = useCallback(
    async (file: File, url: string, attempt = 1) => {
      let currentTaskId = uploadTaskId; // Use existing taskId or create new one
      
      try {
        console.log("🚀 [UPLOAD] Step 1: Starting analysis", { 
          fileName: file.name, 
          attempt,
          timestamp: new Date().toISOString(),
          currentTaskId
        });

        // Create upload task on first attempt
        if (attempt === 1) {
          const taskId = addTask({
            fileName: file.name,
            progress: 10,
            status: "analyzing",
            retryCount: 0,
            isRetrying: false,
          });
          currentTaskId = taskId; // Update currentTaskId
          setUploadTaskId(taskId);
          console.log("✅ [UPLOAD] Upload task created", { taskId });
        }

        console.log("📊 [ANALYSIS] Step 2: Sending to AI API...");

        // Update progress: start analysis
        if (currentTaskId) {
          updateTask(currentTaskId, {
            progress: 20,
            status: "analyzing",
            retryCount: attempt - 1,
            isRetrying: attempt > 1,
          });
          console.log("📊 [ANALYSIS] Progress: 20% - Analysis started");
        }

        const result = await wardrobeAPI.getImageSummary(file);
        console.log("✅ [ANALYSIS] Step 3: AI Analysis complete!", { result });

        // Update progress: analysis complete
        if (currentTaskId) {
          updateTask(currentTaskId, {
            progress: 60,
            status: "analyzing",
          });
          console.log("📊 [ANALYSIS] Progress: 60% - Analysis processed");
        }

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
        console.log("📝 [FORM] Form data prepared", { newFormData });

        // ✅ Update preview to show removed background image
        if (result.imageRemBgURL) {
          setPreviewUrl(result.imageRemBgURL);
        }

        // Update progress: preparing to save
        if (currentTaskId) {
          updateTask(currentTaskId, {
            progress: 80,
            status: "uploading",
          });
          console.log("📊 [SAVE] Progress: 80% - Preparing to save");
        }

        // 🎯 Auto-save after analysis completes
        console.log("💾 [SAVE] Step 4: Starting auto-save...");
        setTimeout(async () => {
          await autoSaveAfterAnalysis(newFormData, currentTaskId);
        }, 500);
      } catch (error) {
        console.error(
          `❌ [ERROR] Analysis failed (attempt ${attempt}/${AI_ANALYSIS_CONFIG.MAX_RETRIES}):`,
          error
        );

        if (attempt < AI_ANALYSIS_CONFIG.MAX_RETRIES) {
          console.log(`🔄 [RETRY] Retrying... (attempt ${attempt + 1})`);
          // Update task for retry
          if (currentTaskId) {
            updateTask(currentTaskId, {
              progress: 10,
              status: "analyzing",
              retryCount: attempt,
              isRetrying: true,
            });
          }

          setTimeout(() => {
            analyzeImage(file, url, attempt + 1);
          }, AI_ANALYSIS_CONFIG.RETRY_DELAY);
        } else {
          console.error("❌ [ERROR] Max retries reached. Giving up.");
          // Mark task as error
          if (currentTaskId) {
            updateTask(currentTaskId, {
              status: "error",
              errorMessage: "Failed to analyze image after 5 attempts",
            });
            
            // Auto-remove error task after 5 seconds
            setTimeout(() => {
              if (currentTaskId) {
                removeTask(currentTaskId);
              }
            }, 5000);
          }

          toast.error(
            "Failed to analyze image after 5 attempts. Please try again."
          );
          setStatus(STATUS.PREVIEW);
        }
      }
    },
    [autoSaveAfterAnalysis, addTask, updateTask, removeTask, uploadTaskId]
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

  // Clear selected file
  const handleClearFile = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    setStatus(STATUS.IDLE);
    setAiSuggestions(null);
  }, [previewUrl]);

  // Handle file selection - go to cropping
  const handleFileSelect = useCallback((file: File) => {
    console.log("📁 [FILE] File selected", { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type 
    });
    
    // Revoke old URL to prevent memory leak
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStatus(STATUS.CROPPING); // Changed from PREVIEW to CROPPING
    setHasChanges(true);
    
    console.log("✅ [FILE] Status changed to CROPPING");
  }, [previewUrl]);

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
    // If just saved, close immediately without confirmation
    if (status === STATUS.SAVED) {
      resetAndClose();
      return;
    }
    
    if (hasChanges) {
      setShowConfirmClose(true);
    } else {
      resetAndClose();
    }
  }, [hasChanges, status, resetAndClose]);

  // Handle analyze button
  const handleAnalyze = useCallback(async () => {
    if (!selectedFile || !previewUrl) {
      console.warn("⚠️ [ANALYZE] No file selected");
      return;
    }

    console.log("🔍 [ANALYZE] User clicked analyze button", {
      fileName: selectedFile.name,
      hasPreview: !!previewUrl
    });
    
    setStatus(STATUS.ANALYZING);
    console.log("✅ [ANALYZE] Status changed to ANALYZING - Modal will hide");

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

  return (
    <>
      <Dialog
        open={open && status !== STATUS.ANALYZING && status !== STATUS.SAVED}
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
