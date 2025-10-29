/**
 * Wizard Form Constants
 */

import type { CategoryOption, ColorOption } from './types';

/**
 * Category options (updated to match API)
 */
export const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 1, name: 'Top', group: 'Top' },
  { id: 2, name: 'Bottom', group: 'Bottom' },
  { id: 3, name: 'Shoes', group: 'Shoes' },
  { id: 4, name: 'Outerwear', group: 'Outerwear' },
  { id: 5, name: 'Accessory', group: 'Accessory' },
  { id: 6, name: 'Dress', group: 'Dress' },
  { id: 7, name: 'Underwear', group: 'Underwear' },
];

/**
 * Brand options
 */
export const BRAND_OPTIONS = [
  'Uniqlo',
  'Zara', 
  'Nike',
  'COS',
  'H&M',
  'Adidas',
  'GAP',
  "Levi's",
  'Other'
];

/**
 * Default color palette
 */
export const DEFAULT_COLORS: ColorOption[] = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
  { name: 'Beige', hex: '#E6D8B6' },
  { name: 'Navy', hex: '#1F345A' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Blue', hex: '#0066CC' },
  { name: 'Red', hex: '#DC143C' },
  { name: 'Green', hex: '#228B22' },
  { name: 'Yellow', hex: '#FFD700' },
  { name: 'Pink', hex: '#FFB6C1' },
  { name: 'Purple', hex: '#9370DB' },
];

/**
 * Season options with emoji
 */
export const SEASONS = [
  { name: 'Spring', emoji: '🌱' },
  { name: 'Summer', emoji: '☀️' },
  { name: 'Fall', emoji: '🍂' },
  { name: 'Winter', emoji: '❄️' },
  { name: 'All-year', emoji: '🌎' },
];

/**
 * Pattern options
 */
export const PATTERNS = [
  'Solid',
  'Stripe', 
  'Logo',
  'Print',
  'Check',
  'Dot',
  'Other'
];

/**
 * Fabric options
 */
export const FABRICS = [
  'Cotton',
  'Linen',
  'Wool',
  'Polyester',
  'Denim',
  'Leather',
  'Silk',
  'Other'
];

/**
 * Condition options
 */
export const CONDITIONS = [
  'New',
  'Like new',
  'Good',
  'Used'
];

/**
 * Tag suggestions
 */
export const TAG_SUGGESTIONS = [
  'basic',
  'office',
  'minimal',
  'casual',
  'vintage',
  'trendy',
  'comfortable',
  'formal'
];


