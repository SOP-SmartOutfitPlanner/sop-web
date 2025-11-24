"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import GlassButton from "@/components/ui/glass-button";
import { useScrollLock } from "@/hooks/useScrollLock";

export interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void | Promise<void>;
  title: string;
  subtitle?: string;
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
}

export function ConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  subtitle,
  children,
  confirmButtonText = "Confirm",
  confirmButtonIcon,
  isLoading = false,
  loadingText = "Processing...",
  maxWidth = "480px",
  maxHeight,
  confirmButtonColor = "rgba(239, 68, 68, 0.8)",
  confirmButtonBorderColor = "rgba(239, 68, 68, 1)",
  showFooter = true,
  showCancelButton = true,
  showConfirmButton = true,
  customFooter,
  cancelButtonText = "Cancel",
  contentClassName = "",
}: ConfirmModalProps) {
  // Lock scroll when modal is open
  useScrollLock(open);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed h-full inset-0 bg-black/60 backdrop-blur-sm z-50" />

      {/* Modal Container */}
      <div className="fixed inset-0 z-51 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="max-w-[95vw] rounded-3xl overflow-hidden shadow-2xl pointer-events-auto relative flex flex-col"
          style={{
            width: maxWidth,
            ...(maxHeight ? { height: maxHeight, maxHeight: "95vh" } : {})
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
          data-modal-root="true"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-linear-to-br from-slate-900/85 via-blue-900/80 to-slate-900/85">
            <div className="absolute top-0 -right-32 w-[400px] h-[400px] bg-blue-200/15 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] bg-cyan-200/15 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="px-6 pt-5 pb-3 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-dela-gothic text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-cyan-200">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="font-bricolage text-sm text-gray-200 mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => !isLoading && onOpenChange(false)}
                  disabled={isLoading}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className={`px-6 py-4 ${maxHeight ? "flex-1 min-h-0 overflow-hidden" : ""} ${contentClassName}`}>
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
                        backgroundColor={confirmButtonColor}
                        borderColor={confirmButtonBorderColor}
                        className="min-w-[120px] text-base"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
