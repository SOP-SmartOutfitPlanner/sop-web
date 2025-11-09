/**
 * WizardStepRenderer Component
 * Renders the appropriate step content based on wizard status
 */

import { StepPhotoAI } from "./StepPhotoAI";
import { ItemFormContent } from "./ItemFormContent";
import ImageCropper from "./ImageCropper";
import { StatusType } from "./wizard-config";
import type { WizardFormData, AISuggestions } from "./types";

interface WizardStepRendererProps {
  status: StatusType;
  // Photo step props
  previewUrl: string;
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onClearFile: () => void;
  // Form data for all steps
  formData: WizardFormData;
  aiSuggestions: AISuggestions | null;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  setAiSuggestions: (suggestions: AISuggestions | null) => void;
  // Crop step props
  onCropComplete: (croppedFile: File) => void;
  onSkipCrop: () => void;
  // Form step props
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  // API-fetched options
  availableCategories: { id: number; name: string }[];
  availableStyles: { id: number; name: string; description?: string }[];
  availableOccasions: { id: number; name: string }[];
  availableSeasons: { id: number; name: string }[];
}

export function WizardStepRenderer({
  status,
  // Photo step
  previewUrl,
  onFileSelect,
  onClearFile,
  // Form data
  formData,
  aiSuggestions,
  updateFormData,
  // Crop step
  onCropComplete,
  onSkipCrop,
  // Form step
  onSave,
  onCancel,
  isSaving,
  // API options
  availableCategories,
  availableStyles,
  availableOccasions,
  availableSeasons,
}: WizardStepRendererProps) {
  // Photo Upload Step
  if (status === "idle" || status === "preview") {
    return (
      <StepPhotoAI
        onFilesSelect={(files) => {
          if (files.length > 0) {
            onFileSelect(files[0]);
          }
        }}
        onClearFiles={onClearFile}
      />
    );
  }

  // Crop Step
  if (status === "cropping" && previewUrl) {
    return (
      <ImageCropper
        imageUrl={previewUrl}
        onCropComplete={onCropComplete}
        onCancel={onSkipCrop}
      />
    );
  }

  // Form Step
  if (status === "form") {
    return (
      <ItemFormContent
        previewUrl={previewUrl}
        formData={formData}
        aiSuggestions={aiSuggestions}
        onFormDataChange={updateFormData}
        onSave={onSave}
        onCancel={onCancel}
        isSaving={isSaving}
        availableCategories={availableCategories}
        availableStyles={availableStyles}
        availableOccasions={availableOccasions}
        availableSeasons={availableSeasons}
      />
    );
  }

  // Analyzing or Saved states don't render content in modal
  // (analyzing shows toast, saved closes modal)
  return null;
}
