/**
 * Color utilities with tinycolor2
 * For validating and analyzing colors from AI API
 * AI already detects accurate colors with hex codes
 */

import tinycolor from 'tinycolor2';

/**
 * Validate and normalize hex color code using tinycolor2
 * @param hex - Hex color from AI (with or without #)
 * @returns Valid hex with # prefix, or fallback gray if invalid
 */
export function validateHexColor(hex: string): string {
  if (!hex) return '#808080';
  
  const color = tinycolor(hex);
  return color.isValid() ? color.toHexString() : '#808080';
}

/**
 * Get color brightness (0-255) using tinycolor2
 * Useful for determining text color (dark/light) on background
 */
export function getColorBrightness(hex: string): number {
  const color = tinycolor(hex);
  return color.isValid() ? color.getBrightness() : 128;
}

/**
 * Check if color is light (need dark text)
 */
export function isLightColor(hex: string): boolean {
  return getColorBrightness(hex) > 128;
}

/**
 * Get contrasting text color (black or white) for background
 */
export function getContrastTextColor(bgHex: string): string {
  return isLightColor(bgHex) ? '#000000' : '#FFFFFF';
}

/**
 * Parse color array from AI API response
 * AI returns: [{ name: "Khaki", hex: "#A99B5B" }]
 * Just validate hex codes, no name parsing needed
 * 
 * @param colors - Array from AI API
 * @returns Same array with validated hex
 */
export function parseAIColors(colors: Array<{ name: string; hex: string }>): Array<{ name: string; hex: string }> {
  if (!colors || !Array.isArray(colors)) return [];
  
  return colors.map(color => ({
    name: color.name || 'Unknown',
    hex: validateHexColor(color.hex), // Validate hex from AI
  }));
}

/**
 * Parse color string from database (for edit mode)
 * Database stores: "Khaki, White, Blue" (only names, no hex)
 * Since we don't have original hex, return names with placeholder
 * 
 * @param colorString - Comma-separated color names from DB
 * @returns Array with names and gray placeholders
 */
export function parseColorString(colorString: string): Array<{ name: string; hex: string }> {
  if (!colorString) return [];
  
  return colorString
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .map((name) => ({
      name,
      hex: '#808080', // Placeholder gray - DB doesn't store hex
    }));
}

/**
 * Lighten color by percentage
 */
export function lightenColor(hex: string, amount: number = 10): string {
  const color = tinycolor(hex);
  return color.isValid() ? color.lighten(amount).toHexString() : hex;
}

/**
 * Darken color by percentage
 */
export function darkenColor(hex: string, amount: number = 10): string {
  const color = tinycolor(hex);
  return color.isValid() ? color.darken(amount).toHexString() : hex;
}

/**
 * Get complementary color
 */
export function getComplementaryColor(hex: string): string {
  const color = tinycolor(hex);
  return color.isValid() ? color.complement().toHexString() : hex;
}

/**
 * Analyze color from AI
 * Returns full color analysis
 */
export function analyzeColor(hex: string): {
  hex: string;
  rgb: string;
  hsl: string;
  brightness: number;
  isLight: boolean;
  isDark: boolean;
  contrastText: string;
} {
  const color = tinycolor(hex);
  
  if (!color.isValid()) {
    return {
      hex: '#808080',
      rgb: 'rgb(128, 128, 128)',
      hsl: 'hsl(0, 0%, 50%)',
      brightness: 128,
      isLight: false,
      isDark: false,
      contrastText: '#FFFFFF',
    };
  }
  
  return {
    hex: color.toHexString(),
    rgb: color.toRgbString(),
    hsl: color.toHslString(),
    brightness: color.getBrightness(),
    isLight: color.isLight(),
    isDark: color.isDark(),
    contrastText: getContrastTextColor(color.toHexString()),
  };
}
