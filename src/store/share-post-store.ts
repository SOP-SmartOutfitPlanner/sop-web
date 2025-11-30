/**
 * Share Post Store
 * Manages state for sharing content (like virtual try-on results) to community posts
 */

import { create } from "zustand";

interface SharePostData {
  imageUrl: string | null;
  caption: string;
  outfitId?: number;
  itemIds?: number[];
}

interface SharePostStore {
  shareData: SharePostData | null;
  setShareData: (data: SharePostData | null) => void;
  clearShareData: () => void;
}

export const useSharePostStore = create<SharePostStore>((set) => ({
  shareData: null,
  
  setShareData: (data) => set({ shareData: data }),
  
  clearShareData: () => set({ shareData: null }),
}));
