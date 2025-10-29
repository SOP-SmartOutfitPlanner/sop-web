/**
 * Transform Wizard Form Data to API Format
 * 
 * This utility helps convert the multi-step wizard form data structure
 * to the format expected by the backend API.
 */

import type { CreateWardrobeItemRequest } from '@/lib/api/wardrobe-api';

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
}

export interface ColorOption {
  name: string;
  hex: string;
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
  // Join color names
  const colorString = formData.colors.length > 0
    ? formData.colors.map(c => c.name).join(', ')
    : 'Unknown';

  // Join seasons
  const weatherString = formData.seasons.length > 0
    ? formData.seasons.join(', ')
    : '';

  // Process tags (occasions field removed as it's not supported by API)
  const tagString = formData.tags.length > 0 
    ? formData.tags.join(', ') 
    : undefined;

  // Handle worn today
  const frequencyWorn = formData.wornToday ? "1" : "0";
  const lastWornAt = formData.wornToday ? new Date().toISOString() : undefined;

  // IMPORTANT: Backend only accepts URL from AI, NOT base64
  // Use removed background image from AI (required)
  const imgUrl = formData.imageRemBgURL || '';

  // Generate AI description from notes or auto-generate
  const aiDescription = formData.notes?.trim() 
    || `${formData.brand} ${formData.name}`.trim()
    || formData.name;

  return {
    userId,
    name: formData.name,
    categoryId: formData.categoryId,
    categoryName: formData.categoryName,
    color: colorString,
    aiDescription,
    brand: formData.brand || undefined,
    frequencyWorn,
    lastWornAt,
    imgUrl,
    weatherSuitable: weatherString,
    condition: formData.condition || 'Mới',
    pattern: formData.pattern || 'Solid',
    fabric: formData.fabric || 'Cotton',
    tag: tagString,
  };
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


