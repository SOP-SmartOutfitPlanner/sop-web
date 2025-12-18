"use client";

import { useState, useMemo, useEffect } from "react";
import { Calendar, Clock, Plus, Eye, Trash2, Shirt } from "lucide-react";
import { format } from "date-fns";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";
import { UserOccasionFormModal } from "@/components/calendar/UserOccasionFormModal";
import { OccasionDetailModal } from "@/components/suggest/OccasionDetailModal";
import { useCalendarEntries } from "@/hooks/useCalendar";
import { UserOccasion } from "@/types/userOccasion";
import { Calender } from "@/types/calendar";
import { CalenderAPI } from "@/lib/api/calender-api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface SelectedOccasionData {
  id: number;
  name: string;
  dateOccasion: string;
  startTime: string;
  endTime: string;
}

interface UserOccasionListProps {
  selectedDate: Date;
  onOccasionSelect?: (occasionId: number | null, occasionData?: SelectedOccasionData) => void;
  selectedOccasionId?: number | null;
  onRefetchReady?: (refetchFn: () => void) => void;
}

export function UserOccasionList({
  selectedDate,
  onOccasionSelect,
  selectedOccasionId,
  onRefetchReady,
}: UserOccasionListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [occasionToDelete, setOccasionToDelete] = useState<UserOccasion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingOccasion, setViewingOccasion] = useState<{ occasion: UserOccasion; outfits: Calender[] } | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleOpenCreateModal = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsCreateModalOpen(true);
  };

  const dateString = format(selectedDate, "yyyy-MM-dd");
  const nextDateString = format(new Date(selectedDate.getTime() + 86400000), "yyyy-MM-dd"); // +1 day

  // Fetch calendar entries for the specific date using start-date and end-date
  const { data: calendarData, isLoading, refetch } = useCalendarEntries({
    PageIndex: 1,
    PageSize: 100,
    takeAll: true,
    StartDate: dateString,
    EndDate: nextDateString,
  });

  // Expose refetch function to parent
  useEffect(() => {
    if (onRefetchReady) {
      onRefetchReady(() => refetch());
    }
  }, [onRefetchReady, refetch]);

  // Extract unique occasions from calendar entries with outfit counts and outfits
  const occasions = useMemo(() => {
    if (!calendarData?.data?.data) return [];
    
    const entries = calendarData.data.data;
    const occasionsMap = new Map<number, { occasion: UserOccasion; outfitCount: number; outfits: Calender[]; isDaily: boolean }>();

    entries.forEach((entry) => {
      // Include all entries that have user occasions
      if (entry.userOccasion) {
        const occasionId = entry.userOccasion.id;
        if (!occasionsMap.has(occasionId)) {
          occasionsMap.set(occasionId, {
            occasion: entry.userOccasion,
            outfitCount: entry.outfits?.length || 0,
            outfits: entry.outfits || [],
            isDaily: entry.isDaily,
          });
        } else {
          // Merge outfits if same occasion appears multiple times
          const existing = occasionsMap.get(occasionId)!;
          const newOutfits = entry.outfits || [];
          existing.outfits = [...existing.outfits, ...newOutfits];
          existing.outfitCount = existing.outfits.length;
        }
      }
    });

    return Array.from(occasionsMap.values());
  }, [calendarData]);

  const handleOccasionClick = (occasion: UserOccasion) => {
    if (onOccasionSelect) {
      // Toggle selection
      if (selectedOccasionId === occasion.id) {
        onOccasionSelect(null);
      } else {
        onOccasionSelect(occasion.id, {
          id: occasion.id,
          name: occasion.name,
          dateOccasion: occasion.dateOccasion,
          startTime: occasion.startTime,
          endTime: occasion.endTime,
        });
      }
    }
  };

  const handleViewDetails = (occasion: UserOccasion, outfits: Calender[], e: React.MouseEvent) => {
    e.stopPropagation();
    setViewingOccasion({ occasion, outfits });
    setIsDetailModalOpen(true);
  };

  const handleDelete = (occasion: UserOccasion, e: React.MouseEvent) => {
    e.stopPropagation();
    setOccasionToDelete(occasion);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!occasionToDelete) return;
    
    setIsDeleting(true);
    try {
      await CalenderAPI.deleteUserOccasion(occasionToDelete.id);
      toast.success(`Deleted "${occasionToDelete.name}" successfully`);
      
      // Clear selection if deleted occasion was selected
      if (selectedOccasionId === occasionToDelete.id && onOccasionSelect) {
        onOccasionSelect(null);
      }
      
      // Refetch the list
      refetch();
    } catch (error) {
      console.error("Failed to delete occasion:", error);
      toast.error("Failed to delete occasion");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setOccasionToDelete(null);
    }
  };

  return (
    <>
    <GlassCard 
      padding="1.5rem" 
      blur="16px"
      brightness={0.95}
      glowColor="rgba(6, 182, 212, 0.3)"
      borderColor="rgba(34, 211, 238, 0.3)"
      borderWidth="1px"
      className="bg-gradient-to-br from-cyan-950/30 via-blue-900/20 to-indigo-950/30"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bricolage font-semibold text-white">
            Occasions
          </h3>
          <GlassButton
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
          >
            <Plus className="w-4 h-4 mr-1" />
            Create
          </GlassButton>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500/20 border-t-cyan-400" />
            <p className="mt-2 text-sm text-gray-300">Loading occasions...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && occasions.length === 0 && (
          <div className="text-center py-6">
            <div className="flex flex-col items-center gap-3">
              <Calendar className="w-12 h-12 text-cyan-300" />
              <p className="text-gray-200 font-medium">No events scheduled</p>
              <p className="text-sm text-gray-300">
                Create an event to get personalized outfit suggestions
              </p>
            </div>
          </div>
        )}

        {/* Occasions list */}
        {!isLoading && occasions.length > 0 && (
          <div className="space-y-3">
            {occasions.map(({ occasion, outfitCount, outfits }) => {
            const isSelected = selectedOccasionId === occasion.id;
            
            // Format time strings (handle both HH:mm:ss and full datetime formats)
            const formatTime = (timeStr: string) => {
              if (!timeStr) return '';
              // If it's a full datetime string, extract just the time part
              if (timeStr.includes('T')) {
                const timePart = timeStr.split('T')[1];
                return timePart.substring(0, 5); // Get HH:mm
              }
              // If it's already in HH:mm:ss format, take first 5 chars
              return timeStr.substring(0, 5); // Get HH:mm
            };
            
            return (
              <div
                key={occasion.id}
                onClick={() => handleOccasionClick(occasion)}
                className={`
                  relative group cursor-pointer rounded-2xl p-4 transition-all duration-300
                  ${isSelected 
                    ? "bg-gradient-to-br from-cyan-500/25 via-blue-500/20 to-indigo-500/25 shadow-xl shadow-cyan-500/30 scale-[1.02]" 
                    : "bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60 hover:from-cyan-900/30 hover:via-blue-800/25 hover:to-indigo-900/30 hover:shadow-lg hover:shadow-cyan-500/10"
                  }
                  backdrop-blur-md border
                  ${isSelected ? "border-cyan-400/40" : "border-slate-600/30 hover:border-cyan-500/30"}
                `}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full shadow-lg shadow-cyan-500/50" />
                )}

                <div className="space-y-3">
                  {/* Header: Badge and Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-100 rounded-full border border-cyan-400/40 shadow-sm">
                      {occasion.occasionName}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleViewDetails(occasion, outfits, e)}
                        className="p-1.5 hover:bg-cyan-500/20 rounded-lg transition-all hover:scale-110"
                        title="View details"
                      >
                        <Eye className="w-4 h-4 text-cyan-300" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(occasion, e)}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition-all hover:scale-110"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Occasion Name */}
                  <h4 className="font-bricolage font-bold text-white text-lg leading-tight pr-2">
                    {occasion.name}
                  </h4>

                  {/* Time Display - Prominent */}
                  <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-transparent px-3 py-2 rounded-xl border border-cyan-500/20">
                    <Clock className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <span className="text-base font-semibold text-white">
                      {formatTime(occasion.startTime)}
                    </span>
                    <span className="text-cyan-300">→</span>
                    <span className="text-base font-semibold text-white">
                      {formatTime(occasion.endTime)}
                    </span>
                  </div>

                  {/* Outfit Count */}
                  <div className="flex items-center justify-end pt-1">
                    <div className="flex items-center gap-2 px-2.5 py-1 bg-cyan-500/15 rounded-lg border border-cyan-400/20">
                      <Shirt className="w-4 h-4 text-cyan-300" />
                      <span className="text-sm font-medium text-cyan-200">
                        {outfitCount} {outfitCount !== 1 ? 'outfits' : 'outfit'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </GlassCard>
    
    {/* Create Occasion Modal - Rendered outside GlassCard to avoid z-index issues */}
    {isCreateModalOpen && (
      <UserOccasionFormModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        selectedDate={selectedDate}
      />
    )}

    {/* View Occasion Detail Modal */}
    {isDetailModalOpen && viewingOccasion && (
      <OccasionDetailModal
        open={isDetailModalOpen}
        onOpenChange={(open) => {
          setIsDetailModalOpen(open);
          if (!open) {
            setViewingOccasion(null);
          }
        }}
        occasion={viewingOccasion.occasion}
        outfits={viewingOccasion.outfits}
        selectedDate={selectedDate}
        onRefetch={refetch}
      />
    )}

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent className="bg-slate-900/95 border border-slate-700/50 backdrop-blur-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Delete Occasion</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            Are you sure you want to delete &quot;{occasionToDelete?.name}&quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700 hover:text-white"
            disabled={isDeleting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
