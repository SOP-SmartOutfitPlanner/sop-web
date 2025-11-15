"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useUserOccasions,
  useCalendarEntries,
  useCreateCalendarEntry,
  useDeleteCalendarEntry,
} from "@/hooks/useCalendar";
import { useOutfits } from "@/hooks/useOutfits";
import { useScrollLock } from "@/hooks/useScrollLock";
import { UserOccasion } from "@/types/userOccasion";
import { Outfit } from "@/types/outfit";
import { Calender } from "@/types/calender";
import { UserOccasionFormModal } from "./UserOccasionFormModal";
import { EditCalendarEntryModal } from "./EditCalendarEntryModal";
import { ModalHeader } from "./Modal/ModalHeader";
import { ModalFooter } from "./Modal/ModalFooter";
import { DailyOutfitsSection } from "./Modal/DailyOutfitsSection";
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

  // Multi-select states
  const [selectedDailyOutfits, setSelectedDailyOutfits] = useState<number[]>(
    []
  );
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

  useScrollLock(open);

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
      setSelectedDailyOutfits([]);
      setSelectedOccasionOutfits({});
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
        return;
      }

      if (e.key === "n" && !e.ctrlKey && !e.metaKey) {
        handleAddOccasion();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const handleAddOccasion = () => {
    setEditingOccasion(null);
    setIsOccasionFormOpen(true);
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
    occasionId: number | null
  ) => {
    if (occasionId === null) {
      setSelectedDailyOutfits((prev) =>
        prev.includes(outfitId)
          ? prev.filter((id) => id !== outfitId)
          : [...prev, outfitId]
      );
    } else {
      setSelectedOccasionOutfits((prev) => {
        const currentSelected = prev[occasionId] || [];
        return {
          ...prev,
          [occasionId]: currentSelected.includes(outfitId)
            ? currentSelected.filter((id) => id !== outfitId)
            : [...currentSelected, outfitId],
        };
      });
    }
  };

  const toggleSelectAll = (
    availableOutfitIds: number[],
    occasionId: number | null
  ) => {
    if (occasionId === null) {
      const allSelected = availableOutfitIds.every((id) =>
        selectedDailyOutfits.includes(id)
      );
      if (allSelected) {
        setSelectedDailyOutfits([]);
      } else {
        setSelectedDailyOutfits(availableOutfitIds);
      }
    } else {
      const currentSelected = selectedOccasionOutfits[occasionId] || [];
      const allSelected = availableOutfitIds.every((id) =>
        currentSelected.includes(id)
      );
      setSelectedOccasionOutfits((prev) => ({
        ...prev,
        [occasionId]: allSelected ? [] : availableOutfitIds,
      }));
    }
  };

  const handleAddOutfitToOccasion = (
    occasionId: number | null,
    outfit: Outfit,
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.stopPropagation();
    }

    const formattedDate = format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss");

    if (occasionId === null) {
      createCalendarEntry({
        outfitIds: [outfit.id],
        isDaily: true,
        time: formattedDate,
        endTime: formattedDate,
      });
    } else {
      createCalendarEntry({
        outfitIds: [outfit.id],
        isDaily: false,
        userOccasionId: occasionId,
        endTime: formattedDate,
      });
    }
  };

  const handleBatchAddOutfits = (
    occasionId: number | null,
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.stopPropagation();
    }

    const outfitIds =
      occasionId === null
        ? selectedDailyOutfits
        : selectedOccasionOutfits[occasionId] || [];

    if (outfitIds.length === 0) return;

    const formattedDate = format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss");

    if (occasionId === null) {
      createCalendarEntry(
        {
          outfitIds,
          isDaily: true,
          time: formattedDate,
          endTime: formattedDate,
        },
        {
          onSuccess: () => {
            setSelectedDailyOutfits([]);
          },
        }
      );
    } else {
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
    }
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
           pointer-events-auto "
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            <ModalHeader
              selectedDate={selectedDate}
              occasions={occasions}
              calendarEntries={calendarEntries}
              onClose={() => onOpenChange(false)}
            />

            <div className="flex-1 px-10 py-8 overflow-y-auto min-h-0 scroll-smooth
              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-track]:bg-white/10
              [&::-webkit-scrollbar-track]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-purple-400/60
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:hover:bg-purple-400/80"
            >
              <div className="max-w-5xl mx-auto space-y-6">
                <DailyOutfitsSection
                  calendarEntries={calendarEntries}
                  outfits={outfits}
                  selectedDailyOutfits={selectedDailyOutfits}
                  isCreatingEntry={isCreatingEntry}
                  isDeletingEntry={isDeletingEntry}
                  onToggleSelection={(outfitId) =>
                    toggleOutfitSelection(outfitId, null)
                  }
                  onToggleSelectAll={(outfitIds) =>
                    toggleSelectAll(outfitIds, null)
                  }
                  onBatchAdd={(e) => handleBatchAddOutfits(null, e)}
                  onAddSingle={(outfit, e) =>
                    handleAddOutfitToOccasion(null, outfit, e)
                  }
                  onDeleteEntry={handleDeleteCalendarEntry}
                  onEditEntry={handleEditCalendarEntry}
                />

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
                  onToggleOccasion={toggleOccasion}
                  onAddOccasion={handleAddOccasion}
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
    </>
  );
}
