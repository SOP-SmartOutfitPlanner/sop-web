"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";
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
import { ImageUpload } from "./image-upload";
import { TagInput } from "@/components/wardrobe/tag-input";
import { useWardrobeStore } from "@/store/wardrobe-store";

import { wardrobeAPI } from "@/lib/api/wardrobe-api";
import { getCurrentUserId } from "@/lib/utils/auth-utils";

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

const ITEM_TYPES = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "shoes", label: "Shoes" },
  { value: "outer", label: "Outerwear" },
  { value: "accessory", label: "Accessory" },
];

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
];

const SEASONS = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
  { value: "all", label: "All" },
];

const OCCASIONS = [
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "smart", label: "Smart" },
  { value: "active", label: "Active" },
];

export function AddItemForm({ isOpen, onClose }: AddItemFormProps) {
  const { fetchItems } = useWardrobeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: "",
    brand: "",
    goal: "",
    colors: [],
    seasons: [],
    occasions: [],
    tags: [],
    image: null,
  });

  const handleCheckboxChange = useCallback((
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
  }, []);

  // Simple image upload handler
  const handleImageUpload = useCallback((file: File | null) => {
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
      }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get current user ID
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error("User not logged in");
      }

      // Prepare item data for API
      const itemData = {
        userId: userId,
        name: formData.name,
        categoryId: 1, // Default category, you may want to map types to categoryIds
        categoryName: formData.type || "General",
        color: formData.colors.join(", "),
        aiDescription: `${formData.brand} ${formData.name}`.trim(),
        brand: formData.brand,
        frequencyWorn: "0",
        lastWornAt: undefined,
        imgUrl: "", // Will be set after image upload if needed
        weatherSuitable: formData.seasons.join(", "),
        condition: "New",
        pattern: "Solid", // Default value
        fabric: "Cotton", // Default value
        tag: formData.tags.join(", "),
      };

      // Create the item
      await wardrobeAPI.createItem(itemData);

      // After creating item, refetch the items to get updated list
      // The store's fetchItems method will automatically update the UI
      await fetchItems();

      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        name: "",
        type: "",
        brand: "",
        goal: "",
        colors: [],
        seasons: [],
        occasions: [],
        tags: [],
        image: null,
      });

      // Close dialog after short delay
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
      }, 1500);

    } catch (error) {
      console.error("❌ Failed to create item:", error);
      alert("Failed to create item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form on close
      setFormData({
        name: "",
        type: "",
        brand: "",
        goal: "",
        colors: [],
        seasons: [],
        occasions: [],
        tags: [],
        image: null,
      });
      setSubmitSuccess(false);
      onClose();
    }
  };

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
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Upload Image</Label>
            <ImageUpload 
              onChange={handleImageUpload}
            />
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
                      handleCheckboxChange("seasons", season.value, checked as boolean)
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
                <div key={occasion.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={occasion.value}
                    checked={formData.occasions.includes(occasion.value)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("occasions", occasion.value, checked as boolean)
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
              onChange={(tags) =>
                setFormData((prev) => ({ ...prev, tags }))
              }
              placeholder="Add tags (press Enter)"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !formData.name || !formData.type || formData.colors.length === 0}
          >
            {isSubmitting ? "Adding Item..." : "Add Item"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}