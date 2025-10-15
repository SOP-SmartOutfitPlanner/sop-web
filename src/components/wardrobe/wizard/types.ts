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
 * AI Suggestions from /items/summary API
 * Response is in Vietnamese
 */
export interface AISuggestions {
  color: string;                  // Vietnamese: "Đen", "Trắng"...
  aiDescription: string;          // Vietnamese description
  weatherSuitable: string;        // Vietnamese: "Mùa hè, Thời tiết mát mẻ"
  condition: string;              // Vietnamese: "Mới", "Như mới"...
  pattern: string;                // Vietnamese: "Logo, Chuyển màu"...
  fabric: string;                 // Vietnamese: "Cotton"...
  imageRemBgURL: string;          // URL of image with background removed
  
  // Parsed fields (for UI convenience)
  colors?: ColorOption[];         // Parsed from color string
  seasons?: string[];             // Parsed from weatherSuitable
}

/**
 * Category option
 */
export interface CategoryOption {
  id: number;
  name: string;
  group: string;
}


