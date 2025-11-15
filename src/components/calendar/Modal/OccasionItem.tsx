"use client";

import {
  ChevronDown,
  ChevronUp,
  Edit,
  Calendar,
  Shirt,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { UserOccasion } from "@/types/userOccasion";
import { Outfit } from "@/types/outfit";
import { CalendarEntry, Calender } from "@/types/calender";
import { PlannedOutfitsGrid } from "./PlannedOutfitsGrid";
import { AvailableOutfitsGrid } from "./AvailableOutfitsGrid";

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
  calendarEntries: CalendarEntry[];
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
  calendarEntries,
}: OccasionItemProps) {
  const plannedCount = plannedOutfits.length;

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
              {occasion.startTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs">
                    {format(new Date(occasion.startTime), "h:mm a")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={(e) => onEdit(occasion, e)}
            className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-blue-400/50 transition-all duration-200"
            title="Edit occasion"
          >
            <Edit className="w-4 h-4 text-blue-300" />
          </button>
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
              onDeleteEntry={onDeleteEntry}
              onEditEntry={onEditEntry}
              calendarEntries={calendarEntries}
            />
          )}

          {/* Available Outfits to Add */}
          {availableOutfits.length > 0 && (
            <AvailableOutfitsGrid
              outfits={availableOutfits}
              selectedOutfits={selectedOutfits}
              isCreatingEntry={isCreatingEntry}
              isLoadingOutfits={isLoadingOutfits}
              onToggleSelection={onToggleSelection}
              onToggleSelectAll={onToggleSelectAll}
              onBatchAdd={onBatchAdd}
              onAddSingle={onAddSingle}
            />
          )}

          {availableOutfits.length === 0 && plannedCount > 0 && (
            <div className="text-center py-6">
              <Shirt className="w-10 h-10 mx-auto mb-2 text-white/20" />
              <p className="font-poppins text-sm text-white/50">
                All your outfits are already planned
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
