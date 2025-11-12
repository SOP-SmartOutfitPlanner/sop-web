"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/hooks/useScrollLock";

export type ReportDialogReason =
  | "inappropriate"
  | "spam"
  | "harassment"
  | "impersonation"
  | "other";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (description: string) => Promise<void>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  className?: string;
}

const DEFAULT_REASONS: { label: string; value: ReportDialogReason }[] = [
  { label: "Inappropriate or explicit content", value: "inappropriate" },
  { label: "Spam, scam, or misleading content", value: "spam" },
  { label: "Harassment or hate speech", value: "harassment" },
  { label: "Impersonation or false identity", value: "impersonation" },
  { label: "Other", value: "other" },
];

const REASON_MAP: Record<ReportDialogReason, string> = {
  inappropriate: "Inappropriate or explicit content",
  spam: "Spam, scam, or misleading content",
  harassment: "Harassment or hate speech",
  impersonation: "Impersonation or false identity",
  other: "Other",
};

export function ReportDialog({
  open,
  onOpenChange,
  onSubmit,
  title = "Report Content",
  description = "Help us understand what's wrong with this content. Our moderation team will review your report.",
  confirmLabel = "Submit report",
  cancelLabel = "Cancel",
  className,
}: ReportDialogProps) {
  const [selectedReason, setSelectedReason] =
    useState<ReportDialogReason>("inappropriate");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useScrollLock(open);

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setSelectedReason("inappropriate");
      setCustomReason("");
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [open]);

  const finalDescription = useMemo(() => {
    if (selectedReason === "other") {
      return customReason.trim();
    }
    return REASON_MAP[selectedReason];
  }, [selectedReason, customReason]);

  const handleSubmit = async () => {
    if (!finalDescription) {
      setErrorMessage("Please provide a reason before submitting.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onSubmit(finalDescription);
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to submit report. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "max-w-md backdrop-blur-xl bg-gradient-to-br from-cyan-950/70 via-blue-950/60 to-indigo-950/60 border border-cyan-400/20 shadow-2xl shadow-cyan-500/20 text-white",
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-blue-100/80">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup
            value={selectedReason}
            onValueChange={(value) =>
              setSelectedReason(value as ReportDialogReason)
            }
            className="space-y-3"
          >
            {DEFAULT_REASONS.map((reason) => (
              <label
                key={reason.value}
                className="flex items-start gap-3 rounded-xl border border-cyan-400/10 bg-white/5 px-3 py-2.5 shadow-inner shadow-cyan-500/5 transition hover:border-cyan-400/30 hover:bg-cyan-500/5"
              >
                <RadioGroupItem
                  value={reason.value}
                  className="mt-1 border-cyan-400/40 text-cyan-300 focus-visible:ring-cyan-400"
                />
                <span className="text-sm text-blue-100">{reason.label}</span>
              </label>
            ))}
          </RadioGroup>

          {selectedReason === "other" && (
            <Textarea
              value={customReason}
              onChange={(event) => setCustomReason(event.target.value)}
              placeholder="Let us know why you're reporting this content..."
              className="min-h-[96px] resize-none border-cyan-400/20 bg-white/5 text-sm text-blue-100 placeholder:text-blue-200/50 focus-visible:ring-cyan-400/40"
            />
          )}

          {errorMessage && (
            <p className="text-sm text-rose-300/90">{errorMessage}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="border border-transparent text-slate-200 hover:border-cyan-400/40 hover:bg-cyan-500/10"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-cyan-500/80 to-blue-500/80 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30 disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

