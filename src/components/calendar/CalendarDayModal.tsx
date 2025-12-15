"use client";

import { useState, useEffect, useCallback } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useUserOccasions,
  useCalendarEntries,
  useCreateCalendarEntry,
  useDeleteCalendarEntry,
  useDeleteUserOccasion,
} from "@/hooks/useCalendar";
import { useOutfits } from "@/hooks/useOutfits";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useModalScroll } from "@/hooks/useModalScroll";
import { UserOccasion } from "@/types/userOccasion";
import { Outfit } from "@/types/outfit";
import { Calender } from "@/types/calendar";
import { UserOccasionFormModal } from "./UserOccasionFormModal";
import { EditCalendarEntryModal } from "./EditCalendarEntryModal";
import { AddDailyOutfitModal } from "./Modal/AddDailyOutfitModal";
import { ModalHeader } from "./Modal/ModalHeader";
import { ModalFooter } from "./Modal/ModalFooter";
import { OccasionsSection } from "./Modal/OccasionsSection";
import { GapDayWarningDialog } from "./Modal/GapDayWarningDialog";

interface CalendarDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
}

export function CalendarDayModal({
  open,
  onOpenChange,
  selectedDate,
}: CalendarDayModalProps) {
  const [expandedOccasionIds, setExpandedOccasionIds] = useState<number[]>([]);
  const [isOccasionFormOpen, setIsOccasionFormOpen] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState<UserOccasion | null>(
    null
  );
  const [isEditCalendarOpen, setIsEditCalendarOpen] = useState(false);
  const [editingCalendarEntry, setEditingCalendarEntry] =
    useState<Calender | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);
  const [isDeleteOccasionDialogOpen, setIsDeleteOccasionDialogOpen] = useState(false);
  const [deletingOccasionId, setDeletingOccasionId] = useState<number | null>(null);
  const [isPastDateDialogOpen, setIsPastDateDialogOpen] = useState(false);
  const [pastDateDialogMessage, setPastDateDialogMessage] = useState("");
  const [isGapDayWarning, setIsGapDayWarning] = useState(false);
  const [gapDayWarningData, setGapDayWarningData] = useState<{
    affectedItems: Array<{
      itemId: number;
      itemName: string;
      itemImageUrl: string;
      categoryName: string;
      lastWornAt: string;
      wornDatesInRange: string[];
      timesWornInRange: number;
    }>;
    gapDays: number;
  } | null>(null);
  const [pendingOutfitAdd, setPendingOutfitAdd] = useState<{
    occasionId: number;
    outfit: Outfit;
  } | null>(null);
  const [pendingBatchAdd, setPendingBatchAdd] = useState<{
    occasionId: number;
    outfitIds: number[];
  } | null>(null);
  const [isAddDailyOutfitModalOpen, setIsAddDailyOutfitModalOpen] = useState(false);

  // Multi-select states
  const [selectedOccasionOutfits, setSelectedOccasionOutfits] = useState<
    Record<number, number[]>
  >({});

  // Outfit filter states
  const [outfitSearchQuery, setOutfitSearchQuery] = useState("");
  const [outfitShowFavoriteOnly, setOutfitShowFavoriteOnly] = useState(false);

  const dateString = format(selectedDate, "yyyy-MM-dd");
  const selectedMonth = selectedDate.getMonth() + 1;
  const selectedYear = selectedDate.getFullYear();

  const { data: occasionsData, isLoading: isLoadingOccasions, refetch: refetchOccasions } =
    useUserOccasions({
      PageIndex: 1,
      PageSize: 100,
      takeAll: true,
      Month: selectedMonth,
      Year: selectedYear,
    });

  const { data: calendarData, refetch: refetchCalendar } = useCalendarEntries({
    PageIndex: 1,
    PageSize: 100,
    takeAll: true,
    Month: selectedMonth,
    Year: selectedYear,
  });

  // Prepare params for useOutfits - remove gap day filter
  const outfitParams = {
    pageIndex: 1,
    pageSize: 100,
    takeAll: false,
    search: outfitSearchQuery.trim() || undefined,
    isFavorite: outfitShowFavoriteOnly || undefined,
  };

  const { data: outfitsData, isLoading: isLoadingOutfits, refetch: refetchOutfits } = useOutfits(outfitParams);

  const { mutate: createCalendarEntry, isPending: isCreatingEntry } =
    useCreateCalendarEntry();
  const { mutate: deleteCalendarEntry, isPending: isDeletingEntry } =
    useDeleteCalendarEntry();
  const { mutate: deleteOccasion, isPending: isDeletingOccasion } =
    useDeleteUserOccasion();

  // Lock body scroll when modal is open
  useScrollLock(open);

  // Enable mouse wheel scrolling in modal content area
  const scrollContainerRef = useModalScroll(open, {
    smooth: false, // Disable smooth for faster scrolling
    sensitivity: 1.2, // Slightly faster than default
  });

  const allOccasions = occasionsData?.data?.data || [];
  const allCalendarEntries = calendarData?.data?.data || [];
  const outfits = outfitsData?.data?.data || [];

  const occasions = allOccasions.filter((occasion) => {
    const occasionDate = format(new Date(occasion.dateOccasion), "yyyy-MM-dd");
    return occasionDate === dateString;
  });

  const calendarEntries = allCalendarEntries.filter((entry) => {
    const entryDate = format(
      new Date(entry.userOccasion.dateOccasion),
      "yyyy-MM-dd"
    );
    return entryDate === dateString;
  });

  useEffect(() => {
    if (open) {
      setExpandedOccasionIds([]);
      setEditingOccasion(null);
      setSelectedOccasionOutfits({});
      // Refetch data khi mở modal
      refetchOccasions();
      refetchCalendar();
      refetchOutfits();
    }
  }, [open, refetchOccasions, refetchCalendar, refetchOutfits]);

  const handleAddOccasion = useCallback(() => {
    setEditingOccasion(null);
    setIsOccasionFormOpen(true);
  }, [setEditingOccasion, setIsOccasionFormOpen]);

  const handleAddDailyOutfit = () => {
    setIsAddDailyOutfitModalOpen(true);
  };

  const handleAddDailyOutfits = (outfitIds: number[]) => {
    if (outfitIds.length === 0) return;

    const formattedDate = format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss");
    const dateString = format(selectedDate, "yyyy-MM-dd");

    // Find existing Daily occasion for selected date
    // Check in allOccasions (not filtered) to ensure we find it even if it was just created
    const existingDailyOccasion = allOccasions.find(
      (occ) =>
        occ.name === "Daily" &&
        format(new Date(occ.dateOccasion), "yyyy-MM-dd") === dateString &&
        occ.occasionId === null
    );

    if (existingDailyOccasion) {
      // Use existing Daily occasion
      createCalendarEntry(
        {
          outfitIds,
          isDaily: false,
          userOccasionId: existingDailyOccasion.id,
          endTime: formattedDate,
        },
        {
          onSuccess: () => {
            setIsAddDailyOutfitModalOpen(false);
          },
        }
      );
    } else {
      // Create new Daily entry (backend will create Daily occasion)
      createCalendarEntry(
        {
          outfitIds,
          isDaily: true,
          time: formattedDate,
          endTime: formattedDate,
        },
        {
          onSuccess: () => {
            setIsAddDailyOutfitModalOpen(false);
          },
        }
      );
    }
  };

  const handleEditOccasion = (occasion: UserOccasion, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setEditingOccasion(occasion);
    setIsOccasionFormOpen(true);
  };

  const toggleOccasion = (occasionId: number) => {
    setExpandedOccasionIds((prev) =>
      prev.includes(occasionId)
        ? prev.filter((id) => id !== occasionId)
        : [...prev, occasionId]
    );
  };

  const toggleOutfitSelection = (
    outfitId: number,
    occasionId: number
  ) => {
    setSelectedOccasionOutfits((prev) => {
      const currentSelected = prev[occasionId] || [];
      return {
        ...prev,
        [occasionId]: currentSelected.includes(outfitId)
          ? currentSelected.filter((id) => id !== outfitId)
          : [...currentSelected, outfitId],
      };
    });
  };

  const toggleSelectAll = (
    availableOutfitIds: number[],
    occasionId: number
  ) => {
    const currentSelected = selectedOccasionOutfits[occasionId] || [];
    const allSelected = availableOutfitIds.every((id) =>
      currentSelected.includes(id)
    );
    setSelectedOccasionOutfits((prev) => ({
      ...prev,
      [occasionId]: allSelected ? [] : availableOutfitIds,
    }));
  };

  const handleAddOutfitToOccasion = async (
    occasionId: number,
    outfit: Outfit,
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.stopPropagation();
    }

    // Check if selected date is in the past
    const today = startOfDay(new Date());
    const selectedDateOnly = startOfDay(selectedDate);

    if (isBefore(selectedDateOnly, today)) {
      setPastDateDialogMessage("You can only add outfits to calendar for today or future dates. Please select a valid date.");
      setIsPastDateDialogOpen(true);
      return;
    }

    // Check gap day with default 2 days
    try {
      const { outfitAPI } = await import("@/lib/api/outfit-api");
      const gapDayResult = await outfitAPI.checkGapDay(
        outfit.id,
        dateString,
        2 // Default gap day = 2
      );

      // If outfit has items worn within gap day range, show warning
      if (gapDayResult.data.isWithinGapDay && gapDayResult.data.totalAffectedItems > 0) {
        setGapDayWarningData({
          affectedItems: gapDayResult.data.affectedItems,
          gapDays: gapDayResult.data.gapDayRange.gapDays,
        });
        setIsGapDayWarning(true);
        setPendingOutfitAdd({ occasionId, outfit });
        return;
      }
    } catch (error) {
      console.warn("Gap day check failed, proceeding with add:", error);
      // Continue with adding if check fails
    }

    const formattedDate = format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss");

    createCalendarEntry({
      outfitIds: [outfit.id],
      isDaily: false,
      userOccasionId: occasionId,
      endTime: formattedDate,
    });
  };

  const handleBatchAddOutfits = async (
    occasionId: number,
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.stopPropagation();
    }

    // Check if selected date is in the past
    const today = startOfDay(new Date());
    const selectedDateOnly = startOfDay(selectedDate);

    if (isBefore(selectedDateOnly, today)) {
      setPastDateDialogMessage("You can only add outfits to calendar for today or future dates. Please select a valid date.");
      setIsPastDateDialogOpen(true);
      return;
    }

    const outfitIds = selectedOccasionOutfits[occasionId] || [];

    if (outfitIds.length === 0) return;

    // Check gap day for all selected outfits
    try {
      const { outfitAPI } = await import("@/lib/api/outfit-api");
      const gapDayChecks = await Promise.all(
        outfitIds.map((id) => outfitAPI.checkGapDay(id, dateString, 2))
      );

      const affectedOutfits = gapDayChecks.filter(
        (result) => result.data.isWithinGapDay && result.data.totalAffectedItems > 0
      );

      if (affectedOutfits.length > 0) {
        // Collect all affected items from all outfits
        const allAffectedItems = affectedOutfits.flatMap(
          (result) => result.data.affectedItems
        );
        // Remove duplicates based on itemId
        const uniqueAffectedItems = allAffectedItems.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.itemId === item.itemId)
        );

        setGapDayWarningData({
          affectedItems: uniqueAffectedItems,
          gapDays: 2,
        });
        setIsGapDayWarning(true);
        setPendingBatchAdd({ occasionId, outfitIds });
        return;
      }
    } catch (error) {
      console.warn("Gap day check failed, proceeding with batch add:", error);
      // Continue if check fails
    }

    const formattedDate = format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss");

    createCalendarEntry(
      {
        outfitIds,
        isDaily: false,
        userOccasionId: occasionId,
        endTime: formattedDate,
      },
      {
        onSuccess: () => {
          setSelectedOccasionOutfits((prev) => ({
            ...prev,
            [occasionId]: [],
          }));
        },
      }
    );
  };

  const handleDeleteCalendarEntry = (entryId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setDeletingEntryId(entryId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingEntryId) {
      deleteCalendarEntry(deletingEntryId);
      setDeletingEntryId(null);
    }
  };

  const handleDeleteOccasion = (occasionId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setDeletingOccasionId(occasionId);
    setIsDeleteOccasionDialogOpen(true);
  };

  const confirmDeleteOccasion = () => {
    if (deletingOccasionId) {
      deleteOccasion(deletingOccasionId, {
        onSuccess: () => {
          setIsDeleteOccasionDialogOpen(false);
          setDeletingOccasionId(null);
        },
      });
    }
  };

  const handleEditCalendarEntry = (entry: Calender, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setEditingCalendarEntry(entry);
    setIsEditCalendarOpen(true);
  };

  const handleConfirmGapDayWarning = () => {
    const formattedDate = format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss");

    if (pendingOutfitAdd) {
      // Add single outfit
      createCalendarEntry({
        outfitIds: [pendingOutfitAdd.outfit.id],
        isDaily: false,
        userOccasionId: pendingOutfitAdd.occasionId,
        endTime: formattedDate,
      });
      setPendingOutfitAdd(null);
    } else if (pendingBatchAdd) {
      // Add batch outfits
      createCalendarEntry(
        {
          outfitIds: pendingBatchAdd.outfitIds,
          isDaily: false,
          userOccasionId: pendingBatchAdd.occasionId,
          endTime: formattedDate,
        },
        {
          onSuccess: () => {
            setSelectedOccasionOutfits((prev) => ({
              ...prev,
              [pendingBatchAdd.occasionId]: [],
            }));
          },
        }
      );
      setPendingBatchAdd(null);
    }

    setIsGapDayWarning(false);
    setGapDayWarningData(null);
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => onOpenChange(false)}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none" >
        <div
          className="w-full max-w-[1500px] h-[95vh] rounded-3xl overflow-hidden shadow-2xl bg-linear-to-br
           from-slate-900/95 via-blue-900/95 to-slate-900/95 backdrop-blur-xl border border-white/10 mx-auto flex flex-col 
           pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full overflow-hidden">
            <ModalHeader
              selectedDate={selectedDate}
              occasions={occasions}
              calendarEntries={calendarEntries}
              onClose={() => onOpenChange(false)}
            />

            <div 
              ref={scrollContainerRef}
              className="flex-1 px-10 py-8 overflow-y-auto overflow-x-hidden min-h-0 scroll-smooth
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-white/10
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-purple-400/60
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:hover:bg-purple-400/80"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                touchAction: 'pan-y'
              }}
            >
              <div className="max-w-5xl mx-auto space-y-6">
                <OccasionsSection
                  occasions={occasions}
                  calendarEntries={calendarEntries}
                  outfits={outfits}
                  expandedOccasionIds={expandedOccasionIds}
                  selectedOccasionOutfits={selectedOccasionOutfits}
                  isLoadingOccasions={isLoadingOccasions}
                  isLoadingOutfits={isLoadingOutfits}
                  isCreatingEntry={isCreatingEntry}
                  isDeletingEntry={isDeletingEntry}
                  canAddOccasion={!isBefore(startOfDay(selectedDate), startOfDay(new Date()))}
                  onToggleOccasion={toggleOccasion}
                  onAddOccasion={handleAddOccasion}
                  onAddDailyOutfit={handleAddDailyOutfit}
                  onEditOccasion={handleEditOccasion}
                  onToggleSelection={(outfitId, occasionId) =>
                    toggleOutfitSelection(outfitId, occasionId)
                  }
                  onToggleSelectAll={(outfitIds, occasionId) =>
                    toggleSelectAll(outfitIds, occasionId)
                  }
                  onBatchAdd={(occasionId, e) =>
                    handleBatchAddOutfits(occasionId, e)
                  }
                  onAddSingle={(occasionId, outfit, e) =>
                    handleAddOutfitToOccasion(occasionId, outfit, e)
                  }
                  onDeleteEntry={handleDeleteCalendarEntry}
                  onEditEntry={handleEditCalendarEntry}
                  onDeleteOccasion={handleDeleteOccasion}
                  searchQuery={outfitSearchQuery}
                  onSearchChange={setOutfitSearchQuery}
                  showFavoriteOnly={outfitShowFavoriteOnly}
                  onFavoriteToggle={() => setOutfitShowFavoriteOnly(!outfitShowFavoriteOnly)}
                />
              </div>
            </div>

            <ModalFooter />
          </div>
        </div>
      </div>

      <UserOccasionFormModal
        open={isOccasionFormOpen}
        onOpenChange={setIsOccasionFormOpen}
        selectedDate={selectedDate}
        editingOccasion={editingOccasion}
      />

      <EditCalendarEntryModal
        open={isEditCalendarOpen}
        onOpenChange={setIsEditCalendarOpen}
        calendarEntry={editingCalendarEntry}
        occasions={occasions}
        outfits={outfits}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Remove Outfit from Calendar?"
        description="This will unlink the outfit from this occasion. The outfit itself will not be deleted."
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingEntry}
      />

      <ConfirmDialog
        open={isDeleteOccasionDialogOpen}
        onOpenChange={setIsDeleteOccasionDialogOpen}
        onConfirm={confirmDeleteOccasion}
        title="Delete Occasion?"
        description="Are you sure you want to delete this occasion? This will also remove all outfits linked to this occasion. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingOccasion}
      />

      {/* Gap Day Warning Dialog */}
      {isGapDayWarning && gapDayWarningData && (
        <GapDayWarningDialog
          open={isGapDayWarning}
          onOpenChange={(open) => {
            setIsGapDayWarning(open);
            if (!open) {
              setGapDayWarningData(null);
              setPendingOutfitAdd(null);
              setPendingBatchAdd(null);
            }
          }}
          onConfirm={handleConfirmGapDayWarning}
          affectedItems={gapDayWarningData.affectedItems}
          gapDays={gapDayWarningData.gapDays}
          isLoading={isCreatingEntry}
        />
      )}

      {/* Past Date Warning Dialog */}
      <ConfirmDialog
        open={isPastDateDialogOpen}
        onOpenChange={setIsPastDateDialogOpen}
        onConfirm={() => setIsPastDateDialogOpen(false)}
        title="Cannot Add to Past Date"
        description={pastDateDialogMessage}
        confirmText="OK"
        cancelText=""
        variant="warning"
        isLoading={false}
      />

      {/* Add Daily Outfit Modal */}
      <AddDailyOutfitModal
        open={isAddDailyOutfitModalOpen}
        onOpenChange={setIsAddDailyOutfitModalOpen}
        selectedDate={selectedDate}
        onAddOutfit={handleAddDailyOutfits}
        isCreatingEntry={isCreatingEntry}
        existingOutfitIds={calendarEntries.flatMap((entry) =>
          entry.outfits.map((o) => o.outfitId)
        )}
      />
    </>
  );
}
