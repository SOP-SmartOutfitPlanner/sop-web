/**
 * EXAMPLE: How to integrate Wizard Form with existing project
 * 
 * This file shows how to use the wizard form and transform data for API
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';
import { useWardrobeStore } from '@/store/wardrobe-store';
import { wardrobeAPI } from '@/lib/api/wardrobe-api';
import { transformWizardDataToAPI, validateWizardFormData, getUserIdFromAuth } from '@/lib/utils/wizard-transform';
import type { WizardFormData } from '@/lib/utils/wizard-transform';

// Import wizard components (copy từ Lovable vào folder này)
// import { AddItemWizard } from '@/components/wardrobe/wizard/AddItemWizard';

export function WardrobePageExample() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const { user } = useAuthStore();
  const { fetchItems } = useWardrobeStore();

  /**
   * Handle wizard form submission
   */
  const handleWizardSubmit = async (formData: WizardFormData) => {
    try {
      // 1. Validate form data
      const errors = validateWizardFormData(formData);
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
        return;
      }

      // 2. Get user ID
      const userId = await getUserIdFromAuth(user);

      // 3. Transform wizard data to API format
      const apiPayload = transformWizardDataToAPI(formData, userId);

      console.log('Submitting to API:', apiPayload);

      // 4. Call API to create item
      const newItem = await wardrobeAPI.createItem(apiPayload);
      
      console.log('Item created:', newItem);

      // 5. Refresh wardrobe items
      await fetchItems();

      // 6. Show success message
      toast.success('Item added successfully!');

      // 7. Close wizard
      setWizardOpen(false);

    } catch (error) {
      console.error('Failed to create item:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to create item. Please try again.'
      );
    }
  };

  return (
    <div>
      {/* Existing wardrobe UI */}
      <button onClick={() => setWizardOpen(true)}>
        Add Item (Wizard)
      </button>

      {/* Wizard Dialog */}
      {/* <AddItemWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onSubmit={handleWizardSubmit}
      /> */}
    </div>
  );
}

/**
 * EXAMPLE: Direct API call without wizard
 */
export async function createItemDirectly() {
  const exampleFormData: WizardFormData = {
    uploadedImageURL: 'https://example.com/photo.jpg',
    imageRemBgURL: 'https://example.com/photo-nobg.jpg',
    name: 'White Cotton T-Shirt',
    categoryId: 1,
    categoryName: 'Top',
    brand: 'Uniqlo',
    notes: 'Comfortable everyday tee',
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Navy', hex: '#1F345A' }
    ],
    seasons: ['Summer', 'Spring'],
    occasions: ['Casual', 'Work'],
    pattern: 'Solid',
    fabric: 'Cotton',
    condition: 'Mới',
    tags: ['basic', 'minimal'],
    frequencyWorn: 0,
    lastWornAt: null,
    wornToday: false,
  };

  const userId = 1; // Get from auth

  // Transform to API format
  const apiPayload = transformWizardDataToAPI(exampleFormData, userId);

  console.log('API Payload:', apiPayload);
  /**
   * Output:
   * {
   *   userId: 1,
   *   name: 'White Cotton T-Shirt',
   *   categoryId: 1,
   *   categoryName: 'Top',
   *   color: 'White, Navy',
   *   aiDescription: 'Comfortable everyday tee',
   *   brand: 'Uniqlo',
   *   frequencyWorn: '0',
   *   lastWornAt: undefined,
   *   imgUrl: 'https://example.com/photo-nobg.jpg',
   *   weatherSuitable: 'Summer, Spring',
   *   condition: 'Mới',
   *   pattern: 'Solid',
   *   fabric: 'Cotton',
   *   tag: 'basic, minimal, Casual, Work'
   * }
   */

  // Call API
  const newItem = await wardrobeAPI.createItem(apiPayload);
  return newItem;
}


