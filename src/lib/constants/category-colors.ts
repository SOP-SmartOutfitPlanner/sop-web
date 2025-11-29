/**
 * Tailwind color classes for category visualization
 * Maps category IDs to background color classes
 */
export const CATEGORY_COLORS: Record<number, string> = {
  // Top (1-12) - Blue shades
  1: "bg-blue-500",
  2: "bg-blue-600",
  3: "bg-blue-400",
  4: "bg-blue-300",
  5: "bg-blue-500",
  6: "bg-blue-700",
  7: "bg-blue-600",
  8: "bg-blue-400",
  9: "bg-blue-800",
  10: "bg-blue-900",
  11: "bg-blue-700",
  12: "bg-blue-500",

  // Bottom (13-19) - Green shades
  13: "bg-green-600",
  14: "bg-green-700",
  15: "bg-green-500",
  16: "bg-green-400",
  17: "bg-green-600",
  18: "bg-green-500",
  19: "bg-green-700",

  // Footwear (20-27) - Purple shades
  20: "bg-purple-500",
  21: "bg-purple-700",
  22: "bg-purple-400",
  23: "bg-purple-600",
  24: "bg-purple-500",
  25: "bg-purple-600",
  26: "bg-purple-400",
  27: "bg-purple-700",

  // Accessories (28-38) - Orange/Amber shades
  28: "bg-amber-600",
  29: "bg-amber-500",
  30: "bg-orange-500",
  31: "bg-amber-400",
  32: "bg-orange-600",
  33: "bg-amber-700",
  34: "bg-orange-500",
  35: "bg-amber-500",
  36: "bg-amber-600",
  37: "bg-orange-400",
  38: "bg-orange-500",

  // Outerwear (39-42) - Cyan shades
  39: "bg-cyan-600",
  40: "bg-cyan-700",
  41: "bg-cyan-500",
  42: "bg-cyan-600",

  // Underwear (43-46) - Pink shades
  43: "bg-pink-500",
  44: "bg-pink-600",
  45: "bg-pink-400",
  46: "bg-pink-500",
};

/**
 * Get Tailwind color class for a category ID
 * @param categoryId - The category ID (1-46)
 * @returns Tailwind background color class
 */
export function getCategoryColor(categoryId: number): string {
  return CATEGORY_COLORS[categoryId] || "bg-gray-500";
}
