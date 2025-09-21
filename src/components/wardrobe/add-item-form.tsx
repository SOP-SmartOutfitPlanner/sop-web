"use client";

import { useState } from "react";
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
import { compressImage } from "@/lib/utils/image-utils";

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
  const { addItem } = useWardrobeStore();
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

  const handleCheckboxChange = (
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert image to base64 if provided
      let imageBase64 =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSIyMDAiIHk9IjIwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";

      if (formData.image) {
        // Compress image to max 400x400 with 70% quality to reduce size
        imageBase64 = await compressImage(formData.image, 220, 170, 0.7);
      }

      // Create new item object for API
      const newItemData = {
        name: formData.name,
        type: formData.type as "top" | "bottom" | "shoes" | "outer" | "accessory",
        imageUrl: imageBase64,
        brand: formData.brand,
        colors: formData.colors,
        seasons: formData.seasons.filter(s => s !== "all") as ("spring" | "summer" | "fall" | "winter")[],
        occasions: formData.occasions.map(o => o === "smart" ? "formal" : o === "active" ? "sport" : o) as ("casual" | "formal" | "sport" | "travel")[],
        status: "active" as const,
      };

      // Add to store (which calls API)
      await addItem(newItemData);
      console.log("newItemData", newItemData);

      // Show success message
      setSubmitSuccess(true);

      // Reset form and close modal after delay
      setTimeout(() => {
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
      }, 1500);
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add New Item
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Message */}
          {submitSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm font-medium">
                ✅ Item added successfully! Image compressed and sent to API...
              </p>
            </div>
          )}

          {/* Image Upload */}
          <ImageUpload
            value={
              formData.image ? URL.createObjectURL(formData.image) : undefined
            }
            onChange={(file) =>
              setFormData((prev) => ({ ...prev, image: file }))
            }
          />

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., White Cotton T-Shirt"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                placeholder="e.g., Uniqlo"
                value={formData.brand}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, brand: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal">Goal</Label>
              <Input
                id="goal"
                placeholder="e.g., Phối đồ công sở, Dạo phố cuối tuần"
                value={formData.goal}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, goal: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-3">
            <Label>Colors</Label>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map((color) => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color}`}
                    checked={formData.colors.includes(color)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("colors", color, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`color-${color}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {color}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Seasons */}
          <div className="space-y-3">
            <Label>Seasons</Label>
            <div className="grid grid-cols-3 gap-2">
              {SEASONS.map((season) => (
                <div key={season.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`season-${season.value}`}
                    checked={formData.seasons.includes(season.value)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "seasons",
                        season.value,
                        checked as boolean
                      )
                    }
                  />
                  <label
                    htmlFor={`season-${season.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {season.label}
                  </label>
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
                    id={`occasion-${occasion.value}`}
                    checked={formData.occasions.includes(occasion.value)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "occasions",
                        occasion.value,
                        checked as boolean
                      )
                    }
                  />
                  <label
                    htmlFor={`occasion-${occasion.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {occasion.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <TagInput
            value={formData.tags}
            onChange={(tags: string[]) =>
              setFormData((prev) => ({ ...prev, tags }))
            }
          />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.type}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
