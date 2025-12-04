"use client";

import { ReactNode } from "react";
import { X, Loader2 } from "lucide-react";
import GlassButton from "@/components/ui/glass-button";
import { useScrollLock } from "@/hooks/useScrollLock";

export interface AdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void | Promise<void>;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconClassName?: string;
  children: ReactNode;
  confirmButtonText?: string;
  confirmButtonIcon?: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  maxWidth?: string;
  maxHeight?: string;
  confirmButtonColor?: string;
  confirmButtonBorderColor?: string;
  showFooter?: boolean;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
  customFooter?: ReactNode;
  cancelButtonText?: string;
  contentClassName?: string;
  variant?: "default" | "danger";
}

export function AdminModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  subtitle,
  icon,
  iconClassName = "from-cyan-500 to-blue-600",
  children,
  confirmButtonText = "Confirm",
  confirmButtonIcon,
  isLoading = false,
  loadingText = "Processing...",
  maxWidth = "480px",
  maxHeight,
  confirmButtonColor,
  confirmButtonBorderColor,
  showFooter = true,
  showCancelButton = true,
  showConfirmButton = true,
  customFooter,
  cancelButtonText = "Cancel",
  contentClassName = "",
  variant = "default",
}: AdminModalProps) {
  // Lock scroll when modal is open
  useScrollLock(open);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  // Set default button colors based on variant
  const defaultConfirmColor =
    variant === "danger" ? "rgba(239, 68, 68, 0.8)" : "rgba(59, 130, 246, 0.8)";
  const defaultConfirmBorderColor =
    variant === "danger" ? "rgba(239, 68, 68, 1)" : "rgba(59, 130, 246, 1)";

  const finalConfirmColor = confirmButtonColor || defaultConfirmColor;
  const finalConfirmBorderColor =
    confirmButtonBorderColor || defaultConfirmBorderColor;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed h-full inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => !isLoading && onOpenChange(false)}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-51 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="max-w-[95vw] rounded-3xl overflow-hidden shadow-2xl pointer-events-auto relative flex flex-col"
          style={{
            width: maxWidth,
            ...(maxHeight ? { height: maxHeight, maxHeight: "95vh" } : {}),
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
          data-modal-root="true"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-slate-900/95">
            <div className="absolute top-0 -right-32 w-[400px] h-[400px] bg-blue-200/15 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] bg-cyan-200/15 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="px-6 pt-5 pb-3 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${iconClassName} text-white shadow-lg`}
                    >
                      {icon}
                    </div>
                  )}
                  <div>
                    <h2 className="font-dela-gothic text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                      {title}
                    </h2>
                    {subtitle && (
                      <p className="font-bricolage text-sm text-gray-300 mt-0.5">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => !isLoading && onOpenChange(false)}
                  disabled={isLoading}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Close modal"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div
              className={`px-6 py-4 ${
                maxHeight ? "flex-1 min-h-0 overflow-y-auto" : ""
              } ${contentClassName}`}
            >
              {children}
            </div>

            {/* Footer */}
            {showFooter && (
              <div className="px-6 pb-5 pt-3 shrink-0 border-t border-white/10">
                {customFooter || (
                  <div className="flex items-center justify-end gap-3">
                    {showCancelButton && (
                      <GlassButton
                        variant="outline"
                        size="md"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="text-base"
                      >
                        {cancelButtonText}
                      </GlassButton>
                    )}
                    {showConfirmButton && (
                      <GlassButton
                        variant="custom"
                        size="md"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        backgroundColor={finalConfirmColor}
                        borderColor={finalConfirmBorderColor}
                        className="min-w-[120px] text-base"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {loadingText}
                          </>
                        ) : (
                          <>
                            {confirmButtonIcon}
                            {confirmButtonText}
                          </>
                        )}
                      </GlassButton>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
