"use client";

import { useState, useCallback } from "react";
import { X, Download, Share2, Sparkles, CheckCircle2 } from "lucide-react";
import { Image } from "antd";
import GlassButton from "@/components/ui/glass-button";
import { toast } from "sonner";

interface VirtualTryOnResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resultUrl: string;
}

export function VirtualTryOnResultDialog({
  open,
  onOpenChange,
  resultUrl,
}: VirtualTryOnResultDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Handle download image
  const handleDownload = useCallback(async () => {
    if (!resultUrl) return;

    setIsDownloading(true);
    try {
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `virtual-tryon-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("❌ Download error:", error);
      toast.error("Failed to download image");
    } finally {
      setIsDownloading(false);
    }
  }, [resultUrl]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (!resultUrl) return;

    setIsSharing(true);
    try {
      if (navigator.share) {
        // Use native share if available
        await navigator.share({
          title: "My Virtual Try-On",
          text: "Check out my virtual try-on result!",
          url: resultUrl,
        });
        toast.success("Shared successfully!");
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(resultUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      // User cancelled share or error occurred
      if ((error as Error).name !== "AbortError") {
        console.error("❌ Share error:", error);
        toast.error("Failed to share");
      }
    } finally {
      setIsSharing(false);
    }
  }, [resultUrl]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-blue-500/20 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-sm">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-bricolage">
                Virtual Try-On Result
              </h2>
              <p className="text-sm text-white/70 mt-0.5">
                Your AI-generated try-on is ready!
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          <div className="flex flex-col items-center gap-6">
            {/* Success Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <Sparkles className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-green-300">
                Generation Complete
              </span>
            </div>

            {/* Result Image */}
            <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden bg-white/5 border border-white/20 shadow-2xl">
              <Image
                src={resultUrl}
                alt="Virtual try-on result"
                width="100%"
                className="w-full h-auto"
                preview={{
                  mask: (
                    <div className="flex flex-col items-center gap-2">
                      <Sparkles className="w-8 h-8" />
                      <span>Click to view full size</span>
                    </div>
                  ),
                }}
                placeholder={
                  <div className="flex items-center justify-center h-96 bg-white/5">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                }
              />
            </div>

            {/* Info Card */}
            <div className="w-full max-w-2xl p-4 rounded-xl bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 border border-white/10">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-300" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white mb-1">
                    AI-Generated Result
                  </h4>
                  <p className="text-xs text-white/70 leading-relaxed">
                    This image was generated using advanced AI technology. The result may not be 100% accurate
                    and is intended for preview purposes only.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between gap-4 p-6 border-t border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-white/5 backdrop-blur-xl">
          <div className="flex gap-3">
            <GlassButton
              variant="secondary"
              size="md"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </>
              )}
            </GlassButton>

            <GlassButton
              variant="secondary"
              size="md"
              onClick={handleShare}
              disabled={isSharing}
            >
              {isSharing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sharing...</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </>
              )}
            </GlassButton>
          </div>

          <GlassButton
            variant="primary"
            size="md"
            onClick={() => onOpenChange(false)}
          >
            Done
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
