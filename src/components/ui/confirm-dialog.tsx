"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import GlassButton from "./glass-button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const variantColors = {
    danger: {
      icon: "text-red-400",
      iconBg: "bg-red-500/20",
      border: "border-red-400/30",
      button: {
        bg: "rgba(239, 68, 68, 0.6)",
        border: "rgba(239, 68, 68, 0.8)",
      },
    },
    warning: {
      icon: "text-yellow-400",
      iconBg: "bg-yellow-500/20",
      border: "border-yellow-400/30",
      button: {
        bg: "rgba(251, 191, 36, 0.6)",
        border: "rgba(251, 191, 36, 0.8)",
      },
    },
    info: {
      icon: "text-blue-400",
      iconBg: "bg-blue-500/20",
      border: "border-blue-400/30",
      button: {
        bg: "rgba(59, 130, 246, 0.6)",
        border: "rgba(59, 130, 246, 0.8)",
      },
    },
  };

  const colors = variantColors[variant];

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !isLoading && onOpenChange(false)}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-linear-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 bg-white/5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-xl ${colors.iconBg} border ${colors.border} shrink-0`}>
                  {variant === "danger" ? (
                    <Trash2 className={`w-6 h-6 ${colors.icon}`} />
                  ) : (
                    <AlertTriangle className={`w-6 h-6 ${colors.icon}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bricolage text-xl font-bold text-white">
                    {title}
                  </h3>
                  <p className="font-poppins text-sm text-white/70 mt-1.5 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all shrink-0"
                disabled={isLoading}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-5 bg-white/5">
            <div className="flex items-center justify-end gap-3">
              <GlassButton
                variant="ghost"
                size="md"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="min-w-[100px]"
              >
                {cancelText}
              </GlassButton>
              <GlassButton
                variant="custom"
                size="md"
                backgroundColor={colors.button.bg}
                borderColor={colors.button.border}
                textColor="white"
                onClick={handleConfirm}
                disabled={isLoading}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  confirmText
                )}
              </GlassButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
