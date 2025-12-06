"use client";

import { useState, useEffect } from "react";
import { useModalScroll } from "@/hooks/useModalScroll";
import { X, Calendar, Clock, Trash2, Save } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import { Select } from "antd";
import GlassButton from "@/components/ui/glass-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { 
  useCreateUserOccasion, 
  useUpdateUserOccasion, 
  useDeleteUserOccasion,
  useOccasions 
} from "@/hooks/useCalendar";
import { UserOccasion } from "@/types/userOccasion";

interface UserOccasionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  editingOccasion?: UserOccasion | null;
}

interface FormData {
  occasionId: number;
  name: string;
  description: string;
  dateOccasion: string; // "2025-12-08"
  startTime: string;    // "09:00"
  endTime: string;      // "17:00"
}

export function UserOccasionFormModal({
  open,
  onOpenChange,
  selectedDate,
  editingOccasion = null,
}: UserOccasionFormModalProps) {
  const isEditing = !!editingOccasion;

  // Ensure we always have a valid date string
  const getInitialDate = () => {
    try {
      return selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    } catch {
      return format(new Date(), 'yyyy-MM-dd');
    }
  };

  const [formData, setFormData] = useState<FormData>({
    occasionId: 0,
    name: "",
    description: "",
    dateOccasion: getInitialDate(),
    startTime: "09:00",
    endTime: "17:00",
  });

  // Fetch occasion types
  const { data: occasionsData } = useOccasions({
    PageIndex: 1,
    PageSize: 100,
    takeAll: true,
  });

  const occasions = occasionsData?.data?.data || [];

  const { mutate: createOccasion, isPending: isCreating } = useCreateUserOccasion();
  const { mutate: updateOccasion, isPending: isUpdating } = useUpdateUserOccasion();
  const { mutate: deleteOccasion, isPending: isDeleting } = useDeleteUserOccasion();

  const [isPastDateDialogOpen, setIsPastDateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDailyNameDialogOpen, setIsDailyNameDialogOpen] = useState(false);

  // Enable mouse wheel scrolling in modal content area
  const scrollContainerRef = useModalScroll(open, {
    smooth: false, // Disable smooth for faster scrolling
    sensitivity: 1.2, // Slightly faster than default
  });

  // Load editing data
  useEffect(() => {
    const getDateString = () => {
      try {
        return selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      } catch {
        return format(new Date(), 'yyyy-MM-dd');
      }
    };

    if (editingOccasion) {
      // Parse datetime strings back to separate date/time
      let dateOccasion = "";
      let startTime = "09:00";
      let endTime = "17:00";
      
      try {
        if (editingOccasion.dateOccasion) {
          dateOccasion = format(new Date(editingOccasion.dateOccasion), 'yyyy-MM-dd');
        }
        if (editingOccasion.startTime) {
          startTime = format(new Date(editingOccasion.startTime), 'HH:mm');
        }
        if (editingOccasion.endTime) {
          endTime = format(new Date(editingOccasion.endTime), 'HH:mm');
        }
      } catch (error) {
        console.error('Error parsing dates:', error);
      }

      setFormData({
        occasionId: editingOccasion.occasionId || 0,
        name: editingOccasion.name || "",
        description: editingOccasion.description || "",
        dateOccasion: dateOccasion || getDateString(),
        startTime: startTime || "09:00",
        endTime: endTime || "17:00",
      });
    } else {
      // Reset for new occasion
      setFormData({
        occasionId: 0,
        name: "",
        description: "",
        dateOccasion: getDateString(),
        startTime: "09:00",
        endTime: "17:00",
      });
    }
  }, [editingOccasion, selectedDate, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if name is "Daily" (case-insensitive)
    const trimmedName = formData.name.trim();
    if (trimmedName.toLowerCase() === "daily") {
      setIsDailyNameDialogOpen(true);
      return;
    }

    // Removed past date check - allow creating occasions for today even if time has passed

    // Transform to API format: combine date + time to full datetime
    const payload = {
      occasionId: formData.occasionId,
      name: formData.name,
      description: formData.description,
      dateOccasion: `${formData.dateOccasion}T${formData.startTime}:00`,
      startTime: `${formData.dateOccasion}T${formData.startTime}:00`,
      endTime: `${formData.dateOccasion}T${formData.endTime}:00`,
      weatherSnapshot: "",
    };

    // console.log('📤 Submitting occasion:', { isEditing, payload });

    if (isEditing && editingOccasion) {
      updateOccasion(
        { id: editingOccasion.id, data: payload },
        {
          onSuccess: () => {
            // console.log('✅ Occasion updated');
            onOpenChange(false);
          },
        }
      );
    } else {
      createOccasion(payload, {
        onSuccess: () => {
          // console.log('✅ Occasion created');
          onOpenChange(false);
        },
      });
    }
  };

  const handleDelete = () => {
    if (!editingOccasion) return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!editingOccasion) return;
    
    deleteOccasion(editingOccasion.id, {
      onSuccess: () => {
        // console.log('✅ Occasion deleted');
        setIsDeleteDialogOpen(false);
        onOpenChange(false);
      },
    });
  };

  if (!open) return null;

  const isPending = isCreating || isUpdating || isDeleting;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
        onClick={() => !isPending && onOpenChange(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="w-[600px] max-w-[95vw] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-slate-900/95 backdrop-blur-xl border border-cyan-500/30"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh] h-full">
            {/* Header */}
            <div className="px-8 pt-6 pb-4 shrink-0 border-b border-cyan-500/20 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bricolage text-2xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                    {isEditing ? '✏️ Edit Occasion' : '✨ Create New Occasion'}
                  </h2>
                  <p className="font-poppins text-cyan-200/80 mt-1 text-sm">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  className="w-10 h-10 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
                  title="Close"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5 text-cyan-300" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 px-8 py-6 overflow-y-auto overflow-x-hidden min-h-0 scroll-smooth
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:bg-cyan-500/10
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-cyan-400/60
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:hover:bg-cyan-400/80"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                touchAction: 'pan-y'
              }}
            >
              <div className="space-y-5">
                {/* Occasion Type */}
                <div>
                  <label className="block font-poppins text-sm font-semibold text-cyan-200 mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
                    Occasion Type *
                  </label>
                  <Select
                    value={formData.occasionId || undefined}
                    onChange={(value) => setFormData({ ...formData, occasionId: value })}
                    placeholder="Select occasion type"
                    className="w-full"
                    size="large"
                    options={occasions.map((occ) => ({
                      label: occ.name,
                      value: occ.id,
                    }))}
                    disabled={isPending}
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block font-poppins text-sm font-semibold text-cyan-200 mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Team Lunch, Birthday Party"
                    required
                    disabled={isPending}
                    className="w-full px-4 py-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-white placeholder-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-poppins text-sm font-semibold text-cyan-200 mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
                    Description
                  </label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add details about this occasion..."
                    rows={3}
                    disabled={isPending}
                    className="w-full px-4 py-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-white placeholder-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 resize-none transition-all"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block font-poppins text-sm font-semibold text-cyan-200 mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
                    Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
                    <input
                      type="date"
                      value={formData.dateOccasion || ""}
                      onChange={(e) => setFormData({ ...formData, dateOccasion: e.target.value })}
                      min={isEditing ? undefined : format(new Date(), 'yyyy-MM-dd')}
                      required
                      disabled={isPending}
                      title="Date"
                      aria-label="Date"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                    />
                  </div>
                  {!isEditing && (
                    <p className="text-[11px] text-cyan-300/60 mt-1.5">
                      You can only create occasions for today or future dates
                    </p>
                  )}
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-poppins text-sm font-semibold text-cyan-200 mb-2 flex items-center gap-2">
                      <span className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
                      Start Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
                      <input
                        type="time"
                        value={formData.startTime || ""}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        required
                        disabled={isPending}
                        title="Start Time"
                        aria-label="Start Time"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-poppins text-sm font-semibold text-cyan-200 mb-2 flex items-center gap-2">
                      <span className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
                      End Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
                      <input
                        type="time"
                        value={formData.endTime || ""}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        required
                        disabled={isPending}
                        title="End Time"
                        aria-label="End Time"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                      />
                    </div>
                  </div>
                </div>


              </div>
            </div>

            {/* Footer */}
            <div className="px-8 pb-6 pt-4 shrink-0 border-t border-cyan-500/20 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent">
              <div className="flex items-center justify-between">
                {/* Delete Button (only when editing) */}
                {isEditing && (
                  <GlassButton
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleDelete}
                    disabled={isPending}
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        Delete
                      </>
                    )}
                  </GlassButton>
                )}

                <div className={`flex items-center gap-3 ${isEditing ? '' : 'ml-auto'}`}>
                  <GlassButton
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => onOpenChange(false)}
                    disabled={isPending}
                  >
                    Cancel
                  </GlassButton>
                  <GlassButton
                    type="submit"
                    variant="custom"
                    backgroundColor="rgba(59, 130, 246, 0.6)"
                    borderColor="rgba(59, 130, 246, 0.8)"
                    textColor="white"
                    size="md"
                    disabled={isPending || !formData.occasionId || !formData.name}
                  >
                    {isCreating || isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        {isEditing ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {isEditing ? 'Update' : 'Create'}
                      </>
                    )}
                  </GlassButton>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Past Date Warning Dialog */}
      <ConfirmDialog
        open={isPastDateDialogOpen}
        onOpenChange={setIsPastDateDialogOpen}
        onConfirm={() => setIsPastDateDialogOpen(false)}
        title="Cannot Create Occasion in the Past"
        description="You can only create occasions for today or future dates. Please select a valid date."
        confirmText="OK"
        cancelText=""
        variant="warning"
        isLoading={false}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Occasion?"
        description={`Are you sure you want to delete "${editingOccasion?.name || 'this occasion'}"? This will also remove all outfits linked to this occasion. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Daily Name Warning Dialog */}
      <ConfirmDialog
        open={isDailyNameDialogOpen}
        onOpenChange={setIsDailyNameDialogOpen}
        onConfirm={() => setIsDailyNameDialogOpen(false)}
        title="Invalid Occasion Name"
        description="The name 'Daily' is reserved and cannot be used for custom occasions. Please choose a different name."
        confirmText="OK"
        cancelText=""
        variant="warning"
        isLoading={false}
      />
    </>
  );
}
