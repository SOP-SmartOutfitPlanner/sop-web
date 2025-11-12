/**
 * Utility functions for color handling
 */

// Common color name to hex mapping
const COLOR_MAP: Record<string, string> = {
  // Basic colors
  'black': '#000000',
  'white': '#FFFFFF',
  'gray': '#808080',
  'grey': '#808080',
  
  // Primary colors
  'red': '#FF0000',
  'blue': '#0000FF',
  'yellow': '#FFFF00',
  'green': '#008000',
  
  // Secondary colors
  'orange': '#FFA500',
  'purple': '#800080',
  'pink': '#FFC0CB',
  'brown': '#A52A2A',
  
  // Additional colors
  'navy': '#000080',
  'teal': '#008080',
  'cyan': '#00FFFF',
  'magenta': '#FF00FF',
  'lime': '#00FF00',
  'maroon': '#800000',
  'olive': '#808000',
  'aqua': '#00FFFF',
  'silver': '#C0C0C0',
  'gold': '#FFD700',
  'beige': '#F5F5DC',
  'cream': '#FFFDD0',
  'ivory': '#FFFFF0',
  'khaki': '#F0E68C',
  'lavender': '#E6E6FA',
  'mint': '#98FF98',
  'peach': '#FFDAB9',
  'coral': '#FF7F50',
  'salmon': '#FA8072',
  'tan': '#D2B48C',
  'turquoise': '#40E0D0',
  'violet': '#EE82EE',
  'indigo': '#4B0082',
  
  // Shades
  'light gray': '#D3D3D3',
  'light grey': '#D3D3D3',
  'dark gray': '#A9A9A9',
  'dark grey': '#A9A9A9',
  'light blue': '#ADD8E6',
  'dark blue': '#00008B',
  'light green': '#90EE90',
  'dark green': '#006400',
  'light pink': '#FFB6C1',
  'dark pink': '#FF1493',
  'light red': '#FF6B6B',
  'dark red': '#8B0000',
  'light yellow': '#FFFFE0',
  'dark yellow': '#FFD700',
  
  // Common fabric/clothing colors
  'denim': '#1560BD',
  'charcoal': '#36454F',
  'burgundy': '#800020',
  'crimson': '#DC143C',
  'scarlet': '#FF2400',
  'emerald': '#50C878',
  'jade': '#00A86B',
  'sapphire': '#0F52BA',
  'ruby': '#E0115F',
  'amethyst': '#9966CC',
  'rose': '#FF007F',
  'mustard': '#FFDB58',
  'ochre': '#CC7722',
};

/**
 * Convert color name to hex code
 * @param colorName - Color name (e.g., "red", "blue")
 * @returns Hex color code (e.g., "#FF0000")
 */
export function colorNameToHex(colorName: string): string {
  const normalized = colorName.toLowerCase().trim();
  return COLOR_MAP[normalized] || '#808080'; // Default to gray if color not found
}

/**
 * Parse color data from API - handles both formats:
 * 1. JSON string: "[{\"name\":\"Red\",\"hex\":\"#FF0000\"}]" (from Outfit API)
 * 2. Comma-separated: "red, blue, green" (from Calendar API)
 * @param colorString - Color data from API
 * @returns Array of color objects with name and hex
 */
export function parseColors(colorString: string): Array<{ name: string; hex: string }> {
  if (!colorString) return [];
  
  // Check if it's a JSON string (starts with '[')
  if (colorString.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(colorString);
      // Validate that it's an array of color objects with name and hex
      if (Array.isArray(parsed) && parsed.every(c => c.name && c.hex)) {
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to parse color JSON, falling back to comma-separated:', error);
    }
  }
  
  // Fall back to comma-separated format
  return colorString
    .split(',')
    .map(color => color.trim())
    .filter(color => color.length > 0)
    .map(color => ({
      name: color,
      hex: colorNameToHex(color),
    }));
}
