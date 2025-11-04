import { motion } from "framer-motion";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { FORM_ANIMATIONS } from "../form-config";

interface ColorSectionProps {
  colors: { name: string; hex: string }[];
  onChange?: (colors: { name: string; hex: string }[]) => void;
  readOnly?: boolean;
}

export function ColorSection({
  colors,
  onChange,
  readOnly = false,
}: ColorSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");

  const handleAddColor = () => {
    if (!onChange) return;

    const colorName = newColorName.trim() || newColorHex;

    const updatedColors = [...colors, { name: colorName, hex: newColorHex }];
    onChange(updatedColors);

    setNewColorName("");
    setNewColorHex("#000000");
    setIsAdding(false);
  };

  const handleRemoveColor = (index: number) => {
    if (!onChange) return;
    const updatedColors = colors.filter((_, i) => i !== index);
    onChange(updatedColors);
  };

  if (!colors || colors.length === 0) {
    if (readOnly) return null;

    return (
      <motion.div variants={FORM_ANIMATIONS.item}>
        <Label className="text-sm font-semibold text-white/90 mb-3">
          Colors
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Color
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div variants={FORM_ANIMATIONS.item}>
      <Label className="text-sm font-semibold text-white/90 mb-3">
        {readOnly ? "Detected Colors" : "Colors"}
      </Label>
      <div className="flex gap-3 flex-wrap items-center">
        {colors.map((color, index) => (
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

            {!readOnly && onChange && (
              <button
                type="button"
                onClick={() => handleRemoveColor(index)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            )}
          </motion.div>
        ))}

        {!readOnly && onChange && !isAdding && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="w-14 h-14 rounded-xl bg-white/10 border-2 border-dashed border-white/30 text-white hover:bg-white/20 hover:border-white/50"
          >
            <Plus className="w-6 h-6" />
          </Button>
        )}

        {!readOnly && isAdding && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20"
          >
            <div className="flex flex-col gap-2">
              <Input
                type="text"
                placeholder="Color name (optional)"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className="h-8  bg-white/20 border-white/30 text-white placeholder:text-white/50 w-32"
              />
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="h-8 w-16 cursor-pointer"
                />
                <Input
                  type="text"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="h-8 bg-white/20 border-white/30 text-white placeholder:text-white/50 w-24 font-mono text-xs"
                  placeholder="#000000"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                size="sm"
                onClick={handleAddColor}
                className="bg-green-500 hover:bg-green-600 text-white h-8"
              >
                Add
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewColorName("");
                  setNewColorHex("#000000");
                }}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 h-8"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
