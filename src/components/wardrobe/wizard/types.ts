/**
 * Wizard Form Types
 * Updated to match SOP API structure
 */

export interface ColorOption {
  name: string;
  hex: string;
}

/**
 * Wizard form data structure
 * Note: 'occasions' field removed (not in API)
 */
export interface WizardFormData {
  // Images
  uploadedImageURL: string;      // Local preview only
  imageRemBgURL: string;          // From AI, sent to API as imgUrl
  
  // Basic info
  name: string;
  categoryId: number;
  categoryName: string;
  brand: string;
  notes: string;                  // Sent to API as aiDescription
  
  // Details (arrays, will be joined to strings for API)
  colors: ColorOption[];
  seasons: string[];
  tags: string[];
  
  // Item details
  pattern: string;
  fabric: string;
  condition: string;
  
  // Worn tracking
  wornToday: boolean;             // Converted to frequencyWorn + lastWornAt
}

/**
 * AI Suggestions from /items/analysis API
 * Updated to match new response structure
 */
export interface AISuggestions {
  color: { name: string; hex: string };  // Now returns object
  aiDescription: string;
  weatherSuitable: string;
  condition: string;
  pattern: string;
  fabric: string;
  imageRemBgURL: string;
  style: { id: number; name: string };
  occasion: { id: number; name: string };
  season: { id: number; name: string };
}

/**
 * Category option
 */
export interface CategoryOption {
  id: number;
  name: string;
  group: string;
}


