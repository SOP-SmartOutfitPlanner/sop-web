"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BasicInfoSection,
  CategorySection,
  EditableColorSection,
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
      {/* Image Preview at Top */}
      <div className="mb-6">
        <ImagePreviewSection previewUrl={previewUrl} />
      </div>

      {/* Form Fields in 2x2 Grid */}
      <div className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Card 1: Basic Info */}
          <motion.div variants={FORM_ANIMATIONS.item}>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl" />
              <div className="relative">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <BasicInfoSection
                    name={formData.name}
                    brand={formData.brand || ""}
                    errors={errors}
                    onNameChange={(value) => onFormDataChange({ name: value })}
                    onBrandChange={(value) => onFormDataChange({ brand: value })}
                  />
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
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Colors & Materials */}
          <motion.div variants={FORM_ANIMATIONS.item}>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full blur-3xl" />
              <div className="relative">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Colors & Materials</h3>
                <div className="space-y-4">
                  <EditableColorSection 
                    colors={formData.colors || []}
                    onColorsChange={(colors) => onFormDataChange({ colors })}
                  />
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

          {/* Card 3: Style & Occasions */}
          <motion.div variants={FORM_ANIMATIONS.item}>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/50 rounded-full blur-3xl" />
              <div className="relative">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Style & Occasions</h3>
                <StyleOccasionSection
                  styleIds={formData.styleIds || []}
                  occasionIds={formData.occasionIds || []}
                  availableStyles={availableStyles}
                  availableOccasions={availableOccasions}
                  aiSuggestions={aiSuggestions}
                  onToggleStyle={toggleStyleId}
                  onToggleOccasion={toggleOccasionId}
                />
              </div>
            </div>
          </motion.div>

          {/* Card 4: Weather & Season */}
          <motion.div variants={FORM_ANIMATIONS.item}>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 rounded-full blur-3xl" />
              <div className="relative">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Weather & Season</h3>
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
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <FormActionsSection
          isSaving={isSaving}
          onCancel={onCancel}
          onSave={validateAndSave}
        />
      </div>
    </motion.div>
  );
}
