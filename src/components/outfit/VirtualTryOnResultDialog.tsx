"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Download, Share2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Image } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import GlassButton from "@/components/ui/glass-button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSharePostStore } from "@/store/share-post-store";

interface VirtualTryOnResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resultUrl: string | null;
  isGenerating: boolean;
  onRegenerate?: () => void;
  selectedItemIds?: number[];
  selectedOutfitId?: number | null;
}

const loadingMessages = [
  "AI is analyzing your photo...",
  "Preparing virtual fitting room...",
  "Matching items with your body shape...",
  "Applying realistic lighting and shadows...",
  "Fine-tuning the outfit placement...",
  "Almost there! Creating your virtual try-on...",
];

export function VirtualTryOnResultDialog({
  open,
  onOpenChange,
  resultUrl,
  isGenerating,
  onRegenerate,
  selectedItemIds = [],
  selectedOutfitId = null,
}: VirtualTryOnResultDialogProps) {
  const router = useRouter();
  const { setShareData } = useSharePostStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Rotate loading messages every 3 seconds
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  // Reset states when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentMessageIndex(0);
      setImageLoaded(false);
    }
  }, [open]);

  // Lock body scroll when modal is open - use priority z-index to override any previous locks
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;
      
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      
      return () => {
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        document.body.style.overflow = originalOverflow;
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

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

  // Handle share - Open community post creation with pre-filled data
  const handleShare = useCallback(async () => {
    if (!resultUrl) return;

    setIsSharing(true);
    try {
      // Set share data in store with items/outfit if available
      setShareData({
        imageUrl: resultUrl,
        caption: "Experience with Virtual Try On on Smart Outfit Planner",
        outfitId: selectedOutfitId || undefined,
        itemIds: selectedItemIds.length > 0 ? selectedItemIds : undefined,
      });

      // Close this dialog
      onOpenChange(false);

      // Navigate to community page - the modal will open automatically
      router.push("/community?openPost=true");
      
      toast.success("Opening post creation...");
    } catch (error) {
      console.error("❌ Share error:", error);
      toast.error("Failed to open post creation");
    } finally {
      setIsSharing(false);
    }
  }, [resultUrl, setShareData, onOpenChange, router, selectedItemIds, selectedOutfitId]);

  if (!open) return null;

  // Prevent wheel event from propagating to background - completely block all scroll
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-hidden"
      onWheel={handleWheel}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={() => !isGenerating && onOpenChange(false)}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-5xl h-[85vh] rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden"
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-br from-[#4A90E2]/20 via-[#5BA3F5]/10 to-[#4A90E2]/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#4A90E2]/30 to-[#5BA3F5]/30 backdrop-blur-sm">
              {isGenerating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
              ) : (
                <CheckCircle2 className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-bricolage">
                {isGenerating ? "Generating Your Virtual Try-On" : "Virtual Try-On Result"}
              </h2>
              <p className="text-xs text-white/70 mt-0.5">
                {isGenerating ? "Please wait while AI works its magic..." : "Your AI-generated try-on is ready!"}
              </p>
            </div>
          </div>
          <button
            onClick={() => !isGenerating && onOpenChange(false)}
            disabled={isGenerating}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={isGenerating ? "Please wait for generation to complete" : "Close"}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-hidden flex items-center justify-center">
          <div className="w-full h-full max-h-full rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 border border-white/20 relative flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                // Loading State with Animation
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-8"
                >
                  {/* Animated Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4A90E2]/20 via-[#5BA3F5]/20 to-[#4A90E2]/20 animate-pulse" />
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </div>

                  {/* Spinning Icon */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="relative z-10"
                  >
                    <div className="p-6 rounded-full bg-gradient-to-br from-[#4A90E2]/30 to-[#5BA3F5]/30 backdrop-blur-sm">
                      <Sparkles className="w-16 h-16 text-white" />
                    </div>
                  </motion.div>

                  {/* Loading Message */}
                  <div className="relative z-10 text-center space-y-4">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={currentMessageIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="text-xl font-semibold text-white font-bricolage"
                      >
                        {loadingMessages[currentMessageIndex]}
                      </motion.p>
                    </AnimatePresence>

                    {/* Progress Dots */}
                    <div className="flex items-center justify-center gap-2">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-white/60"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 1, 0.3],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>

                    <p className="text-sm text-white/50">
                      This may take 15-30 seconds...
                    </p>
                  </div>
                </motion.div>
              ) : resultUrl ? (
                // Result - Two column layout: Image left, Info right
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-full grid grid-cols-1 lg:grid-cols-3 gap-4 p-4"
                >
                  {/* Left: Image */}
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 h-full flex items-center justify-center rounded-xl overflow-hidden bg-white/5 border border-white/10"
                  >
                    <Image
                      src={resultUrl}
                      alt="Virtual try-on result"
                      className="max-w-full max-h-full object-contain"
                      style={{ maxHeight: "calc(85vh - 180px)" }}
                      preview={{
                        mask: (
                          <div className="flex flex-col items-center gap-2">
                            <Sparkles className="w-8 h-8" />
                            <span>Click to view full size</span>
                          </div>
                        ),
                        zIndex: 10001,
                      }}
                      onLoad={() => setImageLoaded(true)}
                    />
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-xl">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </motion.div>

                  {/* Right: Info Panel */}
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col gap-4 h-full"
                  >
                    {/* Success Badge */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-sm font-medium text-green-300">
                        Generation Complete
                      </span>
                    </div>

                    {/* Info Cards */}
                    <div className="flex-1 space-y-3">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-[#4A90E2]/10 to-[#5BA3F5]/10 border border-white/10">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/20 flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-blue-300" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-1">
                              AI-Generated Result
                            </h4>
                            <p className="text-xs text-white/70 leading-relaxed">
                              This image was created using advanced AI technology to virtually try on your selected items.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-white/10">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-amber-500/20 flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-amber-300" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-1">
                              Important Notice
                            </h4>
                            <p className="text-xs text-white/70 leading-relaxed">
                              The result may not be 100% accurate. Colors, fit, and proportions might differ from actual products.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-gradient-to-br from-[#4A90E2]/10 to-[#5BA3F5]/10 border border-white/10">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-[#4A90E2]/20 flex-shrink-0">
                            <Share2 className="w-5 h-5 text-[#5BA3F5]" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-1">
                              Share Your Look
                            </h4>
                            <p className="text-xs text-white/70 leading-relaxed">
                              Love the result? Download or share it with your friends to get their opinions!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {onRegenerate && (
                        <GlassButton
                          variant="primary"
                          size="md"
                          onClick={onRegenerate}
                          className="w-full justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Regenerate</span>
                        </GlassButton>
                      )}
                      <GlassButton
                        variant={onRegenerate ? "secondary" : "primary"}
                        size="md"
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="w-full justify-center"
                      >
                        {isDownloading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Download Image</span>
                          </>
                        )}
                      </GlassButton>

                      <GlassButton
                        variant="secondary"
                        size="md"
                        onClick={handleShare}
                        disabled={isSharing}
                        className="w-full justify-center"
                      >
                        {isSharing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Sharing...</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4" />
                            <span>Share Result</span>
                          </>
                        )}
                      </GlassButton>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                // Error State
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/60"
                >
                  <AlertCircle className="w-16 h-16" />
                  <p className="text-lg font-medium">Failed to generate virtual try-on</p>
                  <p className="text-sm">Please try again later</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
