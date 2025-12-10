"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";

// Loading messages for generating outfit
const LOADING_MESSAGES = [
  "Looking through your wardrobe...",
  "Analyzing your style preferences...",
  "Checking weather...",
  "Finding the perfect match...",
  "Considering color combinations...",
  "Selecting the best outfits...",
  "Adding finishing touches...",
  "Almost ready...",
];

interface OutfitConfigPanelProps {
  onGenerate: (config: OutfitConfig) => void;
  isGenerating: boolean;
  isWeatherLoading?: boolean;
}

export interface OutfitConfig {
  totalOutfit: number;
  gapDay: number;
}

export function OutfitConfigPanel({
  onGenerate,
  isGenerating,
  isWeatherLoading = false,
}: OutfitConfigPanelProps) {
  const totalOutfit = 4; // Fixed value
  const gapDay = 2; // Fixed value
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Cycle through loading messages
  useEffect(() => {
    if (!isGenerating) {
      setLoadingMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = () => {
    onGenerate({
      totalOutfit,
      gapDay,
    });
  };

  return (
    <GlassCard 
      padding="1.5rem" 
      blur="16px"
      brightness={0.95}
      glowColor="rgba(6, 182, 212, 0.4)"
      borderColor="rgba(34, 211, 238, 0.3)"
      borderWidth="1px"
      className="space-y-6 bg-gradient-to-br from-cyan-950/30 via-blue-900/20 to-indigo-950/30"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bricolage font-bold bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200 bg-clip-text text-transparent">
            Outfit Generator
          </h3>
          <p className="text-sm text-gray-300 mt-1">
            Generate 4 outfit suggestions for today
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || isWeatherLoading}
          className={`
            w-full relative overflow-hidden group
            px-6 py-4 rounded-xl font-semibold text-base
            transition-all duration-300 ease-out mb-8
            ${isGenerating || isWeatherLoading
              ? 'bg-gradient-to-r from-cyan-600/50 to-blue-600/50 cursor-not-allowed' 
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 active:scale-[0.98]'
            }
            text-white shadow-lg shadow-cyan-500/25
            border border-cyan-400/30
            backdrop-blur-sm
          `}
        >
          <div className="relative flex items-center justify-center gap-2">
            {isWeatherLoading ? (
              <>
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent flex-shrink-0" />
                <span>Loading weather...</span>
              </>
            ) : isGenerating ? (
              <>
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent flex-shrink-0" />
                <div className="relative h-6 overflow-hidden">
                  <div 
                    key={loadingMessageIndex}
                    className="animate-slideUp"
                  >
                    <span className="block h-6 leading-6">
                      {LOADING_MESSAGES[loadingMessageIndex]}
                    </span>
                  </div>
                </div>
                <style jsx>{`
                  @keyframes slideUp {
                    0% {
                      transform: translateY(100%);
                      opacity: 0;
                    }
                    20% {
                      transform: translateY(0);
                      opacity: 1;
                    }
                    80% {
                      transform: translateY(0);
                      opacity: 1;
                    }
                    100% {
                      transform: translateY(-100%);
                      opacity: 0;
                    }
                  }
                  .animate-slideUp {
                    animation: slideUp 2s ease-in-out;
                  }
                `}</style>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Outfit Suggestions</span>
              </>
            )}
          </div>
          {!isGenerating && !isWeatherLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          )}
        </button>
      </div>
    </GlassCard>
  );
}
