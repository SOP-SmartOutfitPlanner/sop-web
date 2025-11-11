"use client";

import { X, Trash2 } from "lucide-react";
import GlassButton from "@/components/ui/glass-button";
import { useScrollLock } from "@/hooks/useScrollLock";
import Image from "next/image";

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
  // Lock scroll when modal is open
  useScrollLock(open);

  const handleConfirm = () => {
    onConfirm();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed h-full inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => !isDeleting && onOpenChange(false)}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-[480px] max-w-[95vw] rounded-3xl overflow-hidden shadow-2xl pointer-events-auto relative flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-blue-900/80 to-slate-900/85">
            <div className="absolute top-0 -right-32 w-[400px] h-[400px] bg-blue-200/15 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] bg-cyan-200/15 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col">
            {/* Header */}
            <div className="px-6 pt-5 pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-dela-gothic text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                    Delete Item
                  </h2>
                  <p className="font-bricolage text-sm text-gray-200 mt-0.5">
                    This action cannot be undone
                  </p>
                </div>
                <button
                  onClick={() => !isDeleting && onOpenChange(false)}
                  disabled={isDeleting}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
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
                  Are you sure you want to delete this item? This will remove it from your wardrobe and all associated outfits.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 pt-3 flex-shrink-0 border-t border-white/10">
              <div className="flex items-center justify-end gap-3">
                <GlassButton
                  variant="outline"
                  size="md"
                  onClick={() => onOpenChange(false)}
                  disabled={isDeleting}
                  className="text-base"
                >
                  Cancel
                </GlassButton>
                <GlassButton
                  variant="custom"
                  size="md"
                  onClick={handleConfirm}
                  disabled={isDeleting}
                  backgroundColor="rgba(239, 68, 68, 0.8)"
                  borderColor="rgba(239, 68, 68, 1)"
                  className="min-w-[120px] text-base"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Item
                    </>
                  )}
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
