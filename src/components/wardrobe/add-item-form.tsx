"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Custom Components
import { ImageUpload } from "./image-upload";
import { TagInput } from "@/components/wardrobe/tag-input";

// Hooks & Stores
import { useWardrobeStore } from "@/store/wardrobe-store";
import { useAuthStore } from "@/store/auth-store";

// API & Utils
import { wardrobeAPI, getCategoryInfo } from "@/lib/api/wardrobe-api";
import { extractUserFromToken } from "@/lib/utils/jwt";

// Types
interface AddItemFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  type: string;
  brand: string;
  goal: string;
  colors: string[];
  seasons: string[];
  occasions: string[];
  tags: string[];
  image: File | null;
}

interface AiSummary {
  color: string;
  aiDescription: string;
  weatherSuitable: string;
  condition: string;
  pattern: string;
  fabric: string;
  imageRemBgURL: string;
}

// Constants
const ITEM_TYPES = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "shoes", label: "Shoes" },
  { value: "outer", label: "Outerwear" },
  { value: "accessory", label: "Accessory" },
] as const;

const COLORS = [
  "White",
  "Black",
  "Navy",
  "Blue",
  "Beige",
  "Brown",
  "Grey",
  "Red",
  "Green",
  "Yellow",
  "Pink",
  "Purple",
] as const;

const SEASONS = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
  { value: "all", label: "All" },
] as const;

const OCCASIONS = [
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "smart", label: "Smart" },
  { value: "active", label: "Active" },
] as const;

// Season mapping for Vietnamese to English
const SEASON_MAP: Record<string, string> = {
  "mùa hè": "summer",
  "mùa xuân": "spring",
  "mùa thu": "fall",
  "mùa đông": "winter",
  "thời tiết mát mẻ": "fall",
};

// Initial form state
const INITIAL_FORM_STATE: FormData = {
  name: "",
  type: "",
  brand: "",
  goal: "",
  colors: [],
  seasons: [],
  occasions: [],
  tags: [],
  image: null,
};

// Helper function to get user ID
const getUserId = async (user: { id?: string } | null): Promise<number> => {
  if (user?.id) {
    return parseInt(user.id);
  }

  // Fallback to token
  const token = localStorage.getItem("accessToken");
  if (token) {
    const userInfo = extractUserFromToken(token);
    if (userInfo?.id) {
      return parseInt(userInfo.id);
    }
  }

  throw new Error("User not logged in");
};

// Helper function to map Vietnamese seasons to English
const mapSeasons = (weatherSuitable: string): string[] => {
  return weatherSuitable
    .split(", ")
    .map(
      (season: string) =>
        SEASON_MAP[season.trim().toLowerCase()] || season.trim().toLowerCase()
    );
};

export function AddItemForm({ isOpen, onClose }: AddItemFormProps) {
  // Store hooks
  const { fetchItems } = useWardrobeStore();
  const { user } = useAuthStore();

  // Form state
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);
  const [aiSummary, setAiSummary] = useState<AiSummary | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  // Reset form helper
  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    setAiSummary(null);
    setIsAnalyzingImage(false);
  }, []);

  const handleCheckboxChange = useCallback(
    (
      field: "colors" | "seasons" | "occasions",
      value: string,
      checked: boolean
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: checked
          ? [...prev[field], value]
          : prev[field].filter((item) => item !== value),
      }));
    },
    []
  );

  // Image upload handler with AI summary
  const handleImageUpload = useCallback(async (file: File | null) => {
    if (!file) return;

    // Update form with selected file
    setFormData((prev) => ({ ...prev, image: file }));

    // Analyze image with AI
    setIsAnalyzingImage(true);
    try {
      const summary = await wardrobeAPI.getImageSummary(file);

      if (summary?.aiDescription) {
        setAiSummary(summary);

        // Auto-populate form fields
        setFormData((prev) => ({
          ...prev,
          name: summary.aiDescription || prev.name,
          colors: summary.color ? [summary.color] : prev.colors,
          seasons: summary.weatherSuitable
            ? mapSeasons(summary.weatherSuitable)
            : prev.seasons,
        }));
      }
    } catch (error) {
      console.error("AI analysis failed:", error);
      alert(
        "Failed to analyze image with AI. You can still fill the form manually."
      );
    } finally {
      setIsAnalyzingImage(false);
    }
  }, []);

  // Form submission handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const userId = await getUserId(user);
        const categoryInfo = getCategoryInfo(formData.type);

        const itemData = {
          userId,
          name: formData.name,
          categoryId: categoryInfo.id,
          categoryName: categoryInfo.name,
          color: formData.colors.join(", "),
          aiDescription:
            aiSummary?.aiDescription ||
            `${formData.brand} ${formData.name}`.trim(),
          brand: formData.brand,
          frequencyWorn: "0",
          lastWornAt: undefined,
          imgUrl: aiSummary?.imageRemBgURL || "",
          weatherSuitable:
            aiSummary?.weatherSuitable || formData.seasons.join(", "),
          condition: aiSummary?.condition || "New",
          pattern: aiSummary?.pattern || "Solid",
          fabric: aiSummary?.fabric || "Cotton",
          tag: formData.tags.join(", "),
        };

        await wardrobeAPI.createItem(itemData);
        await fetchItems();

        // Success handling
        setSubmitSuccess(true);
        resetForm();

        setTimeout(() => {
          setSubmitSuccess(false);
          onClose();
        }, 1500);
      } catch (error) {
        console.error("Failed to create item:", error);
        alert("Failed to create item. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, aiSummary, user, fetchItems, onClose, resetForm]
  );

  // Handle dialog close
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      resetForm();
      setSubmitSuccess(false);
      onClose();
    }
  }, [isSubmitting, resetForm, onClose]);

  // Success dialog
  if (submitSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Success!</h3>
            <p className="mt-2 text-sm text-gray-500">
              Your item has been added to your wardrobe.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          {/* <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button> */}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Upload Image</Label>
            <ImageUpload onChange={handleImageUpload} />
            {isAnalyzingImage && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Analyzing image with AI...
              </div>
            )}
            {aiSummary && (
              <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                ✓ AI analysis complete! Form fields have been pre-filled with
                detected information.
              </div>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Blue Denim Jacket"
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ITEM_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, brand: e.target.value }))
              }
              placeholder="e.g., Levi's"
            />
          </div>

          {/* Colors */}
          <div className="space-y-3">
            <Label>Colors *</Label>
            <div className="grid grid-cols-3 gap-2">
              {COLORS.map((color) => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={color}
                    checked={formData.colors.includes(color)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("colors", color, checked as boolean)
                    }
                  />
                  <Label htmlFor={color} className="text-sm">
                    {color}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Seasons */}
          <div className="space-y-3">
            <Label>Seasons</Label>
            <div className="grid grid-cols-2 gap-2">
              {SEASONS.map((season) => (
                <div key={season.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={season.value}
                    checked={formData.seasons.includes(season.value)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "seasons",
                        season.value,
                        checked as boolean
                      )
                    }
                  />
                  <Label htmlFor={season.value} className="text-sm">
                    {season.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Occasions */}
          <div className="space-y-3">
            <Label>Occasions</Label>
            <div className="grid grid-cols-2 gap-2">
              {OCCASIONS.map((occasion) => (
                <div
                  key={occasion.value}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={occasion.value}
                    checked={formData.occasions.includes(occasion.value)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "occasions",
                        occasion.value,
                        checked as boolean
                      )
                    }
                  />
                  <Label htmlFor={occasion.value} className="text-sm">
                    {occasion.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput
              value={formData.tags}
              onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
              placeholder="Add tags (press Enter)"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={
              isSubmitting ||
              !formData.name ||
              !formData.type ||
              formData.colors.length === 0
            }
          >
            {isSubmitting ? "Adding Item..." : "Add Item"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
