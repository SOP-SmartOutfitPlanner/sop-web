"use client";

import { useState, useEffect } from "react";
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
  weatherSnapshot: string;
}

export function UserOccasionFormModal({
  open,
  onOpenChange,
  selectedDate,
  editingOccasion = null,
}: UserOccasionFormModalProps) {
  const isEditing = !!editingOccasion;

  const [formData, setFormData] = useState<FormData>({
    occasionId: 0,
    name: "",
    description: "",
    dateOccasion: format(selectedDate, 'yyyy-MM-dd'),
    startTime: "09:00",
    endTime: "17:00",
    weatherSnapshot: "Sunny",
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

  // Load editing data
  useEffect(() => {
    if (editingOccasion) {
      // Parse datetime strings back to separate date/time
      const dateOccasion = format(new Date(editingOccasion.dateOccasion), 'yyyy-MM-dd');
      const startTime = format(new Date(editingOccasion.startTime), 'HH:mm');
      const endTime = format(new Date(editingOccasion.endTime), 'HH:mm');

      setFormData({
        occasionId: editingOccasion.occasionId,
        name: editingOccasion.name,
        description: editingOccasion.description,
        dateOccasion: dateOccasion,
        startTime: startTime,
        endTime: endTime,
        weatherSnapshot: editingOccasion.weatherSnapshot,
      });
    } else {
      // Reset for new occasion
      setFormData({
        occasionId: 0,
        name: "",
        description: "",
        dateOccasion: format(selectedDate, 'yyyy-MM-dd'),
        startTime: "09:00",
        endTime: "17:00",
        weatherSnapshot: "Sunny",
      });
    }
  }, [editingOccasion, selectedDate, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if date is in the past (only for new occasions, not editing)
    if (!isEditing) {
      const selectedDateObj = new Date(formData.dateOccasion);
      const today = startOfDay(new Date());
      const selectedDateOnly = startOfDay(selectedDateObj);

      if (isBefore(selectedDateOnly, today)) {
        setIsPastDateDialogOpen(true);
        return;
      }
    }

    // Transform to API format: combine date + time to full datetime
    const payload = {
      occasionId: formData.occasionId,
      name: formData.name,
      description: formData.description,
      dateOccasion: `${formData.dateOccasion}T${formData.startTime}:00`,
      startTime: `${formData.dateOccasion}T${formData.startTime}:00`,
      endTime: `${formData.dateOccasion}T${formData.endTime}:00`,
      weatherSnapshot: formData.weatherSnapshot,
    };

    console.log('📤 Submitting occasion:', { isEditing, payload });

    if (isEditing && editingOccasion) {
      updateOccasion(
        { id: editingOccasion.id, data: payload },
        {
          onSuccess: () => {
            console.log('✅ Occasion updated');
            onOpenChange(false);
          },
        }
      );
    } else {
      createOccasion(payload, {
        onSuccess: () => {
          console.log('✅ Occasion created');
          onOpenChange(false);
        },
      });
    }
  };

  const handleDelete = () => {
    if (!editingOccasion) return;
    
    if (confirm(`Are you sure you want to delete "${editingOccasion.name}"?`)) {
      deleteOccasion(editingOccasion.id, {
        onSuccess: () => {
          console.log('✅ Occasion deleted');
          onOpenChange(false);
        },
      });
    }
  };

  if (!open) return null;

  const isPending = isCreating || isUpdating || isDeleting;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60"
        onClick={() => !isPending && onOpenChange(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-61 flex items-center justify-center p-4">
        <div
          className="w-[600px] max-w-[95vw] rounded-3xl overflow-hidden shadow-2xl bg-linear-to-br from-slate-900/95 via-blue-900/95 to-slate-900/95 backdrop-blur-xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-8 pt-6 pb-4 shrink-0 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-dela-gothic text-2xl font-bold text-white">
                    {isEditing ? '✏️ Edit Occasion' : '➕ New Occasion'}
                  </h2>
                  <p className="font-bricolage text-gray-300 mt-1 text-sm">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 px-8 py-6 overflow-y-auto">
              <div className="space-y-5">
                {/* Occasion Type */}
                <div>
                  <label className="block font-bricolage text-sm font-semibold text-white mb-2">
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
                  <label className="block font-bricolage text-sm font-semibold text-white mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Team Lunch, Birthday Party"
                    required
                    disabled={isPending}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bricolage text-sm font-semibold text-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add details about this occasion..."
                    rows={3}
                    disabled={isPending}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-none"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block font-bricolage text-sm font-semibold text-white mb-2">
                    Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="date"
                      value={formData.dateOccasion}
                      onChange={(e) => setFormData({ ...formData, dateOccasion: e.target.value })}
                      min={isEditing ? undefined : format(new Date(), 'yyyy-MM-dd')}
                      required
                      disabled={isPending}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    />
                  </div>
                  {!isEditing && (
                    <p className="text-[11px] text-white/50 mt-1">
                      You can only create occasions for today or future dates
                    </p>
                  )}
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bricolage text-sm font-semibold text-white mb-2">
                      Start Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        required
                        disabled={isPending}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bricolage text-sm font-semibold text-white mb-2">
                      End Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        required
                        disabled={isPending}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Weather Snapshot */}
                <div>
                  <label className="block font-bricolage text-sm font-semibold text-white mb-2">
                    Weather Info
                  </label>
                  <input
                    type="text"
                    value={formData.weatherSnapshot}
                    onChange={(e) => setFormData({ ...formData, weatherSnapshot: e.target.value })}
                    placeholder="e.g., Sunny, 25°C"
                    disabled={isPending}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 pb-6 pt-4 shrink-0 border-t border-white/10">
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
    </>
  );
}
