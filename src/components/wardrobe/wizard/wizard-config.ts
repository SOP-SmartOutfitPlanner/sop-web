import type { WizardFormData } from "./types";

export const STATUS = {
  IDLE: "idle",
  PREVIEW: "preview",
  CROPPING: "cropping",
  ANALYZING: "analyzing",
  FORM: "form",
  SAVED: "saved",
} as const;

export type StatusType = (typeof STATUS)[keyof typeof STATUS];

export const AI_ANALYSIS_CONFIG = {
  MAX_RETRIES: 5,
  RETRY_DELAY: 30000,
  PROGRESS_INTERVAL: 100,
  PROGRESS_INCREMENT: 0.5,
  SUCCESS_DISPLAY_DURATION: 1500,
  REQUIRED_FIELDS: ['name', 'category', 'imageRemBgURL'] as const,
  IMPORTANT_FIELDS: ['colors', 'pattern', 'fabric', 'weatherSuitable'] as const,
} as const;

export const INITIAL_FORM_DATA: WizardFormData = {
  uploadedImageURL: "",
  imageRemBgURL: "",
  name: "",
  categoryId: 0,
  categoryName: "",
  brand: "",
  notes: "",
  colors: [],
  seasons: [],
  pattern: "",
  fabric: "",
  condition: "New",
  tags: [],
  wornToday: false,
};

// ==================== Animation Variants ====================
export const WIZARD_ANIMATIONS = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: { 
      type: "spring",
      duration: 0.3,
      bounce: 0.2,
    },
  },
  content: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2 },
  },
} as const;

// ==================== Toast Messages ====================
export const WIZARD_MESSAGES = {
  ANALYSIS_START: "🔍 Analyzing your item with AI...",
  ANALYSIS_RETRY: (attempt: number, max: number) =>
    `⚠️ Retrying analysis (${attempt}/${max})...`,
  ANALYSIS_SUCCESS: "✨ AI analysis complete!",
  ANALYSIS_ERROR: "❌ Failed to analyze image. Please try again.",
  SAVE_START: "💾 Saving item to wardrobe...",
  SAVE_SUCCESS: "✅ Item added to wardrobe successfully!",
  SAVE_ERROR: "❌ Failed to save item. Please try again.",
  VALIDATION_ERROR: "⚠️ Please fill in all required fields",
} as const;

// ==================== Step Configuration ====================
export const WIZARD_STEPS = {
  PHOTO: {
    title: "Upload Photo",
    description: "Add a photo of your item",
    icon: "📷",
  },
  CROP: {
    title: "Crop Image",
    description: "Adjust your photo",
    icon: "✂️",
  },
  ANALYZE: {
    title: "AI Analysis",
    description: "Analyzing with AI",
    icon: "✨",
  },
  FORM: {
    title: "Item Details",
    description: "Review and edit details",
    icon: "📝",
  },
} as const;
