/**
 * EditableColorSection Component
 * Display and edit colors - allows adding/removing colors
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { FORM_ANIMATIONS } from "../form-config";

interface ColorOption {
  name: string;
  hex: string;
}

interface EditableColorSectionProps {
  colors: ColorOption[];
  onColorsChange: (colors: ColorOption[]) => void;
}

// Predefined color options
const COMMON_COLORS: ColorOption[] = [
  { name: "Red", hex: "#EF4444" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#10B981" },
  { name: "Yellow", hex: "#F59E0B" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Orange", hex: "#F97316" },
  { name: "Black", hex: "#1F2937" },
  { name: "White", hex: "#F9FAFB" },
  { name: "Gray", hex: "#6B7280" },
  { name: "Brown", hex: "#92400E" },
];

export function EditableColorSection({ colors, onColorsChange }: EditableColorSectionProps) {
  const [showAddColor, setShowAddColor] = useState(false);
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#000000");

  // Remove color
  const handleRemoveColor = (index: number) => {
    const newColors = colors.filter((_, i) => i !== index);
    onColorsChange(newColors);
  };

  // Add predefined color
  const handleAddPredefinedColor = (color: ColorOption) => {
    // Check if color already exists
    if (!colors.find(c => c.hex === color.hex)) {
      onColorsChange([...colors, color]);
    }
  };

  // Add custom color
  const handleAddCustomColor = () => {
    if (customColorName.trim()) {
      const newColor: ColorOption = {
        name: customColorName.trim(),
        hex: customColorHex,
      };
      
      // Check if color already exists
      if (!colors.find(c => c.hex === newColor.hex)) {
        onColorsChange([...colors, newColor]);
        setCustomColorName("");
        setCustomColorHex("#000000");
        setShowAddColor(false);
      }
    }
  };

  return (
    <motion.div variants={FORM_ANIMATIONS.item}>
      <div className="flex items-center justify-between mb-3">
        <Label className="text-sm font-semibold text-gray-900">Colors</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAddColor(!showAddColor)}
          className="h-8 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Color
        </Button>
      </div>

      {/* Current Colors */}
      <div className="flex gap-3 flex-wrap mb-3">
        {colors.map((color, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: index * 0.1,
              type: "spring",
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            className="relative group"
          >
            <div
              className="w-14 h-14 rounded-xl border-2 border-gray-300 shadow-md transition-all group-hover:shadow-lg cursor-pointer"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
            <button
              type="button"
              onClick={() => handleRemoveColor(index)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {color.name}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Color Section */}
      {showAddColor && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          {/* Predefined Colors */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Quick Add:</p>
            <div className="flex gap-2 flex-wrap">
              {COMMON_COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => handleAddPredefinedColor(color)}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  disabled={colors.some(c => c.hex === color.hex)}
                />
              ))}
            </div>
          </div>

          {/* Custom Color */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Or add custom:</p>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Color name"
                value={customColorName}
                onChange={(e) => setCustomColorName(e.target.value)}
                className="flex-1"
              />
              <Input
                type="color"
                value={customColorHex}
                onChange={(e) => setCustomColorHex(e.target.value)}
                className="w-16"
              />
              <Button
                type="button"
                onClick={handleAddCustomColor}
                size="sm"
                disabled={!customColorName.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {colors.length === 0 && (
        <p className="text-sm text-gray-500 italic">No colors added yet</p>
      )}
    </motion.div>
  );
}
