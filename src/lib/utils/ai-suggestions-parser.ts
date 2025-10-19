/**
 * Parse AI Analysis Response to Wizard Form Format
 * 
 * Helpers to convert Vietnamese AI response to wizard form data
 */

import type { ImageSummaryResponse } from '@/lib/api/wardrobe-api';

export interface ColorOption {
  name: string;
  hex: string;
}

/**
 * Vietnamese to English season mapping
 */
const SEASON_MAP: Record<string, string> = {
  'mùa hè': 'Summer',
  'mùa xuân': 'Spring',
  'mùa thu': 'Fall',
  'mùa đông': 'Winter',
  'thời tiết mát mẻ': 'Fall',
  'thời tiết nóng': 'Summer',
  'thời tiết ấm': 'Spring',
  'thời tiết lạnh': 'Winter',
  'thời tiết ôn hòa': 'Spring',
};

/**
 * Vietnamese color name to hex mapping
 */
const COLOR_HEX_MAP: Record<string, string> = {
  'đen': '#000000',
  'trắng': '#FFFFFF',
  'be': '#E6D8B6',
  'xanh navy': '#1F345A',
  'navy': '#1F345A',
  'xanh dương': '#0066CC',
  'xanh': '#0066CC',
  'đỏ': '#DC143C',
  'vàng': '#FFD700',
  'nâu': '#8B4513',
  'xám': '#808080',
  'hồng': '#FFB6C1',
  'tím': '#9370DB',
  'cam': '#FF8C00',
  'xanh lá': '#228B22',
  'xanh lá cây': '#228B22',
};

/**
 * Parse color string from AI to ColorOption array
 * 
 * @example
 * parseColors("Đen") → [{ name: "Đen", hex: "#000000" }]
 * parseColors("Đen, Trắng") → [{ name: "Đen", hex: "#000000" }, { name: "Trắng", hex: "#FFFFFF" }]
 */
export function parseColors(colorString: string): ColorOption[] {
  if (!colorString?.trim()) {
    return [{ name: 'Unknown', hex: '#808080' }];
  }

  const colors = colorString
    .split(',')
    .map(c => c.trim())
    .filter(Boolean);

  return colors.map(colorName => ({
    name: colorName,
    hex: getColorHex(colorName),
  }));
}

/**
 * Get hex color from Vietnamese color name
 */
export function getColorHex(vietnameseName: string): string {
  const normalized = vietnameseName.toLowerCase().trim();
  return COLOR_HEX_MAP[normalized] || '#808080'; // Default gray
}

/**
 * Parse weather/season string from AI to English season array
 * 
 * @example
 * parseSeasons("Mùa hè, Thời tiết mát mẻ") → ["Summer", "Fall"]
 * parseSeasons("Mùa xuân") → ["Spring"]
 */
export function parseSeasons(weatherString: string): string[] {
  if (!weatherString?.trim()) {
    return [];
  }

  const parts = weatherString
    .toLowerCase()
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const seasons = parts
    .map(part => SEASON_MAP[part])
    .filter(Boolean);

  // Remove duplicates
  return [...new Set(seasons)];
}

/**
 * Convert base64 image string to File object
 * 
 * @param base64 - Base64 encoded image string
 * @param filename - Desired filename
 * @returns File object ready for upload
 */
export async function base64ToFile(base64: string, filename: string): Promise<File> {
  const response = await fetch(base64);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
}

/**
 * Parse AI response to wizard form updates
 * 
 * @param aiResponse - Response from /items/summary API
 * @returns Partial wizard form data to update
 */
export function parseAIResponseToFormData(aiResponse: ImageSummaryResponse['data']) {
  return {
    // AI description as notes
    notes: aiResponse.aiDescription || '',
    
    // Parse colors
    colors: parseColors(aiResponse.color),
    
    // Parse seasons
    seasons: parseSeasons(aiResponse.weatherSuitable),
    
    // Direct mappings
    pattern: aiResponse.pattern || '',
    fabric: aiResponse.fabric || '',
    condition: aiResponse.condition || 'Mới',
    
    // Image with background removed
    imageRemBgURL: aiResponse.imageRemBgURL || '',
  };
}

/**
 * Suggest item name from AI description
 * Uses brand and category if available
 */
export function suggestItemName(options: {
  aiDescription?: string;
  brand?: string;
  categoryName?: string;
  colors?: ColorOption[];
}): string {
  const parts: string[] = [];

  // Add color
  if (options.colors && options.colors.length > 0) {
    parts.push(options.colors[0].name);
  }

  // Add brand
  if (options.brand) {
    parts.push(options.brand);
  }

  // Add category
  if (options.categoryName) {
    parts.push(options.categoryName);
  }

  // Fallback to AI description (first 50 chars)
  if (parts.length === 0 && options.aiDescription) {
    return options.aiDescription.slice(0, 50);
  }

  return parts.join(' ') || 'New Item';
}

/**
 * Validate AI response data
 */
export function validateAIResponse(response: ImageSummaryResponse): boolean {
  if (!response?.data) return false;
  
  // Must have at least image URL
  if (!response.data.imageRemBgURL) return false;
  
  return true;
}


