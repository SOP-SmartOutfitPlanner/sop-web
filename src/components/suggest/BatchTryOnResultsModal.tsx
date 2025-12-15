"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
} from "lucide-react";
import Image from "next/image";
import GlassButton from "@/components/ui/glass-button";
import GlassCard from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TryOnResult {
  uuid: number;
  success: boolean;
  url: string | null;
  error: string | null;
  time: string;
}

interface BatchTryOnResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: TryOnResult[];
  outfitNames: string[]; // Names for each outfit (by index/uuid)
  isProcessing?: boolean;
}

export function BatchTryOnResultsModal({
  open,
  onOpenChange,
  results,
  outfitNames,
  isProcessing = false,
}: BatchTryOnResultsModalProps) {
  const [selectedResult, setSelectedResult] = useState<TryOnResult | null>(
    null
  );

  const handleClose = useCallback(() => {
    if (!isProcessing) {
      onOpenChange(false);
      setSelectedResult(null);
    }
  }, [isProcessing, onOpenChange]);

  const handleDownload = useCallback(
    async (url: string, outfitName: string) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${outfitName}-tryon-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        toast.success("Image downloaded successfully!");
      } catch (error) {
        console.error("Download error:", error);
        toast.error("Failed to download image");
      }
    },
    []
  );

  const successCount = results.filter((r) => r.success).length;
  const failedCount = results.filter((r) => !r.success).length;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ overflow: "hidden", touchAction: "none" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-6xl max-h-[90vh] rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-bricolage">
                Virtual Try-On Results
              </h2>
              <p className="text-xs text-white/70 mt-0.5">
                {isProcessing ? (
                  "Processing your outfits..."
                ) : (
                  <>
                    {successCount} successful, {failedCount} failed
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isProcessing ? (
            // Processing State
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-cyan-300" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-white mb-2">
                  AI is processing your outfits...
                </p>
                <p className="text-sm text-white/60">
                  This may take a few minutes. Please wait...
                </p>
              </div>
            </div>
          ) : (
            // Results Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result, index) => {
                const outfitName = outfitNames[index] || `Outfit ${index + 1}`;

                return (
                  <GlassCard
                    key={result.uuid}
                    padding="1rem"
                    borderRadius="16px"
                    blur="8px"
                    brightness={1.05}
                    glowColor={
                      result.success
                        ? "rgba(34, 197, 94, 0.3)"
                        : "rgba(239, 68, 68, 0.3)"
                    }
                    borderColor={
                      result.success
                        ? "rgba(34, 197, 94, 0.3)"
                        : "rgba(239, 68, 68, 0.3)"
                    }
                    className={cn(
                      "cursor-pointer transition-all hover:scale-[1.02]",
                      result.success
                        ? "bg-gradient-to-br from-green-500/10 to-emerald-500/5"
                        : "bg-gradient-to-br from-red-500/10 to-orange-500/5"
                    )}
                    onClick={() => result.success && setSelectedResult(result)}
                  >
                    {/* Outfit Name */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white text-sm truncate flex-1">
                        {outfitName}
                      </h3>
                      {result.success ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      )}
                    </div>

                    {/* Image or Error */}
                    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border border-white/10">
                      {result.success && result.url ? (
                        <Image
                          src={result.url}
                          alt={outfitName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                          <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
                          <p className="text-xs text-red-300 line-clamp-3">
                            {result.error || "Failed to generate"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer Info */}
                    <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                      <span>Time: {result.time}s</span>
                      {result.success && result.url && (
                        <GlassButton
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            handleDownload(result.url!, outfitName)
                          }
                          className="h-7 px-2"
                        >
                          <Download className="w-3 h-3" />
                        </GlassButton>
                      )}
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Full View Modal */}
        <AnimatePresence>
          {selectedResult && selectedResult.url && (
            <div
              className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              onClick={() => setSelectedResult(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={selectedResult.url}
                  alt="Try-on result"
                  width={800}
                  height={1200}
                  className="object-contain max-h-[90vh]"
                  unoptimized
                />
                <button
                  onClick={() => setSelectedResult(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
