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
      className="w-full h-full"
    >
      {/* Main Layout: Image Left, Details Right */}
      <div className="grid lg:grid-cols-[400px,1fr] gap-6 h-full">
        {/* Left: Image Preview */}
        <motion.div
          variants={FORM_ANIMATIONS.item}
          className="relative"
        >
          <ImagePreviewSection previewUrl={previewUrl} />
          
          {/* AI Analyzed Badge */}
          {aiSuggestions && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Analyzed
            </div>
          )}
        </motion.div>

        {/* Right: Details in 2x2 Grid */}
        <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Card 1: Basic Info */}
            <motion.div variants={FORM_ANIMATIONS.item}>
              <div className="bg-gradient-to-br from-white to-blue-50/30 border border-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/40 rounded-full blur-2xl" />
                <div className="relative">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                    Basic Information
                  </h3>
                  <div className="space-y-3">
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
              <div className="bg-gradient-to-br from-white to-purple-50/30 border border-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100/40 rounded-full blur-2xl" />
                <div className="relative">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    Colors & Materials
                  </h3>
                  <div className="space-y-3">
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
              <div className="bg-gradient-to-br from-white to-green-50/30 border border-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-100/40 rounded-full blur-2xl" />
                <div className="relative">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Style & Occasions
                  </h3>
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
              <div className="bg-gradient-to-br from-white to-amber-50/30 border border-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/40 rounded-full blur-2xl" />
                <div className="relative">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Weather & Season
                  </h3>
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
      </div>
    </motion.div>
  );
}
