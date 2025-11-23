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
  const [isAddDailyOutfitModalOpen, setIsAddDailyOutfitModalOpen] = useState(false);

  // Multi-select states
  const [selectedOccasionOutfits, setSelectedOccasionOutfits] = useState<
    Record<number, number[]>
  >({});

  const dateString = format(selectedDate, "yyyy-MM-dd");
  const selectedMonth = selectedDate.getMonth() + 1;
  const selectedYear = selectedDate.getFullYear();

  const { data: occasionsData, isLoading: isLoadingOccasions } =
    useUserOccasions({
      PageIndex: 1,
      PageSize: 100,
      takeAll: true,
      Month: selectedMonth,
      Year: selectedYear,
    });

  const { data: calendarData } = useCalendarEntries({
    PageIndex: 1,
    PageSize: 100,
    takeAll: true,
    Month: selectedMonth,
    Year: selectedYear,
  });

  const { data: outfitsData, isLoading: isLoadingOutfits } = useOutfits({
    pageIndex: 1,
    pageSize: 100,
    takeAll: false,
  });

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
    }
  }, [open]);

  const handleAddOccasion = useCallback(() => {
    // Check if selected date is in the past
    const today = startOfDay(new Date());
    const selectedDateOnly = startOfDay(selectedDate);

    if (isBefore(selectedDateOnly, today)) {
      setPastDateDialogMessage("You can only create occasions for today or future dates. Please select a valid date.");
      setIsPastDateDialogOpen(true);
      return;
    }

    setEditingOccasion(null);
    setIsOccasionFormOpen(true);
  }, [selectedDate, setPastDateDialogMessage, setIsPastDateDialogOpen, setEditingOccasion, setIsOccasionFormOpen]);

  const handleAddDailyOutfit = () => {
    // Check if selected date is in the past
    const today = startOfDay(new Date());
    const selectedDateOnly = startOfDay(selectedDate);

    if (isBefore(selectedDateOnly, today)) {
      setPastDateDialogMessage("You can only add outfits to calendar for today or future dates. Please select a valid date.");
      setIsPastDateDialogOpen(true);
      return;
    }

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

  const handleAddOutfitToOccasion = (
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

    const formattedDate = format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss");

    createCalendarEntry({
      outfitIds: [outfit.id],
      isDaily: false,
      userOccasionId: occasionId,
      endTime: formattedDate,
    });
  };

  const handleBatchAddOutfits = (
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
