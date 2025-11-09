/**
 * Wardrobe Components - Centralized Barrel Export
 * Organized by feature area for better tree-shaking and clarity
 */

// Grid Components
export { ItemCard, ItemGrid, InfiniteItemGrid } from './grids';

// Header Components  
export { WardrobeHeader, Toolbar } from './header';

// Sidebar Components
export { SidebarStats, FillGoal } from './sidebar';

// Upload Components
export { ImageUpload, ImageCropper, TagInput } from './upload';

// Wizard Components (keep existing structure)
export { AddItemWizard } from './wizard/AddItemWizard';

// Main Content Component
export { WardrobeContent } from './wardrobe-content';

// Onboarding Components (keep as-is, no restructure)
export { OnboardingDialog } from './onboarding-dialog';
