"use client";

import { X, AlertTriangle, Calendar, TrendingUp } from "lucide-react";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import GlassButton from "@/components/ui/glass-button";
import GlassCard from "@/components/ui/glass-card";

interface AffectedItem {
  itemId: number;
  itemName: string;
  itemImageUrl: string;
  categoryName: string;
  lastWornAt: string;
  wornDatesInRange: string[];
  timesWornInRange: number;
}

interface GapDayWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  affectedItems: AffectedItem[];
  gapDays: number;
  isLoading?: boolean;
}

export function GapDayWarningDialog({
  open,
  onOpenChange,
  onConfirm,
  affectedItems,
  gapDays,
  isLoading = false,
}: GapDayWarningDialogProps) {
  if (!open) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={handleCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-slate-900/95 backdrop-blur-xl border border-white/10 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-400/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="font-bricolage text-xl font-bold text-white">
                    Recently Worn Items Detected
                  </h2>
                  <p className="text-sm text-white/70 mt-1">
                    {affectedItems.length} item{affectedItems.length > 1 ? "s" : ""} in
                    this outfit {affectedItems.length > 1 ? "were" : "was"} worn
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 flex-shrink-0"
                title="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div
            className="flex-1 px-6 py-6 overflow-y-auto overflow-x-hidden
              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-track]:bg-white/10
              [&::-webkit-scrollbar-track]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-purple-400/60
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:hover:bg-purple-400/80"
          >
            <div className="space-y-3">
              {affectedItems.map((item) => (
                <GlassCard
                  key={item.itemId}
                  padding="1rem"
                  borderRadius="16px"
                  blur="8px"
                  brightness={1.05}
                  className="bg-white/5 border border-white/10 hover:border-blue-400/30 transition-all"
                >
                  <div className="flex gap-4">
                    {/* Item Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 relative">
                      <Image
                        src={item.itemImageUrl}
                        alt={item.itemName}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <h3 className="font-bricolage font-semibold text-white text-sm truncate">
                            {item.itemName}
                          </h3>
                          <p className="text-xs text-white/60">{item.categoryName}</p>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-400/30 flex-shrink-0">
                          <TrendingUp className="w-3 h-3 text-yellow-300" />
                          <span className="text-xs font-medium text-yellow-200">
                            {item.timesWornInRange}x
                          </span>
                        </div>
                      </div>

                      {/* Worn Dates */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-white/50">
                          <Calendar className="w-3 h-3" />
                          <span>Recently worn on:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {item.wornDatesInRange.map((date, idx) => {
                            const dateObj = parseISO(date);
                            const displayDate = format(dateObj, "MMM dd, yyyy 'at' h:mm a");

                            return (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-white/10 text-xs text-white/80"
                              >
                                {displayDate}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Warning Message */}
            <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-400/20">
              <p className="text-sm text-yellow-200/90 leading-relaxed">
                💡 <strong>Tip:</strong> Wearing different items can help maintain the
                condition of your wardrobe and create more diverse outfits. However, you
                can still add this outfit if needed.
              </p>
            </div>
          </div>

          {/* Footer - Actions */}
          <div className="px-6 py-4 border-t border-white/10 bg-slate-900/50">
            <div className="flex items-center justify-end gap-3">
              <GlassButton
                variant="ghost"
                size="md"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </GlassButton>
              <GlassButton
                variant="primary"
                size="md"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Anyway"}
              </GlassButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
