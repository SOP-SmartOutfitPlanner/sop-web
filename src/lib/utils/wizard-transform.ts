/**
 * Transform Wizard Form Data to API Format
 * 
 * This utility helps convert the multi-step wizard form data structure
 * to the format expected by the backend API.
 */

import type { CreateWardrobeItemRequest, ApiWardrobeItem } from '@/lib/api/wardrobe-api';

/**
 * Wizard form data structure (from Lovable wizard)
 * Note: 'occasions' field removed - not supported by API
 */
export interface WizardFormData {
  uploadedImageURL: string;
  imageRemBgURL: string;
  name: string;
  categoryId: number;
  categoryName: string;
  brand: string;
  notes: string;
  colors: ColorOption[];
  seasons: string[];
  pattern: string;
  fabric: string;
  condition: string;
  tags: string[];
  wornToday: boolean;
  weatherSuitable?: string;
  // IDs for relational data
  styleIds?: number[];
  occasionIds?: number[];
}

export interface ColorOption {
  name: string;
  hex: string;
}

/**
 * AI Analysis Response (from wardrobeAPI.getImageSummary)
 */
export interface AIAnalysisResponse {
  name: string;
  colors: { name: string; hex: string }[];
  aiDescription: string;
  weatherSuitable: string;
  condition: string;
  pattern: string;
  fabric: string;
  imageRemBgURL: string;
  category: { id: number; name: string };
  styles: { id: number; name: string }[];
  occasions: { id: number; name: string }[];
  seasons: { id: number; name: string }[];
}

/**
 * Transform wizard form data to API request format
 * 
 * @param formData - Data from the wizard form
 * @param userId - Current user's ID
 * @returns API request payload
 */
export function transformWizardDataToAPI(
  formData: WizardFormData,
  userId: number
): CreateWardrobeItemRequest {
  // Store colors as JSON string array (preserves hex codes from AI)
  const colorString = formData.colors.length > 0
    ? JSON.stringify(formData.colors)
    : JSON.stringify([{ name: 'Unknown', hex: '#808080' }]);

  // Join seasons - MUST NOT BE EMPTY (backend constraint)
  const weatherString = formData.seasons.length > 0
    ? formData.seasons.join(', ')
    : 'All Season'; // Fallback instead of empty string

  // Process tags (occasions field removed as it's not supported by API)
  const tagString = formData.tags.length > 0 
    ? formData.tags.join(', ') 
    : undefined;

  // IMPORTANT: Backend only accepts URL from AI, NOT base64
  // Use removed background image from AI (required)
  const imgUrl = formData.imageRemBgURL || '';

  // Generate AI description from notes or auto-generate
  let aiDescription = formData.notes?.trim() 
    || `${formData.brand} ${formData.name}`.trim()
    || formData.name;
  
  // Truncate long fields to prevent DB constraint violations
  const truncate = (str: string, maxLength: number) => {
    return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
  };

  // Ensure name is reasonable length (DB might have VARCHAR(200) constraint)
  const safeName = truncate(formData.name || 'Untitled Item', 200);
  
  // Ensure aiDescription fits DB constraint (often VARCHAR(500) or VARCHAR(1000))
  aiDescription = truncate(aiDescription, 500);

  // Build payload matching Swagger format exactly
  const payload = {
    userId,
    name: safeName,
    categoryId: formData.categoryId,
    categoryName: formData.categoryName || 'General',
    color: colorString,
    aiDescription,
    brand: formData.brand || undefined,
    imgUrl,
    weatherSuitable: weatherString,
    condition: formData.condition || 'New',
    pattern: truncate(formData.pattern || 'Solid', 100),
    fabric: truncate(formData.fabric || 'Cotton', 100),
    tag: tagString,
    styleIds: formData.styleIds || undefined,
    occasionIds: formData.occasionIds || undefined,
    seasonIds: undefined,
  } as CreateWardrobeItemRequest;

  return payload;
}

/**
 * Validate wizard form data before submission
 * 
 * @param formData - Data to validate
 * @returns Array of error messages (empty if valid)
 */
export function validateWizardFormData(formData: WizardFormData): string[] {
  const errors: string[] = [];

  // Must have name
  if (!formData.name?.trim()) {
    errors.push('Item name is required');
  }

  // Must have category
  if (!formData.categoryName) {
    errors.push('Category is required');
  }

  // Validate category ID
  if (formData.categoryId <= 0) {
    errors.push('Invalid category');
  }

  // Must have imageRemBgURL from AI (backend requirement)
  if (!formData.imageRemBgURL?.trim()) {
    errors.push('Please analyze the image with AI first (click "Analyze with AI")');
  }

  return errors;
}

/**
 * Get user ID from auth store or token
 * Helper function to extract user ID for API calls
 */
export async function getUserIdFromAuth(user: { id?: string } | null): Promise<number> {
  if (user?.id) {
    return parseInt(user.id);
  }

  // Fallback to token
  const token = localStorage.getItem("accessToken");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Backend uses "UserId" (capital U) in JWT
      const userId = payload?.UserId || payload?.id;
      if (userId) {
        return parseInt(userId);
      }
    } catch (error) {
      console.error('Failed to parse token:', error);
    }
  }

  throw new Error('User ID not found');
}

/**
 * Transform API wardrobe item to wizard form data
 * 
 * This is the reverse transformation for editing existing items.
 * Converts ApiWardrobeItem (from GET /items) to WizardFormData (for wizard form).
 * 
 * @param apiItem - Item data from API
 * @returns Form data structure for wizard
 */
export function apiItemToFormData(apiItem: ApiWardrobeItem): Partial<WizardFormData> {
  // Parse colors - supports both JSON array format and legacy comma-separated
  let colors: ColorOption[] = [];
  
  if (apiItem.color) {
    try {
      // Try parse as JSON array first (new format from AI)
      const parsed = JSON.parse(apiItem.color);
      if (Array.isArray(parsed)) {
        colors = parsed.map((c: { name?: string; hex?: string }) => ({
          name: c.name || 'Unknown',
          hex: c.hex || '#808080',
        }));
      }
    } catch {
      // Fallback: legacy comma-separated string (e.g., "White, Dark Green")
      colors = apiItem.color.split(',').map((colorName: string) => ({
        name: colorName.trim(),
        hex: '#808080', // Gray placeholder for legacy data
      }));
    }
  }

  // Parse seasons from comma-separated weatherSuitable string
  const seasons: string[] = apiItem.weatherSuitable
    ? apiItem.weatherSuitable.split(',').map((s: string) => s.trim())
    : [];

  // Parse tags from comma-separated tag string
  const tags: string[] = apiItem.tag
    ? apiItem.tag.split(',').map((t: string) => t.trim())
    : [];

  // Determine wornToday from frequencyWorn
  const wornToday = apiItem.frequencyWorn === '1' || parseInt(apiItem.frequencyWorn || '0') > 0;

  // Extract styleIds from styles array
  const styleIds: number[] = apiItem.styles
    ? apiItem.styles.map((style) => style.id)
    : [];

  // Extract occasionIds from occasions array
  const occasionIds: number[] = apiItem.occasions
    ? apiItem.occasions.map((occasion) => occasion.id)
    : [];

  return {
    name: apiItem.name || '',
    categoryId: apiItem.categoryId || 0,
    categoryName: apiItem.categoryName || '',
    brand: apiItem.brand || '',
    notes: apiItem.aiDescription || '',
    colors,
    seasons,
    pattern: apiItem.pattern || 'Solid',
    fabric: apiItem.fabric || 'Cotton',
    condition: apiItem.condition || 'New',
    tags,
    wornToday,
    weatherSuitable: apiItem.weatherSuitable || '',
    imageRemBgURL: apiItem.imgUrl || '',
    uploadedImageURL: apiItem.imgUrl || '', // Use same image for both
    styleIds,
    occasionIds,
  };
}

/**
 * Validate AI analysis response to check if it has sufficient data
 * 
 * @param result - AI analysis response
 * @returns { isValid: boolean, missingFields: string[], score: number }
 */
export function validateAIResponse(result: Partial<AIAnalysisResponse> | null | undefined): {
  isValid: boolean;
  missingFields: string[];
  score: number;
  details: {
    hasName: boolean;
    hasCategory: boolean;
    hasImage: boolean;
    hasColors: boolean;
    hasPattern: boolean;
    hasFabric: boolean;
    hasWeather: boolean;
  };
} {
  const missingFields: string[] = [];
  const CRITICAL_POINTS = 20;
  const IMPORTANT_POINTS = 10;
  
  const details = {
    hasName: Boolean(result?.name || result?.aiDescription),
    hasCategory: Boolean(result?.category?.id && result?.category?.name),
    hasImage: Boolean(result?.imageRemBgURL),
    hasColors: Boolean(result?.colors && result.colors.length > 0),
    hasPattern: Boolean(result?.pattern),
    hasFabric: Boolean(result?.fabric),
    hasWeather: Boolean(result?.weatherSuitable),
  };

  let score = 0;

  if (details.hasName) {
    score += CRITICAL_POINTS;
  } else {
    missingFields.push('name');
  }

  if (details.hasCategory) {
    score += CRITICAL_POINTS;
  } else {
    missingFields.push('category');
  }

  if (details.hasImage) {
    score += CRITICAL_POINTS;
  } else {
    missingFields.push('imageRemBgURL');
  }

  if (details.hasColors) score += IMPORTANT_POINTS;
  if (details.hasPattern) score += IMPORTANT_POINTS;
  if (details.hasFabric) score += IMPORTANT_POINTS;
  if (details.hasWeather) score += IMPORTANT_POINTS;

  const PASSING_SCORE = 60;
  const isValid = score >= PASSING_SCORE;

  return {
    isValid,
    missingFields,
    score,
    details,
  };
}
