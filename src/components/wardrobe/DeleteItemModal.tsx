"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import { ConfirmModal } from "@/components/common/ConfirmModal";

export interface DeleteItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName?: string;
  itemImageUrl?: string;
  isDeleting?: boolean;
}

export function DeleteItemModal({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  itemImageUrl,
  isDeleting = false,
}: DeleteItemModalProps) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="Delete Item"
      subtitle="This action cannot be undone"
      confirmButtonText="Delete Item"
      confirmButtonIcon={<Trash2 className="w-4 h-4 mr-2" />}
      isLoading={isDeleting}
      loadingText="Deleting..."
      maxWidth="480px"
    >
      {/* Item Preview */}
      {itemImageUrl && (
        <div className="flex items-center gap-4 mb-4 p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
            <Image
              src={itemImageUrl}
              alt={itemName || "Item"}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bricolage font-semibold text-white text-base truncate">
              {itemName || "Untitled Item"}
            </h3>
            <p className="font-bricolage text-sm text-gray-300 mt-0.5">
              This item will be permanently deleted
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Message */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="font-bricolage text-sm text-gray-200 leading-relaxed">
          Are you sure you want to delete this item? This will remove it from
          your wardrobe and all associated outfits.
        </p>
      </div>
    </ConfirmModal>
  );
}
