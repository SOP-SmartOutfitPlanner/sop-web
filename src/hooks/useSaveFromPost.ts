import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { communityAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

/**
 * Hook for saving/unsaving an item from a post
 */
export function useSaveItemFromPost(
  itemId: number,
  postId: number,
  initialIsSaved: boolean = false
) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isSaved, setIsSaved] = useState(initialIsSaved);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return communityAPI.saveItemFromPost(itemId, postId);
    },
    onMutate: () => {
      // Optimistic update
      setIsSaved(true);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["savedItemsFromPosts"] });
      toast.success("Item saved to your wardrobe!");
    },
    onError: (error: Error) => {
      // Revert optimistic update
      setIsSaved(false);
      console.error("Error saving item:", error);
      if (error.message.includes("already saved")) {
        toast.info("This item is already saved");
        setIsSaved(true); // It's actually saved
      } else {
        toast.error("Failed to save item");
      }
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return communityAPI.unsaveItemFromPost(itemId, postId);
    },
    onMutate: () => {
      // Optimistic update
      setIsSaved(false);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["savedItemsFromPosts"] });
      toast.success("Item removed from saved");
    },
    onError: (error: Error) => {
      // Revert optimistic update
      setIsSaved(true);
      console.error("Error unsaving item:", error);
      toast.error("Failed to remove item");
    },
  });

  const toggleSave = useCallback(() => {
    if (!user?.id) {
      toast.error("Please login to save items");
      return;
    }
    if (isSaved) {
      unsaveMutation.mutate();
    } else {
      saveMutation.mutate();
    }
  }, [isSaved, saveMutation, unsaveMutation, user?.id]);

  return {
    isSaved,
    isLoading: saveMutation.isPending || unsaveMutation.isPending,
    toggleSave,
    saveItem: saveMutation.mutate,
    unsaveItem: unsaveMutation.mutate,
  };
}

/**
 * Hook for saving/unsaving an outfit from a post
 */
export function useSaveOutfitFromPost(
  outfitId: number,
  postId: number,
  initialIsSaved: boolean = false
) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isSaved, setIsSaved] = useState(initialIsSaved);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return communityAPI.saveOutfitFromPost(outfitId, postId);
    },
    onMutate: () => {
      // Optimistic update
      setIsSaved(true);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["savedOutfitsFromPosts"] });
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
      queryClient.invalidateQueries({ queryKey: ["saved-outfits"] }); // Invalidate saved outfits list
      toast.success("Outfit saved to your collection!");
    },
    onError: (error: Error) => {
      // Revert optimistic update
      setIsSaved(false);
      console.error("Error saving outfit:", error);
      if (error.message.includes("already saved")) {
        toast.info("This outfit is already saved");
        setIsSaved(true); // It's actually saved
      } else {
        toast.error("Failed to save outfit");
      }
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return communityAPI.unsaveOutfitFromPost(outfitId, postId);
    },
    onMutate: () => {
      // Optimistic update
      setIsSaved(false);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["savedOutfitsFromPosts"] });
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
      queryClient.invalidateQueries({ queryKey: ["saved-outfits"] }); // Invalidate saved outfits list
      toast.success("Outfit removed from saved");
    },
    onError: (error: Error) => {
      // Revert optimistic update
      setIsSaved(true);
      console.error("Error unsaving outfit:", error);
      toast.error("Failed to remove outfit");
    },
  });

  const toggleSave = useCallback(() => {
    if (!user?.id) {
      toast.error("Please login to save outfits");
      return;
    }
    if (isSaved) {
      unsaveMutation.mutate();
    } else {
      saveMutation.mutate();
    }
  }, [isSaved, saveMutation, unsaveMutation, user?.id]);

  return {
    isSaved,
    isLoading: saveMutation.isPending || unsaveMutation.isPending,
    toggleSave,
    saveOutfit: saveMutation.mutate,
    unsaveOutfit: unsaveMutation.mutate,
  };
}
