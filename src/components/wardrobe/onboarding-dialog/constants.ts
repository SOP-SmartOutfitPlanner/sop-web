export const STEPS = {
  WELCOME: 0,
  WHY_SOP: 1,
  PERSONAL_INFO: 2,
  COLORS: 3,
  STYLES: 4,
  FULL_BODY_IMAGE: 5,
} as const;

export const TOTAL_STEPS = Object.keys(STEPS).length;
export const MAX_COLORS = 8;
export const MAX_STYLES = 5;
export const LOCATION_API_BASE = "https://open.oapi.vn/location";

export const COLOR_PRESETS = [
  { name: "Red", color: "#EF4444" },
  { name: "Pink", color: "#EC4899" },
  { name: "Purple", color: "#A855F7" },
  { name: "Blue", color: "#3B82F6" },
  { name: "Cyan", color: "#06B6D4" },
  { name: "Green", color: "#10B981" },
  { name: "Yellow", color: "#F59E0B" },
  { name: "Orange", color: "#F97316" },
  { name: "Brown", color: "#92400E" },
  { name: "Gray", color: "#6B7280" },
  { name: "Black", color: "#1F2937" },
  { name: "White", color: "#F9FAFB" },
  { name: "Beige", color: "#D4C5B9" },
  { name: "Navy", color: "#1E3A8A" },
  { name: "Maroon", color: "#7C2D12" },
  { name: "Olive", color: "#84CC16" },
] as const;
