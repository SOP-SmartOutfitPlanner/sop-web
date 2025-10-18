/**
 * Color Mapper - Convert color names to hex codes
 * Maps common color names to their hex values
 */

export const COLOR_MAP: Record<string, string> = {
  // Basic Colors
  "White": "#FFFFFF",
  "Black": "#000000",
  "Gray": "#808080",
  "Grey": "#808080",
  "Red": "#FF0000",
  "Blue": "#0000FF",
  "Green": "#008000",
  "Yellow": "#FFFF00",
  "Orange": "#FFA500",
  "Purple": "#800080",
  "Pink": "#FFC0CB",
  "Brown": "#A52A2A",
  "Beige": "#F5F5DC",
  "Navy": "#000080",
  "Teal": "#008080",
  "Maroon": "#800000",
  "Olive": "#808000",
  "Lime": "#00FF00",
  "Aqua": "#00FFFF",
  "Silver": "#C0C0C0",
  "Gold": "#FFD700",
  "Ivory": "#FFFFF0",
  "Khaki": "#F0E68C",
  "Lavender": "#E6E6FA",
  "Mint": "#98FF98",
  "Coral": "#FF7F50",
  "Salmon": "#FA8072",
  "Turquoise": "#40E0D0",
  "Violet": "#EE82EE",
  "Indigo": "#4B0082",
  "Magenta": "#FF00FF",
  "Cyan": "#00FFFF",
  "Cream": "#FFFDD0",
  "Tan": "#D2B48C",
  "Burgundy": "#800020",
  
  // Light variants
  "Light Blue": "#ADD8E6",
  "Light Gray": "#D3D3D3",
  "Light Grey": "#D3D3D3",
  "Light Pink": "#FFB6C1",
  "Light Green": "#90EE90",
  "Light Yellow": "#FFFFE0",
  "Light Purple": "#DDA0DD",
  
  // Dark variants
  "Dark Blue": "#00008B",
  "Dark Gray": "#A9A9A9",
  "Dark Grey": "#A9A9A9",
  "Dark Red": "#8B0000",
  "Dark Green": "#006400",
  "Dark Purple": "#301934",
  "Dark Brown": "#654321",
  
  // Denim/Jean colors
  "Denim": "#1560BD",
  "Distressed Blue": "#5B7C99",
  "Light Denim": "#6F8FAF",
  "Dark Denim": "#0F4C75",
  "Faded Denim": "#7FA1C3",
  "Vintage Blue": "#5D8AA8",
  "Washed Blue": "#6CA6CD",
  
  // Fashion colors
  "Nude": "#E3BC9A",
  "Blush": "#DE5D83",
  "Mustard": "#FFDB58",
  "Rust": "#B7410E",
  "Sage": "#9DC183",
  "Mauve": "#E0B0FF",
  "Charcoal": "#36454F",
  "Off White": "#FAF9F6",
  "Champagne": "#F7E7CE",
  "Rose": "#FF007F",
  "Taupe": "#483C32",
  "Slate": "#708090",
  "Pewter": "#96A8A1",
  "Camel": "#C19A6B",
  "Chocolate": "#7B3F00",
  "Espresso": "#4E312D",
  "Mocha": "#967969",
  "Coffee": "#6F4E37",
  "Crimson": "#DC143C",
  "Scarlet": "#FF2400",
  "Azure": "#007FFF",
  "Cobalt": "#0047AB",
  "Emerald": "#50C878",
  "Forest": "#228B22",
  "Jade": "#00A86B",
  "Amber": "#FFBF00",
  "Peach": "#FFE5B4",
  "Apricot": "#FBCEB1",
  "Lilac": "#C8A2C8",
  "Periwinkle": "#CCCCFF",
  "Plum": "#8E4585",
  
  // Polyester/Fabric specific
  "Polyester White": "#F8F8F8",
  "Cotton White": "#FFFEF0",
};

/**
 * Get hex color code from color name
 * Returns original string if not found (might be hex already)
 */
export function getColorHex(colorName: string): string {
  if (!colorName) return "#CCCCCC"; // Default gray for empty
  
  // If already a hex color, return as is
  if (colorName.startsWith("#")) {
    return colorName;
  }
  
  // Try exact match first
  const exactMatch = COLOR_MAP[colorName];
  if (exactMatch) return exactMatch;
  
  // Try case-insensitive match
  const normalizedName = colorName.trim();
  const lowerName = normalizedName.toLowerCase();
  
  for (const [key, value] of Object.entries(COLOR_MAP)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }
  
  // Try to find partial match (e.g., "Blue Striped" -> "Blue")
  for (const [key, value] of Object.entries(COLOR_MAP)) {
    if (lowerName.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // If no match found, return a default color based on hashing the string
  return generateColorFromString(colorName);
}

/**
 * Generate a consistent color from a string (for unknown color names)
 */
function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate a color that's not too light or too dark
  const h = Math.abs(hash % 360);
  const s = 65 + (Math.abs(hash) % 20); // 65-85%
  const l = 45 + (Math.abs(hash) % 20); // 45-65%
  
  return hslToHex(h, s, l);
}

/**
 * Convert HSL to Hex
 */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Get text color (black or white) based on background color
 */
export function getContrastTextColor(hexColor: string): string {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

