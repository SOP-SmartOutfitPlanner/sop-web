"use client";

import { useState } from "react";
import { X, Calendar, Clock, MapPin, Edit, Shirt } from "lucide-react";
import { format } from "date-fns";
import GlassButton from "@/components/ui/glass-button";
import { UserOccasion } from "@/types/userOccasion";
import { Calender } from "@/types/calendar";
import { UserOccasionFormModal } from "@/components/calendar/UserOccasionFormModal";
import { useModalScroll } from "@/hooks/useModalScroll";
import Image from "next/image";

interface OccasionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  occasion: UserOccasion;
  outfits: Calender[];
  selectedDate: Date;
  onRefetch?: () => void;
}

export function OccasionDetailModal({
  open,
  onOpenChange,
  occasion,
  outfits,
  selectedDate,
  onRefetch,
}: OccasionDetailModalProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  useModalScroll(open);

  if (!open) return null;

  // Format time strings
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    if (timeStr.includes("T")) {
      const timePart = timeStr.split("T")[1];
      return timePart.substring(0, 5);
    }
    return timeStr.substring(0, 5);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "EEEE, MMMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = (isOpen: boolean) => {
    setIsEditModalOpen(isOpen);
    if (!isOpen && onRefetch) {
      onRefetch();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 pb-4 border-b border-cyan-500/20 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Occasion Type Badge */}
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-100 rounded-full border border-cyan-400/40 mb-3">
                  {occasion.occasionName}
                </span>
                
                {/* Occasion Name */}
                <h2 className="text-2xl font-bricolage font-bold text-white mb-2">
                  {occasion.name}
                </h2>
                
                {/* Date */}
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm">{formatDate(occasion.dateOccasion)}</span>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 min-h-0">
            {/* Time and Description Section */}
            <div className="space-y-4 mb-6">
              {/* Time */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-xl border border-cyan-500/20">
                <Clock className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Time</p>
                  <p className="text-lg font-semibold text-white">
                    {formatTime(occasion.startTime)} → {formatTime(occasion.endTime)}
                  </p>
                </div>
              </div>

              {/* Description */}
              {occasion.description && (
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <p className="text-xs text-gray-400 mb-2">Description</p>
                  <p className="text-gray-200">{occasion.description}</p>
                </div>
              )}
            </div>

            {/* Outfits Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bricolage font-semibold text-white flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-cyan-400" />
                  Outfits ({outfits.length})
                </h3>
              </div>

              {outfits.length === 0 ? (
                <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <Shirt className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No outfits added yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Generate outfit suggestions to add outfits for this occasion
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {outfits.map((outfit) => (
                    <div
                      key={outfit.calendarId}
                      className="p-4 bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60 rounded-xl border border-slate-600/30 hover:border-cyan-500/30 transition-colors"
                    >
                      {/* Outfit Name */}
                      <h4 className="font-semibold text-white mb-3">
                        {outfit.outfitDetails?.name || outfit.outfitName}
                      </h4>

                      {/* Items Grid */}
                      {outfit.outfitDetails?.items && outfit.outfitDetails.items.length > 0 && (
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                          {outfit.outfitDetails.items.map((item) => (
                            <div
                              key={item.itemId}
                              className="relative aspect-square rounded-lg overflow-hidden bg-slate-700/50 border border-slate-600/30 group"
                            >
                              <Image
                                src={item.imgUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                              {/* Hover overlay with item name */}
                              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                                <p className="text-[10px] text-white leading-tight line-clamp-2">
                                  {item.name}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Outfit description if available */}
                      {outfit.outfitDetails?.description && (
                        <p className="text-sm text-gray-400 mt-3 line-clamp-2">
                          {outfit.outfitDetails.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-4 border-t border-cyan-500/20 flex justify-end gap-3 flex-shrink-0">
            <GlassButton
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Close
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={handleEditClick}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Occasion
            </GlassButton>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <UserOccasionFormModal
          open={isEditModalOpen}
          onOpenChange={handleEditModalClose}
          selectedDate={selectedDate}
          editingOccasion={occasion}
        />
      )}
    </>
  );
}
