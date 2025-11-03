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
import { wardrobeAPI } from "@/lib/api/wardrobe-api";
import {
  transformWizardDataToAPI,
  validateWizardFormData,
  getUserIdFromAuth,
} from "@/lib/utils/wizard-transform";
import { StepPhotoAI } from "./StepPhotoAI";
import { AnalysisOverlay } from "./AnalysisOverlay";
import { AnalyzingPanel } from "./AnalyzingPanel";
import { ItemFormContent } from "./ItemFormContent";
import ImageCropper from "./ImageCropper";
import type { WizardFormData, AISuggestions } from "./types";

interface AddItemWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Status flow
const STATUS = {
  IDLE: "idle",
  PREVIEW: "preview",
  CROPPING: "cropping",
  ANALYZING: "analyzing",
  FORM: "form",
  SAVED: "saved",
} as const;

type StatusType = (typeof STATUS)[keyof typeof STATUS];

// Initial form state
const INITIAL_FORM_DATA: WizardFormData = {
  uploadedImageURL: "",
  imageRemBgURL: "",
  name: "",
  categoryId: 0,
  categoryName: "",
  brand: "",
  notes: "",
  colors: [],
  seasons: [],
  pattern: "",
  fabric: "",
  condition: "New",
  tags: [],
  wornToday: false,
};

export function AddItemWizard({ open, onOpenChange }: AddItemWizardProps) {
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

  const { user } = useAuthStore();
  const { fetchItems } = useWardrobeStore();

  // Reset form to initial state
  const resetAndClose = useCallback(() => {
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
    onOpenChange(false);
  }, [onOpenChange, previewUrl]);

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

  // Helper: Parse color string to ColorOption array
  const parseColorString = (
    colorStr: string
  ): { name: string; hex: string }[] => {
    if (!colorStr) return [];

    // Simple color name to hex mapping
    const colorMap: Record<string, string> = {
      black: "#000000",
      white: "#FFFFFF",
      red: "#FF0000",
      blue: "#0000FF",
      green: "#00FF00",
      yellow: "#FFFF00",
      purple: "#800080",
      pink: "#FFC0CB",
      orange: "#FFA500",
      brown: "#A52A2A",
      gray: "#808080",
      grey: "#808080",
      navy: "#000080",
      beige: "#F5F5DC",
      // Vietnamese colors
      đen: "#000000",
      trắng: "#FFFFFF",
      đỏ: "#FF0000",
      xanh: "#0000FF",
      vàng: "#FFFF00",
      hồng: "#FFC0CB",
      cam: "#FFA500",
      nâu: "#A52A2A",
      xám: "#808080",
      tím: "#800080",
    };

    // Split by comma and map to ColorOption
    return colorStr.split(/[,;]/).map((c) => {
      const name = c.trim();
      const nameLower = name.toLowerCase();
      const hex = colorMap[nameLower] || "#808080"; // Default gray
      return { name, hex };
    });
  };

  // Handle analyze button
  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    setStatus(STATUS.ANALYZING);
    setAnalysisProgress(0);

    try {
      // Call AI analysis API
      const result = await wardrobeAPI.getImageSummary(selectedFile);

      console.log("🎯 AI Analysis Result:", result);

      // Update form data with AI suggestions
      setAiSuggestions(result);
      setFormData((prev) => ({
        ...prev,
        uploadedImageURL: previewUrl,
        imageRemBgURL: result.imageRemBgURL || previewUrl,
        // Color is now an object { name, hex }
        colors: result.color ? [result.color] : [],
        pattern: result.pattern,
        fabric: result.fabric,
        condition: result.condition,
        name: result.aiDescription || "",
        // Season is now an object { id, name }
        seasons: result.season ? [result.season.name] : [],
        notes: result.aiDescription || "",
      }));

      // Transition to form after a brief delay
      setTimeout(() => {
        setStatus(STATUS.FORM);
      }, 300);
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Failed to analyze image. Please try again.");
      setStatus(STATUS.PREVIEW);
    }
  }, [selectedFile, previewUrl]);

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

      console.log("📤 Submitting payload:", payload);

      const response = await wardrobeAPI.createItem(payload);

      console.log("✅ API Response:", response);

      // Show saved state
      setStatus(STATUS.SAVED);
      toast.success("Item added successfully!");

      // Refresh items in background
      fetchItems();

      // Auto-close after showing success
      setTimeout(() => {
        resetAndClose();
      }, 2000);
    } catch (error) {
      console.error("❌ API Error:", error);

      // Enhanced error message
      let errorMessage = "Cannot add item. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Check for specific error responses
      if (typeof error === "object" && error !== null) {
        const err = error as any;
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
      }

      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  }, [formData, user, fetchItems, resetAndClose]);

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
      <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent
          className="max-w-[95vw] sm:max-w-7xl p-0 gap-0 max-h-[95vh] flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-white/10"
          showCloseButton={false}
        >
          {/* Accessible title (hidden visually but available to screen readers) */}
          <DialogTitle className="sr-only">Add Item by Image</DialogTitle>

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
                    Add Item by Image
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-white/50"
                  >
                    AI-powered wardrobe analysis
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

              {/* ANALYZING State */}
              {status === STATUS.ANALYZING && (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid lg:grid-cols-2 gap-8 items-center"
                >
                  {/* Image with overlay */}
                  <div className="relative w-full max-w-xs mx-auto lg:mx-0">
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1.02 }}
                      className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                    >
                      <div className="aspect-square max-w-[280px] mx-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrl}
                          alt="Analyzing"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <AnalysisOverlay progress={analysisProgress} />
                    </motion.div>
                  </div>

                  {/* Progress panel */}
                  <AnalyzingPanel onProgressUpdate={setAnalysisProgress} />
                </motion.div>
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
