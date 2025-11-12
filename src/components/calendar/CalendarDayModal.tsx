"use client";

import { useState, useEffect } from "react";
import { X, Plus, Calendar, Edit, Sparkles, Shirt, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Image } from "antd";
import GlassButton from "@/components/ui/glass-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useUserOccasions, useCalendarEntries, useCreateCalendarEntry, useDeleteCalendarEntry } from "@/hooks/useCalendar";
import { useOutfits } from "@/hooks/useOutfits";
import { UserOccasion } from "@/types/userOccasion";
import { Outfit } from "@/types/outfit";
import { Calender } from "@/types/calender";
import { UserOccasionFormModal } from "./UserOccasionFormModal";
import { EditCalendarEntryModal } from "./EditCalendarEntryModal";

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
  const [selectedOccasion, setSelectedOccasion] = useState<UserOccasion | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [outfitSearchQuery, setOutfitSearchQuery] = useState("");
  const [isOccasionFormOpen, setIsOccasionFormOpen] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState<UserOccasion | null>(null);
  const [isEditCalendarOpen, setIsEditCalendarOpen] = useState(false);
  const [editingCalendarEntry, setEditingCalendarEntry] = useState<Calender | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);

  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const selectedMonth = selectedDate.getMonth() + 1;
  const selectedYear = selectedDate.getFullYear();

  // Fetch user occasions for selected month (more efficient than takeAll)
  const { data: occasionsData, isLoading: isLoadingOccasions } = useUserOccasions({
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

  // Fetch all user outfits
  const { data: outfitsData, isLoading: isLoadingOutfits } = useOutfits({
    pageIndex: 1,
    pageSize: 100,
    takeAll: false,
    search: outfitSearchQuery,
  });

  const { mutate: createCalendarEntry, isPending: isCreatingEntry } = useCreateCalendarEntry();
  const { mutate: deleteCalendarEntry, isPending: isDeletingEntry } = useDeleteCalendarEntry();

  const allOccasions = occasionsData?.data?.data || [];
  const allCalendarEntries = calendarData?.data?.data || [];
  const outfits = outfitsData?.data?.data || [];

  // Filter occasions for the selected date (client-side filtering)
  const occasions = allOccasions.filter(occasion => {
    const occasionDate = format(new Date(occasion.dateOccasion), 'yyyy-MM-dd');
    return occasionDate === dateString;
  });

  // Filter calendar entries for the selected date
  const calendarEntries = allCalendarEntries.filter(entry => {
    const entryDate = format(new Date(entry.dateUsed), 'yyyy-MM-dd');
    return entryDate === dateString;
  });

  // Reset selections when opening/closing
  useEffect(() => {
    if (open) {
      setSelectedOccasion(null);
      setSelectedOutfit(null);
      setOutfitSearchQuery("");
      setEditingOccasion(null);
    }
  }, [open]);

  // Auto-select occasion if only one exists for the day
  useEffect(() => {
    if (open && occasions.length === 1 && !selectedOccasion) {
      setSelectedOccasion(occasions[0]);
    }
  }, [open, occasions, selectedOccasion]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to close modal
      if (e.key === 'Escape') {
        onOpenChange(false);
        return;
      }

      // Enter to add to calendar if both selected
      if (e.key === 'Enter' && selectedOccasion && selectedOutfit && !isCreatingEntry) {
        handleAddToCalendar();
        return;
      }

      // N to create new occasion
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
        handleAddOccasion();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // handleAddToCalendar is stable and doesn't need to be in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedOccasion, selectedOutfit, isCreatingEntry, onOpenChange]);

  const handleAddOccasion = () => {
    setEditingOccasion(null);
    setIsOccasionFormOpen(true);
  };

  const handleEditOccasion = (occasion: UserOccasion) => {
    setEditingOccasion(occasion);
    setIsOccasionFormOpen(true);
  };

  const handleAddToCalendar = () => {
    if (!selectedOccasion || !selectedOutfit) return;

    const formattedDate = format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss");

    createCalendarEntry(
      {
        outfitId: selectedOutfit.id,
        userOccasionId: selectedOccasion.id,
        dateUsed: formattedDate,
      },
      {
        onSuccess: () => {
          setSelectedOccasion(null);
          setSelectedOutfit(null);
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-hidden"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
        <div
          className="w-full max-w-[1200px] max-h-[95vh] rounded-3xl overflow-hidden shadow-2xl bg-linear-to-br from-slate-900/95 via-blue-900/95 to-slate-900/95 backdrop-blur-xl border border-white/10 mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full max-h-[95vh]">
            {/* Header */}
            <div className="px-10 pt-8 pb-6 shrink-0 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="font-dela-gothic text-3xl font-bold text-white">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h2>
                  <p className="font-bricolage text-gray-300 mt-2 text-base">
                    Manage your occasions and outfits for this day
                  </p>
                  
                  {/* Day Summary Stats */}
                  {(occasions.length > 0 || calendarEntries.length > 0) && (
                    <div className="flex items-center gap-4 mt-4">
                      {occasions.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-400/30">
                          <Calendar className="w-4 h-4 text-purple-300" />
                          <span className="text-sm text-purple-200 font-medium">
                            {occasions.length} Occasion{occasions.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                      {calendarEntries.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/30">
                          <Shirt className="w-4 h-4 text-cyan-300" />
                          <span className="text-sm text-cyan-200 font-medium">
                            {calendarEntries.length} Outfit{calendarEntries.length > 1 ? 's' : ''} Planned
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 shrink-0"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Content - Two Columns */}
            <div className="flex-1 px-10 py-8 overflow-hidden">
              <div className="grid grid-cols-2 gap-8 h-full">
                {/* Left: Occasions */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bricolage text-xl font-semibold text-white flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-purple-400" />
                      Your Occasions
                    </h3>
                    <GlassButton variant="ghost" size="md" onClick={handleAddOccasion}>
                      <Plus className="w-5 h-5" />
                      Add
                    </GlassButton>
                  </div>
                  
                  {selectedOccasion && (
                    <div className="mb-4 px-4 py-3 rounded-lg bg-purple-500/20 border border-purple-400/40 shrink-0">
                      <p className="text-sm text-purple-200 font-medium">
                        Selected: {selectedOccasion.name}
                      </p>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-hidden overflow-x-hidden space-y-4 pr-3 pt-1">
                    {isLoadingOccasions ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
                        <p className="font-poppins text-sm text-white/60">Loading...</p>
                      </div>
                    ) : occasions.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-white/20" />
                        <p className="font-poppins text-sm text-white/50">No occasions yet</p>
                        <p className="font-poppins text-xs text-white/30 mt-1">Click Add to create one</p>
                      </div>
                    ) : (
                      occasions.map((occasion) => {
                        const isSelected = selectedOccasion?.id === occasion.id;
                        const plannedCount = calendarEntries.filter(e => e.userOccasionId === occasion.id).length;
                        const plannedOutfits = calendarEntries.filter(e => e.userOccasionId === occasion.id);

                        return (
                          <div
                            key={occasion.id}
                            onClick={() => setSelectedOccasion(isSelected ? null : occasion)}
                            className={`
                              relative w-full text-left p-5 rounded-xl transition-all duration-300 cursor-pointer border-2
                              ${isSelected
                                ? 'bg-purple-500/30 border-purple-400 shadow-lg shadow-purple-500/20 scale-[1.02]'
                                : 'bg-white/10 border-transparent hover:border-purple-400/50 hover:bg-white/15'
                              }
                            `}
                          >
                            {isSelected && (
                              <div className="absolute -top-2 -right-2 w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                <Sparkles className="w-4 h-4 text-white" />
                              </div>
                            )}

                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <span className="px-3 py-1.5 rounded-full bg-purple-500/30 text-purple-200 text-xs font-semibold border border-purple-400/30">
                                  {occasion.occasionName}
                                </span>
                                <h4 className="font-bricolage font-bold text-white text-lg mt-2">
                                  {occasion.name}
                                </h4>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditOccasion(occasion);
                                }}
                                className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-blue-400/50 transition-all duration-200"
                                title="Edit occasion"
                              >
                                <Edit className="w-4 h-4 text-blue-300" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-white/70 mb-3">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">{format(new Date(occasion.startTime), 'HH:mm')} - {format(new Date(occasion.endTime), 'HH:mm')}</span>
                            </div>

                            {occasion.description && (
                              <p className="text-sm text-white/60 line-clamp-2 mb-3">
                                {occasion.description}
                              </p>
                            )}

                            {occasion.weatherSnapshot && (
                              <div className="flex items-center gap-2 text-sm text-white/70 mb-3">
                                <span className="text-base">🌤️</span>
                                <span className="font-medium">{occasion.weatherSnapshot}</span>
                              </div>
                            )}

                            {plannedCount > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/30 w-fit">
                                  <Shirt className="w-3.5 h-3.5 text-cyan-300" />
                                  <span className="text-sm text-cyan-200 font-semibold">
                                    {plannedCount} outfit{plannedCount > 1 ? 's' : ''} planned
                                  </span>
                                </div>
                                
                                {/* List of planned outfits */}
                                <div className="flex flex-wrap gap-2">
                                  {plannedOutfits.map((entry) => (
                                    <div 
                                      key={entry.id}
                                      className="group flex items-center gap-2 pl-3 pr-1.5 py-2 rounded-lg bg-cyan-500/10 border border-cyan-400/20 hover:bg-cyan-500/20 hover:border-cyan-400/40 transition-all duration-200"
                                    >
                                      <span className="text-sm text-cyan-200 font-medium">
                                        {entry.outfitName}
                                      </span>
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={(e) => handleEditCalendarEntry(entry, e)}
                                          className="p-1.5 hover:bg-blue-500/30 rounded-md transition-colors"
                                          title="Edit entry"
                                        >
                                          <Edit className="w-4 h-4 text-blue-400" />
                                        </button>
                                        <button
                                          onClick={(e) => handleDeleteCalendarEntry(entry.id, e)}
                                          className="p-1.5 hover:bg-red-500/30 rounded-md transition-colors"
                                          title="Remove outfit"
                                          disabled={isDeletingEntry}
                                        >
                                          <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right: Outfits */}
                <div className="flex flex-col">
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bricolage text-xl font-semibold text-white flex items-center gap-2">
                        <Shirt className="w-6 h-6 text-cyan-400" />
                        Your Outfits
                      </h3>
                    </div>
                    
                    <input
                      type="text"
                      value={outfitSearchQuery}
                      onChange={(e) => setOutfitSearchQuery(e.target.value)}
                      placeholder="Search outfits..."
                      className="w-full px-4 py-3 text-base rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                    />
                    
                    {selectedOutfit && (
                      <div className="mt-4 px-4 py-3 rounded-lg bg-cyan-500/20 border border-cyan-400/40 shrink-0">
                        <p className="text-sm text-cyan-200 font-medium">
                          Selected: {selectedOutfit.name}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 pr-3 pt-1">
                    {isLoadingOutfits ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
                        <p className="font-poppins text-sm text-white/60">Loading...</p>
                      </div>
                    ) : outfits.length === 0 ? (
                      <div className="text-center py-12">
                        <Shirt className="w-12 h-12 mx-auto mb-3 text-white/20" />
                        <p className="font-poppins text-sm text-white/50">No outfits found</p>
                      </div>
                    ) : (
                      outfits.map((outfit) => {
                        const isSelected = selectedOutfit?.id === outfit.id;
                        const isPlannedForOccasion = selectedOccasion 
                          ? calendarEntries.some(e => e.outfitId === outfit.id && e.userOccasionId === selectedOccasion.id)
                          : false;

                        return (
                          <div
                            key={outfit.id}
                            onClick={() => setSelectedOutfit(isSelected ? null : outfit)}
                            className={`
                              relative w-full text-left p-5 rounded-xl transition-all duration-300 cursor-pointer border-2
                              ${isSelected
                                ? 'bg-cyan-500/30 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                                : 'bg-white/10 border-transparent hover:border-cyan-400/50 hover:bg-white/15'
                              }
                              ${isPlannedForOccasion ? 'ring-2 ring-green-400/30' : ''}
                            `}
                          >
                            {isSelected && (
                              <div className="absolute -top-2 -right-2 w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                <Sparkles className="w-4 h-4 text-white" />
                              </div>
                            )}

                            {isPlannedForOccasion && (
                              <div className="absolute top-0 left-0 px-2.5 py-1 bg-green-500 rounded-tl-xl rounded-br-lg text-[10px] text-white font-bold shadow-lg border-b-2 border-r-2 border-green-600/50">
                                LINKED
                              </div>
                            )}

                            <div className="flex gap-4">
                              <div className="w-24 h-24 bg-white/5 rounded-lg overflow-hidden shrink-0 border border-white/10">
                                <div className="grid grid-cols-2 gap-0.5 h-full p-0.5">
                                  {outfit.items.slice(0, 4).map((item, idx) => (
                                    <div key={idx} className="relative rounded overflow-hidden bg-black/20">
                                      <Image
                                        src={item.imgUrl}
                                        alt={item.name}
                                        width="100%"
                                        height="100%"
                                        preview={false}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="font-bricolage font-bold text-white text-lg truncate">
                                  {outfit.name}
                                </h4>
                                <p className="font-poppins text-sm text-white/60 mt-1 flex items-center gap-1">
                                  <Shirt className="w-3.5 h-3.5" />
                                  {outfit.items.length} items
                                </p>
                                {outfit.description && (
                                  <p className="font-poppins text-sm text-white/50 mt-2 line-clamp-2">
                                    {outfit.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-10 pb-8 pt-6 shrink-0 border-t border-white/10 bg-white/5">
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1 text-base">
                  {selectedOccasion && selectedOutfit ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-white">
                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-green-500/20 border border-green-400/40">
                          <Sparkles className="w-5 h-5 text-green-300" />
                          <span className="font-poppins font-medium">
                            Ready to link <span className="text-cyan-300 font-bold">{selectedOutfit.name}</span> to <span className="text-purple-300 font-bold">{selectedOccasion.name}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/40 font-poppins">
                        <span className="flex items-center gap-1">
                          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60">Enter</kbd> to add
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60">ESC</kbd> to close
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="font-poppins text-white/60 font-medium">
                        {!selectedOccasion && !selectedOutfit && "📅 Select an occasion and outfit to link them"}
                        {selectedOccasion && !selectedOutfit && "👈 Now select an outfit from the right column"}
                        {!selectedOccasion && selectedOutfit && "👉 First select an occasion from the left column"}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-white/40 font-poppins">
                        <span className="flex items-center gap-1">
                          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60">N</kbd> new occasion
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60">ESC</kbd> close
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <GlassButton
                  variant="custom"
                  backgroundColor={selectedOccasion && selectedOutfit ? "rgba(34, 197, 94, 0.6)" : "rgba(100, 116, 139, 0.4)"}
                  borderColor={selectedOccasion && selectedOutfit ? "rgba(34, 197, 94, 0.8)" : "rgba(100, 116, 139, 0.6)"}
                  textColor="white"
                  size="lg"
                  onClick={handleAddToCalendar}
                  disabled={!selectedOccasion || !selectedOutfit || isCreatingEntry}
                  className="min-w-[200px] font-semibold text-base px-6 py-3"
                >
                  {isCreatingEntry ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Linking...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5" />
                      Add to Calendar
                    </>
                  )}
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Occasion Form Modal */}
      <UserOccasionFormModal
        open={isOccasionFormOpen}
        onOpenChange={setIsOccasionFormOpen}
        selectedDate={selectedDate}
        editingOccasion={editingOccasion}
      />

      {/* Edit Calendar Entry Modal */}
      <EditCalendarEntryModal
        open={isEditCalendarOpen}
        onOpenChange={setIsEditCalendarOpen}
        calendarEntry={editingCalendarEntry}
        occasions={occasions}
        outfits={outfits.filter((outfit) =>
          outfit.name.toLowerCase().includes(outfitSearchQuery.toLowerCase())
        )}
      />

      {/* Delete Confirmation Dialog */}
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
