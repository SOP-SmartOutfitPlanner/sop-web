"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BasicInfoSection,
  CategorySection,
  ColorSection,
  PatternFabricSection,
  StyleOccasionSection,
  WeatherSeasonSection,
  NotesSection,
  ImagePreviewSection,
  FormActionsSection,
} from "./sections";
import { FORM_ANIMATIONS } from "./form-config";
import type { WizardFormData, AISuggestions } from "./types";

interface ItemFormContentProps {
  previewUrl: string;
  formData: WizardFormData;
  aiSuggestions: AISuggestions | null;
  onFormDataChange: (updates: Partial<WizardFormData>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  // API-fetched options for user selection
  availableCategories?: { id: number; name: string }[];
  availableStyles?: { id: number; name: string; description?: string }[];
  availableOccasions?: { id: number; name: string }[];
  availableSeasons?: { id: number; name: string }[];
}

export function ItemFormContent({
  previewUrl,
  formData,
  aiSuggestions,
  onFormDataChange,
  onSave,
  onCancel,
  isSaving = false,
  availableCategories = [],
  availableStyles = [],
  availableOccasions = [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  availableSeasons = [], // Reserved for future use
}: ItemFormContentProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Toggle season selection
  const toggleArrayItem = (field: "seasons" | "tags", value: string) => {
    const current = formData[field] || [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onFormDataChange({ [field]: updated });
  };

  // Toggle style ID selection
  const toggleStyleId = (styleId: number) => {
    const current = formData.styleIds || [];
    const updated = current.includes(styleId)
      ? current.filter((id) => id !== styleId)
      : [...current, styleId];
    onFormDataChange({ styleIds: updated });
  };

  // Toggle occasion ID selection
  const toggleOccasionId = (occasionId: number) => {
    const current = formData.occasionIds || [];
    const updated = current.includes(occasionId)
      ? current.filter((id) => id !== occasionId)
      : [...current, occasionId];
    onFormDataChange({ occasionIds: updated });
  };

  const validateAndSave = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.categoryId) {
      newErrors.category = "Category is required";
    }

    if (!formData.seasons || formData.seasons.length === 0) {
      newErrors.seasons = "Select at least one season";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave();
    }
  };

  return (
    <motion.div
      variants={FORM_ANIMATIONS.container}
      initial="hidden"
      animate="visible"
      className="w-full max-w-6xl mx-auto"
    >
      <div className="grid lg:grid-cols-[340px,1fr] gap-6">
        {/* Image Preview Section */}
        <ImagePreviewSection previewUrl={previewUrl} />

        {/* Form Fields */}
        <div className="order-1 lg:order-2 space-y-5">
          {/* Basic Details Card */}
          <motion.div variants={FORM_ANIMATIONS.item}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Item Details
                </h2>
                <p className="text-sm text-white/50 mb-6">
                  Review and edit the AI-detected information
                </p>

                <div className="space-y-5">
                  {/* Name Field */}
                  <BasicInfoSection
                    name={formData.name}
                    brand={formData.brand || ""}
                    errors={errors}
                    onNameChange={(value) => onFormDataChange({ name: value })}
                    onBrandChange={(value) =>
                      onFormDataChange({ brand: value })
                    }
                  />

                  {/* Category Selection */}
                  <CategorySection
                    categoryId={formData.categoryId}
                    categoryName={formData.categoryName}
                    availableCategories={availableCategories}
                    errors={errors}
                    aiSuggestions={aiSuggestions}
                    onCategoryChange={(categoryId, categoryName) =>
                      onFormDataChange({ categoryId, categoryName })
                    }
                  />

                  {/* Color Display */}
                  <ColorSection colors={formData.colors || []} />

                  {/* Pattern & Fabric */}
                  <PatternFabricSection
                    pattern={formData.pattern || ""}
                    fabric={formData.fabric || ""}
                    onPatternChange={(pattern) => onFormDataChange({ pattern })}
                    onFabricChange={(fabric) => onFormDataChange({ fabric })}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Styles & Occasions */}
          <StyleOccasionSection
            styleIds={formData.styleIds || []}
            occasionIds={formData.occasionIds || []}
            availableStyles={availableStyles}
            availableOccasions={availableOccasions}
            aiSuggestions={aiSuggestions}
            onToggleStyle={toggleStyleId}
            onToggleOccasion={toggleOccasionId}
          />

          {/* Weather, Season & Condition */}
          <WeatherSeasonSection
            seasons={formData.seasons || []}
            weatherSuitable={formData.weatherSuitable || ""}
            condition={formData.condition || "New"}
            errors={errors}
            onToggleSeason={(season) => toggleArrayItem("seasons", season)}
            onWeatherChange={(weather) =>
              onFormDataChange({ weatherSuitable: weather })
            }
            onConditionChange={(condition) => onFormDataChange({ condition })}
          />

          {/* Additional Info (Brand & Notes) */}
          {/* <NotesSection
            notes={formData.notes || ""}
            onNotesChange={(value) => onFormDataChange({ notes: value })}
          /> */}

          {/* Action Buttons */}
          <FormActionsSection
            isSaving={isSaving}
            onCancel={onCancel}
            onSave={validateAndSave}
          />
        </div>
      </div>
    </motion.div>
  );
}
