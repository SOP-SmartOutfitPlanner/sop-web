"use client";

import { useMemo } from "react";
import { Calendar, Plus, Shirt } from "lucide-react";
import GlassButton from "@/components/ui/glass-button";
import { UserOccasion } from "@/types/userOccasion";
import { Outfit } from "@/types/outfit";
import { CalendarEntry, Calender } from "@/types/calendar";
import { OccasionItem } from "./OccasionItem";

interface OccasionsSectionProps {
  occasions: UserOccasion[];
  calendarEntries: CalendarEntry[];
  outfits: Outfit[];
  expandedOccasionIds: number[];
  selectedOccasionOutfits: Record<number, number[]>;
  isLoadingOccasions: boolean;
  isLoadingOutfits: boolean;
  isCreatingEntry: boolean;
  isDeletingEntry: boolean;
  canAddOccasion?: boolean;
  onToggleOccasion: (occasionId: number) => void;
  onAddOccasion: () => void;
  onAddDailyOutfit: () => void;
  onEditOccasion: (occasion: UserOccasion, e?: React.MouseEvent) => void;
  onToggleSelection: (outfitId: number, occasionId: number) => void;
  onToggleSelectAll: (outfitIds: number[], occasionId: number) => void;
  onBatchAdd: (occasionId: number, e?: React.MouseEvent) => void;
  onAddSingle: (
    occasionId: number,
    outfit: Outfit,
    e?: React.MouseEvent
  ) => void;
  onDeleteEntry: (entryId: number, e?: React.MouseEvent) => void;
  onEditEntry: (entry: Calender, e?: React.MouseEvent) => void;
  onDeleteOccasion: (occasionId: number, e?: React.MouseEvent) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showFavoriteOnly: boolean;
  onFavoriteToggle: () => void;
}

export function OccasionsSection({
  occasions,
  calendarEntries,
  outfits,
  expandedOccasionIds,
  selectedOccasionOutfits,
  isLoadingOccasions,
  isLoadingOutfits,
  isCreatingEntry,
  isDeletingEntry,
  canAddOccasion = true,
  onToggleOccasion,
  onAddOccasion,
  onAddDailyOutfit,
  onEditOccasion,
  onToggleSelection,
  onToggleSelectAll,
  onBatchAdd,
  onAddSingle,
  onDeleteEntry,
  onEditEntry,
  onDeleteOccasion,
  searchQuery,
  onSearchChange,
  showFavoriteOnly,
  onFavoriteToggle,
}: OccasionsSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bricolage text-xl font-semibold text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-400" />
          Your Occasions for This Day
        </h3>
        <div className="flex items-center gap-2">
          <GlassButton 
            variant="ghost" 
            size="md" 
            onClick={onAddDailyOutfit}
            disabled={!canAddOccasion}
            title={!canAddOccasion ? "Cannot add outfit to calendar in the past" : undefined}
          >
            <Shirt className="w-5 h-5" />
            Add Outfit Daily
          </GlassButton>
          <GlassButton 
            variant="ghost" 
            size="md" 
            onClick={onAddOccasion}
            disabled={!canAddOccasion}
            title={!canAddOccasion ? "Cannot create occasion in the past" : undefined}
          >
            <Plus className="w-5 h-5" />
            Add Occasion
          </GlassButton>
        </div>
      </div>
   

      {/* Occasions List - Expandable */}
      <div className="space-y-3">
        {isLoadingOccasions ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
            <p className="font-poppins text-sm text-white/60">Loading...</p>
          </div>
        ) : occasions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-white/20" />
            <p className="font-poppins text-sm text-white/50">
              No occasions yet
            </p>
            <p className="font-poppins text-xs text-white/30 mt-1">
              Click `&ldquo;`Add Occasion`&ldquo;` to create one
            </p>
          </div>
        ) : (
          occasions.map((occasion) => {
            const isExpanded = expandedOccasionIds.includes(occasion.id);
            const occasionEntry = calendarEntries.find(
              (e) => e.userOccasion && e.userOccasion.id === occasion.id
            );
            const plannedOutfits = occasionEntry?.outfits || [];
            const availableOutfits = outfits.filter(
              (outfit) => !plannedOutfits.some((p) => p.outfitId === outfit.id)
            );

            return (
              <OccasionItem
                key={occasion.id}
                occasion={occasion}
                isExpanded={isExpanded}
                plannedOutfits={plannedOutfits}
                availableOutfits={availableOutfits}
                selectedOutfits={selectedOccasionOutfits[occasion.id] || []}
                isCreatingEntry={isCreatingEntry}
                isDeletingEntry={isDeletingEntry}
                isLoadingOutfits={isLoadingOutfits}
                onToggle={() => onToggleOccasion(occasion.id)}
                onEdit={onEditOccasion}
                onToggleSelection={(outfitId) =>
                  onToggleSelection(outfitId, occasion.id)
                }
                onToggleSelectAll={(outfitIds) =>
                  onToggleSelectAll(outfitIds, occasion.id)
                }
                onBatchAdd={(e) => onBatchAdd(occasion.id, e)}
                onAddSingle={(outfit, e) => onAddSingle(occasion.id, outfit, e)}
                onDeleteEntry={onDeleteEntry}
                onEditEntry={onEditEntry}
                onDeleteOccasion={onDeleteOccasion}
                calendarEntries={calendarEntries}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                showFavoriteOnly={showFavoriteOnly}
                onFavoriteToggle={onFavoriteToggle}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
