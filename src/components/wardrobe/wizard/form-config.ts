/**
 * Configuration constants for ItemFormContent
 * Extracted from ItemFormContent.tsx for better maintainability
 */

// ==================== Form Options ====================
export const SEASONS = ["Spring", "Summer", "Fall", "Winter"] as const;

export const CONDITIONS = ["New", "Like New", "Good", "Fair"] as const;

export const PATTERNS = [
  "Solid",
  "Striped",
  "Checkered",
  "Floral",
  "Geometric",
  "Printed",
  "Other",
] as const;

export const FABRICS = [
  "Cotton",
  "Polyester",
  "Silk",
  "Wool",
  "Denim",
  "Leather",
  "Linen",
  "Blend",
] as const;

export const WEATHER_TYPES = [
  "Hot",
  "Warm",
  "Mild",
  "Cool",
  "Cold",
  "All Season",
] as const;

// ==================== Color Presets ====================
export const COLOR_PRESETS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Gray", hex: "#808080" },
  { name: "Red", hex: "#FF0000" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Green", hex: "#00FF00" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Purple", hex: "#800080" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Navy", hex: "#000080" },
  { name: "Teal", hex: "#008080" },
] as const;

// ==================== Animation Variants ====================
export const FORM_ANIMATIONS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  },
} as const;

// ==================== Section Titles ====================
export const FORM_SECTIONS = {
  BASIC_INFO: {
    title: "Basic Information",
    emoji: "📝",
  },
  APPEARANCE: {
    title: "Appearance",
    emoji: "🎨",
  },
  DETAILS: {
    title: "Details",
    emoji: "📋",
  },
  CATEGORY: {
    title: "Category & Style",
    emoji: "🏷️",
  },
  OCCASIONS: {
    title: "Occasions",
    emoji: "📅",
  },
  WEATHER: {
    title: "Weather & Seasons",
    emoji: "☀️",
  },
  NOTES: {
    title: "Additional Notes",
    emoji: "💭",
  },
} as const;

// ==================== Validation Rules ====================
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    ERROR_REQUIRED: "Item name is required",
    ERROR_MIN_LENGTH: "Item name must be at least 2 characters",
    ERROR_MAX_LENGTH: "Item name must be less than 100 characters",
  },
  CATEGORY: {
    ERROR_REQUIRED: "Please select a category",
  },
  COLORS: {
    MIN_COUNT: 1,
    ERROR_REQUIRED: "Please select at least one color",
  },
  BRAND: {
    MAX_LENGTH: 50,
    ERROR_MAX_LENGTH: "Brand name must be less than 50 characters",
  },
  NOTES: {
    MAX_LENGTH: 500,
    ERROR_MAX_LENGTH: "Notes must be less than 500 characters",
  },
} as const;

// ==================== Form Field Config ====================
export const FORM_FIELDS = {
  NAME: {
    id: "name",
    label: "Item Name",
    placeholder: "Enter item name...",
    required: true,
  },
  BRAND: {
    id: "brand",
    label: "Brand",
    placeholder: "Enter brand name...",
    required: false,
  },
  PATTERN: {
    id: "pattern",
    label: "Pattern",
    required: false,
  },
  FABRIC: {
    id: "fabric",
    label: "Fabric",
    required: false,
  },
  CONDITION: {
    id: "condition",
    label: "Condition",
    required: false,
  },
  NOTES: {
    id: "notes",
    label: "Notes",
    placeholder: "Add any additional notes...",
    required: false,
    rows: 3,
  },
  TAGS: {
    id: "tags",
    label: "Tags",
    placeholder: "Enter tags separated by commas...",
    required: false,
  },
} as const;
