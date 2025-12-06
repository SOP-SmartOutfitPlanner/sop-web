"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Calendar,
  Shirt,
  Clock,
  Plus,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { UserOccasion } from "@/types/userOccasion";
import { Outfit } from "@/types/outfit";
import { CalendarEntry, Calender } from "@/types/calendar";
import { PlannedOutfitsGrid } from "./PlannedOutfitsGrid";
import { AvailableOutfitsGrid } from "./AvailableOutfitsGrid";
import { ViewOutfitDialog } from "@/components/outfit/ViewOutfitDialog";
import GlassButton from "@/components/ui/glass-button";

interface OccasionItemProps {
  occasion: UserOccasion;
  isExpanded: boolean;
  plannedOutfits: Calender[];
  availableOutfits: Outfit[];
  selectedOutfits: number[];
  isCreatingEntry: boolean;
  isDeletingEntry: boolean;
  isLoadingOutfits: boolean;
  onToggle: () => void;
  onEdit: (occasion: UserOccasion, e?: React.MouseEvent) => void;
  onToggleSelection: (outfitId: number) => void;
  onToggleSelectAll: (outfitIds: number[]) => void;
  onBatchAdd: (e?: React.MouseEvent) => void;
  onAddSingle: (outfit: Outfit, e?: React.MouseEvent) => void;
  onDeleteEntry: (entryId: number, e?: React.MouseEvent) => void;
  onEditEntry: (entry: Calender, e?: React.MouseEvent) => void;
  onDeleteOccasion: (occasionId: number, e?: React.MouseEvent) => void;
  calendarEntries: CalendarEntry[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showFavoriteOnly: boolean;
  onFavoriteToggle: () => void;
  gapDay: number;
  onGapDayChange: (value: number) => void;
}

export function OccasionItem({
  occasion,
  isExpanded,
  plannedOutfits,
  availableOutfits,
  selectedOutfits,
  isCreatingEntry,
  isDeletingEntry,
  isLoadingOutfits,
  onToggle,
  onEdit,
  onToggleSelection,
  onToggleSelectAll,
  onBatchAdd,
  onAddSingle,
  onDeleteEntry,
  onEditEntry,
  onDeleteOccasion,
  calendarEntries,
  searchQuery,
  onSearchChange,
  showFavoriteOnly,
  onFavoriteToggle,
  gapDay,
  onGapDayChange,
}: OccasionItemProps) {
  const plannedCount = plannedOutfits.length;
  const [viewingOutfit, setViewingOutfit] = useState<Outfit | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAvailableModalOpen, setIsAvailableModalOpen] = useState(false);

  // Debug: Log when availableOutfits changes while modal is open
  // useEffect(() => {
  //   if (isAvailableModalOpen) {
  //     console.log('[OccasionItem] availableOutfits changed:', availableOutfits.length);
  //   }
  // }, [availableOutfits, isAvailableModalOpen]);

  // Check if the occasion has ended based on date only (not time)
  const isOccasionEnded = useMemo(() => {
    // Check if dateOccasion is before today (not including today)
    const occasionDate = parseISO(occasion.dateOccasion);
    const today = new Date();
    
    // Set both to start of day for comparison
    occasionDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    // Only disable if occasion is on a past date (not today)
    return occasionDate < today;
  }, [occasion.dateOccasion]);

  // Convert Calender to Outfit format
  const convertCalenderToOutfit = (calender: Calender): Outfit => {
    return {
      id: calender.outfitId,
      userId: calender.outfitDetails.userId,
      userDisplayName: calender.outfitDetails.userDisplayName,
      name: calender.outfitName,
      description: calender.outfitDetails.description || "",
      isFavorite: calender.outfitDetails.isFavorite,
      isSaved: calender.outfitDetails.isSaved,
      createdDate: calender.outfitDetails.createdDate,
      updatedDate: calender.outfitDetails.updatedDate,
      items: calender.outfitDetails.items.map((item) => ({
        id: item.itemId,
        itemId: item.itemId,
        name: item.name,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        color: item.color,
        brand: item.brand || "",
        frequencyWorn: item.frequencyWorn?.toString() || "0",
        lastWornAt: item.lastWornAt,
        imgUrl: item.imgUrl,
        weatherSuitable: item.weatherSuitable,
        condition: item.condition,
        pattern: item.pattern,
        fabric: item.fabric,
      })),
    };
  };

  const handleViewOutfit = (calender: Calender, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const outfit = convertCalenderToOutfit(calender);
    setViewingOutfit(outfit);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="border-2 border-transparent bg-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-purple-400/50">
      {/* Occasion Header Bar */}
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
        <div className="flex-1 flex items-center gap-4">
          {/* Expand/Collapse Button */}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-purple-300" />
            ) : (
              <ChevronDown className="w-5 h-5 text-purple-300" />
            )}
          </button>

          {/* Occasion Info */}
          <div className="flex-1" onClick={onToggle}>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/30 border border-purple-400/50">
                <Calendar className="w-3 h-3 text-purple-200" />
                <span className="text-xs font-medium text-purple-100">
                  {occasion.occasionName}
                </span>
              </div>
              {plannedCount > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/30 border border-cyan-400/50">
                  <Shirt className="w-3 h-3 text-cyan-200" />
                  <span className="text-xs font-medium text-cyan-100">
                    {plannedCount} outfit{plannedCount > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
            <h4 className="font-bricolage font-bold text-white text-lg">
              {occasion.name}
            </h4>
          <div className="flex items-center gap-3 mt-1 text-sm text-white/70">
            {(occasion.startTime || occasion.endTime) && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs">
                  {occasion.startTime
                    ? format(new Date(occasion.startTime), "h:mm a")
                    : "--"}
                </span>
                {occasion.endTime && (
                  <>
                    <span className="text-xs text-white/40">–</span>
                    <span className="text-xs">
                      {format(new Date(occasion.endTime), "h:mm a")}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          </div>

          {/* Action Buttons - Hidden for ended occasions */}
          {!isOccasionEnded && (
            <div className="flex items-center gap-2">
              {/* Edit Button */}
              <button
                onClick={(e) => onEdit(occasion, e)}
                className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-blue-400/50 transition-all duration-200"
                title="Edit occasion"
              >
                <Edit className="w-4 h-4 text-blue-300" />
              </button>
              {/* Delete Button */}
              <button
                onClick={(e) => onDeleteOccasion(occasion.id, e)}
                className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-red-400/50 transition-all duration-200"
                title="Delete occasion"
              >
                <Trash2 className="w-4 h-4 text-red-300" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/10">
          {/* Description */}
          {occasion.description && (
            <div className="mt-4">
              <p className="text-sm text-white/70 leading-relaxed">
                Description: {occasion.description}
              </p>
            </div>
          )}

          {/* Planned Outfits */}
          {plannedCount > 0 && (
            <PlannedOutfitsGrid
              outfits={plannedOutfits}
              isDeletingEntry={isDeletingEntry}
              isOccasionEnded={isOccasionEnded}
              onDeleteEntry={onDeleteEntry}
              onEditEntry={onEditEntry}
              onViewOutfit={handleViewOutfit}
              calendarEntries={calendarEntries}
            />
          )}

          {/* Available Outfits CTA - Hidden for ended occasions */}
          {!isOccasionEnded && availableOutfits.length > 0 && (
            <div className="p-4 rounded-2xl border border-white/10 bg-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
              <div>
                <p className="font-bricolage text-base font-semibold text-white">
                  Add more outfits to this occasion
                </p>
              </div>
              <GlassButton
                variant="primary"
                size="sm"
                onClick={() => setIsAvailableModalOpen(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                Select outfits
              </GlassButton>
            </div>
          )}

          {!isOccasionEnded && availableOutfits.length === 0 && plannedCount > 0 && (
            <div className="text-center py-6">
              <Shirt className="w-10 h-10 mx-auto mb-2 text-white/20" />
              <p className="font-poppins text-sm text-white/50">
                All your outfits are already planned
              </p>
            </div>
          )}
        </div>
      )}

      {/* View Outfit Dialog */}
      <ViewOutfitDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        outfit={viewingOutfit}
      />

      {/* Always render AvailableOutfitsGrid to preserve modal state */}
      <AvailableOutfitsGrid
        open={isAvailableModalOpen}
        onOpenChange={setIsAvailableModalOpen}
        outfits={availableOutfits}
        selectedOutfits={selectedOutfits}
        isCreatingEntry={isCreatingEntry}
        isLoadingOutfits={isLoadingOutfits}
        onToggleSelection={onToggleSelection}
        onToggleSelectAll={onToggleSelectAll}
        onBatchAdd={onBatchAdd}
        onAddSingle={onAddSingle}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        showFavoriteOnly={showFavoriteOnly}
        onFavoriteToggle={onFavoriteToggle}
        gapDay={gapDay}
        onGapDayChange={onGapDayChange}
      />
    </div>
  );
}
