"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image } from "antd";
import { X } from "lucide-react";
import type { AdminReportDetail } from "@/lib/api/admin-api";

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportDetail: AdminReportDetail;
}

export function ImageGalleryModal({
  isOpen,
  onClose,
  reportDetail,
}: ImageGalleryModalProps) {
  const totalImagesCount = reportDetail.content.images?.length || 0;

  if (totalImagesCount === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-3xl w-[95vw] max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/98 backdrop-blur-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">All Images</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {totalImagesCount} image{totalImagesCount > 1 ? "s" : ""} from
                Content #{reportDetail.content.contentId}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {reportDetail.content.images?.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="relative group overflow-hidden rounded-lg border-2 border-slate-200 hover:border-blue-400 transition-all bg-slate-50 shadow-sm hover:shadow-md"
              >
                <Image
                  src={image}
                  alt={`Content #${reportDetail.content.contentId} - image ${
                    index + 1
                  }`}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs font-semibold text-white">
                    Image {index + 1} of {totalImagesCount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

