"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Save, X, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WizardFormData, AISuggestions } from "./types";

const CATEGORIES = [
  { id: 1, name: "Top" },
  { id: 2, name: "Bottom" },
  { id: 3, name: "Shoes" },
  { id: 4, name: "Outerwear" },
  { id: 5, name: "Accessory" },
];

const SEASONS = ["Spring", "Summer", "Fall", "Winter"];
const CONDITIONS = ["New", "Like New", "Good", "Fair"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

interface ItemFormContentProps {
  previewUrl: string;
  formData: WizardFormData;
  aiSuggestions: AISuggestions | null;
  onFormDataChange: (updates: Partial<WizardFormData>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function ItemFormContent({
  previewUrl,
  formData,
  aiSuggestions: _aiSuggestions,
  onFormDataChange,
  onSave,
  onCancel,
  isSaving = false,
}: ItemFormContentProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [favorite, setFavorite] = useState(false);

  const toggleArrayItem = (field: "seasons" | "tags", value: string) => {
    const current = formData[field] || [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onFormDataChange({ [field]: updated });
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-6xl mx-auto"
    >
      <div className="grid lg:grid-cols-[340px,1fr] gap-6">
        {/* Image Preview */}
        <motion.div variants={itemVariants} className="order-2 lg:order-1">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden group sticky top-4">
            <div className="aspect-square relative max-w-[340px] mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Item preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Favorite button */}
              <motion.button
                type="button"
                onClick={() => setFavorite(!favorite)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 p-3 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 shadow-lg"
                aria-label="Toggle favorite"
              >
                <Heart
                  className={`w-5 h-5 transition-all duration-300 ${
                    favorite
                      ? "fill-red-500 text-red-500 scale-110"
                      : "text-white"
                  }`}
                />
              </motion.button>

              {/* AI Badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs text-white/90 font-medium">
                  AI Analyzed
                </span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-t from-black/20 to-transparent">
              <p className="text-sm text-white/60 text-center">
                Review and edit details
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form Fields */}
        <div className="order-1 lg:order-2 space-y-5">
          {/* Basic Details */}
          <motion.div variants={itemVariants}>
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
                  {/* Name */}
                  <div>
                    <Label
                      htmlFor="name"
                      className="text-sm font-semibold text-white/90 mb-2"
                    >
                      Item Name *
                    </Label>
                    <Input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        onFormDataChange({ name: e.target.value })
                      }
                      className={`w-full px-4 py-3 bg-white/10 border ${
                        errors.name
                          ? "border-red-500/50 bg-red-500/5"
                          : "border-white/20 hover:border-white/30"
                      } rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/70 focus:border-transparent focus:bg-white/15 transition-all`}
                      placeholder="e.g., Blue Denim Jacket"
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-xs text-red-400 font-medium">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <Label className="text-sm font-semibold text-white/90 mb-2">
                      Category *
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {CATEGORIES.map((cat) => (
                        <motion.button
                          key={cat.id}
                          type="button"
                          onClick={() =>
                            onFormDataChange({
                              categoryId: cat.id,
                              categoryName: cat.name,
                            })
                          }
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`px-4 py-3 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 ${
                            formData.categoryId === cat.id
                              ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 border border-blue-400/50"
                              : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20"
                          }`}
                          aria-pressed={formData.categoryId === cat.id}
                        >
                          {cat.name}
                        </motion.button>
                      ))}
                    </div>
                    {errors.category && (
                      <p className="mt-1.5 text-xs text-red-400 font-medium">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* Color Display */}
                  {formData.colors && formData.colors.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold text-white/90 mb-3">
                        Detected Color
                      </Label>
                      <div className="flex gap-3 flex-wrap">
                        {formData.colors.map((color, index) => (
                          <motion.div
                            key={index}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              delay: index * 0.1,
                              type: "spring",
                            }}
                            whileHover={{ scale: 1.1, y: -2 }}
                            className="relative group"
                          >
                            <div
                              className="w-14 h-14 rounded-xl border-2 border-white/30 shadow-lg transition-all group-hover:shadow-xl group-hover:border-white/50 cursor-pointer"
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                            />
                            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] text-white/60 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {color.name}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Seasons & Condition */}
          <motion.div variants={itemVariants}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4">
                Season & Condition
              </h3>

              <div className="space-y-5">
                {/* Seasons */}
                <div>
                  <Label className="text-sm font-semibold text-white/90 mb-2">
                    Seasons *
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {SEASONS.map((season) => (
                      <motion.button
                        key={season}
                        type="button"
                        onClick={() => toggleArrayItem("seasons", season)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 ${
                          formData.seasons?.includes(season)
                            ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 border border-blue-400/50"
                            : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20"
                        }`}
                        aria-pressed={formData.seasons?.includes(season)}
                      >
                        {season}
                      </motion.button>
                    ))}
                  </div>
                  {errors.seasons && (
                    <p className="mt-1.5 text-xs text-red-400 font-medium">
                      {errors.seasons}
                    </p>
                  )}
                </div>

                {/* Condition */}
                <div>
                  <Label
                    htmlFor="condition"
                    className="text-sm font-semibold text-white/90 mb-2"
                  >
                    Condition
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CONDITIONS.map((cond) => (
                      <motion.button
                        key={cond}
                        type="button"
                        onClick={() =>
                          onFormDataChange({ condition: cond })
                        }
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.condition === cond
                            ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 border border-blue-400/50"
                            : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20"
                        }`}
                      >
                        {cond}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div variants={itemVariants}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4">
                Additional Info
              </h3>

              <div className="space-y-4">
                {/* Brand */}
                <div>
                  <Label
                    htmlFor="brand"
                    className="text-sm font-semibold text-white/90 mb-2"
                  >
                    Brand (optional)
                  </Label>
                  <Input
                    type="text"
                    id="brand"
                    value={formData.brand || ""}
                    onChange={(e) =>
                      onFormDataChange({ brand: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/70 focus:border-transparent transition-all"
                    placeholder="e.g., Nike, Zara"
                  />
                </div>

                {/* Tags */}
                <div>
                  <Label className="text-sm font-semibold text-white/90 mb-2">
                    Tags (optional)
                  </Label>
                  <p className="text-xs text-white/50 mb-2">
                    Add tags to organize your items
                  </p>
                  <Input
                    type="text"
                    value={formData.tags?.join(", ") || ""}
                    onChange={(e) => {
                      const tags = e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter((t) => t.length > 0);
                      onFormDataChange({ tags });
                    }}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/70 focus:border-transparent transition-all"
                    placeholder="e.g., casual, work, favorite"
                  />
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-xs bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <Label
                    htmlFor="notes"
                    className="text-sm font-semibold text-white/90 mb-2"
                  >
                    Notes (optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ""}
                    onChange={(e) =>
                      onFormDataChange({ notes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/70 focus:border-transparent focus:bg-white/15 transition-all resize-none"
                    placeholder="Add any additional notes about this item..."
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex gap-3 pt-2">
            <motion.button
              type="button"
              onClick={onCancel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </motion.button>
            <motion.button
              type="button"
              onClick={validateAndSave}
              disabled={isSaving}
              whileHover={!isSaving ? { scale: 1.02 } : {}}
              whileTap={!isSaving ? { scale: 0.98 } : {}}
              className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Item
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

