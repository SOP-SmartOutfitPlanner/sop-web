/**
 * BasicInfoSection Component
 * Name and Brand fields
 */

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FORM_ANIMATIONS, FORM_FIELDS } from "../form-config";

interface BasicInfoSectionProps {
  name: string;
  brand: string;
  errors: Record<string, string>;
  onNameChange: (value: string) => void;
  onBrandChange: (value: string) => void;
}

export function BasicInfoSection({
  name,
  brand,
  errors,
  onNameChange,
  onBrandChange,
}: BasicInfoSectionProps) {
  return (
    <motion.div variants={FORM_ANIMATIONS.item} className="space-y-5">
      {/* Name */}
      <div>
        <Label
          htmlFor={FORM_FIELDS.NAME.id}
          className="text-sm font-semibold text-gray-700 mb-2"
        >
          {FORM_FIELDS.NAME.label} *
        </Label>
        <Input
          type="text"
          id={FORM_FIELDS.NAME.id}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className={`w-full px-4 py-3 bg-white border ${
            errors.name
              ? "border-red-500 bg-red-50"
              : "border-gray-200 hover:border-gray-300"
          } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
          placeholder={FORM_FIELDS.NAME.placeholder}
        />
        {errors.name && (
          <p className="mt-1.5 text-xs text-red-500 font-medium">
            {errors.name}
          </p>
        )}
      </div>

      {/* Brand */}
      <div>
        <Label
          htmlFor={FORM_FIELDS.BRAND.id}
          className="text-sm font-semibold text-gray-700 mb-2"
        >
          {FORM_FIELDS.BRAND.label}  *
        </Label>
        <Input
          type="text"
          id={FORM_FIELDS.BRAND.id}
          value={brand}
          onChange={(e) => onBrandChange(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
          placeholder={FORM_FIELDS.BRAND.placeholder}
        />
      </div>
    </motion.div>
  );
}
