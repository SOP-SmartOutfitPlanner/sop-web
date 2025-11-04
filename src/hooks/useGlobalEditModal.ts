"use client";

import { create } from "zustand";

interface GlobalEditModalState {
  isOpen: boolean;
  editItemId: number | null;
  
  // Actions
  openEditModal: (itemId: number) => void;
  closeEditModal: () => void;
}

/**
 * Global store for opening edit modal from anywhere in the app
 * Use case: Click "Edit" from success toast after upload
 */
export const useGlobalEditModal = create<GlobalEditModalState>((set) => ({
  isOpen: false,
  editItemId: null,

  openEditModal: (itemId: number) => {
    console.log("🔓 [GLOBAL] Opening edit modal for item:", itemId);
    set({ isOpen: true, editItemId: itemId });
  },

  closeEditModal: () => {
    console.log("🔒 [GLOBAL] Closing edit modal");
    set({ isOpen: false, editItemId: null });
  },
}));
