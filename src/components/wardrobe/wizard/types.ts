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
  weatherSuitable?: string;       // Weather type from AI
  
  // Worn tracking
  wornToday: boolean;             // Converted to frequencyWorn + lastWornAt
  
  // IDs for relational data (extracted from AI suggestions)
  styleIds?: number[];            // Array of style IDs
  occasionIds?: number[];         // Array of occasion IDs
}

/**
 * AI Suggestions from /items/analysis API
 * Updated to match actual API response structure
 */
export interface AISuggestions {
  name: string;                               // Item name from AI
  colors: ColorOption[];                      // Array of colors (not single object)
  aiDescription: string;
  weatherSuitable: string;
  condition: string;
  pattern: string;
  fabric: string;
  imageRemBgURL: string;
  category: { id: number; name: string };     // Category object
  styles: { id: number; name: string }[];     // Array of styles
  occasions: { id: number; name: string }[];  // Array of occasions
  seasons: { id: number; name: string }[];    // Array of seasons
}

/**
 * Category option
 */
export interface CategoryOption {
  id: number;
  name: string;
  group: string;
}


