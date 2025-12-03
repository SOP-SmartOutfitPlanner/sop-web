"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Sparkles, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";

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

// Outfit options
const OUTFIT_OPTIONS = [
  { value: 1, label: "1 outfit" },
  { value: 2, label: "2 outfits" },
  { value: 3, label: "3 outfits" },
  { value: 4, label: "4 outfits" },
];

interface OutfitConfigPanelProps {
  onGenerate: (config: OutfitConfig) => void;
  isGenerating: boolean;
}

export interface OutfitConfig {
  totalOutfit: number;
  gapDay: number;
}

export function OutfitConfigPanel({
  onGenerate,
  isGenerating,
}: OutfitConfigPanelProps) {
  const [totalOutfit, setTotalOutfit] = useState(3);
  const [gapDay, setGapDay] = useState(() => {
    // Load from localStorage or use default value of 3
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('outfitGapDay');
      return saved ? parseInt(saved, 10) : 3;
    }
    return 3;
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Save gapDay to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('outfitGapDay', gapDay.toString());
    }
  }, [gapDay]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      style={{ overflow: 'visible' }}
    >
      <div className="space-y-6" style={{ overflow: 'visible' }}>
        {/* Header */}
        <div>
          <h3 className="text-xl font-bricolage font-bold bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200 bg-clip-text text-transparent">
            Outfit Generator
          </h3>
          <p className="text-sm text-gray-300 mt-1">
            Generate outfit suggestions for selected date
          </p>
        </div>

        {/* Number of Outfits - Custom Dropdown */}
        <div className="space-y-3" style={{ overflow: 'visible' }}>
          <label className="block text-sm font-semibold text-gray-200 uppercase tracking-wide">
            Number of Outfits
          </label>
          <div ref={dropdownRef} className="relative" style={{ overflow: 'visible' }}>
            {/* Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`
                w-full px-4 py-3 rounded-xl font-medium text-white
                bg-gradient-to-r from-cyan-950/60 to-blue-950/60
                border transition-all duration-200 outline-none
                flex items-center justify-between gap-2
                backdrop-blur-sm
                ${isDropdownOpen 
                  ? 'border-cyan-400 ring-4 ring-cyan-500/20' 
                  : 'border-cyan-400/30 hover:border-cyan-400/50'
                }
              `}
            >
              <span>{OUTFIT_OPTIONS.find(opt => opt.value === totalOutfit)?.label}</span>
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-cyan-300" />
              </motion.div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute z-[9999] w-full mt-2 rounded-xl
                    bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900
                    backdrop-blur-xl border border-cyan-400/30
                    shadow-2xl shadow-cyan-500/20"
                >
                  {OUTFIT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setTotalOutfit(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`
                        w-full px-4 py-3.5 flex items-center justify-between
                        transition-all duration-150
                        ${totalOutfit === option.value 
                          ? 'bg-cyan-500/25 text-cyan-200' 
                          : 'text-gray-300 hover:bg-cyan-500/15 hover:text-white'
                        }
                      `}
                    >
                      <span className="font-medium">{option.label}</span>
                      {totalOutfit === option.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Check className="w-5 h-5 text-cyan-400" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Advanced Settings
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-cyan-400/20">
            {/* Gap Days */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-200 uppercase tracking-wide">
                  Gap Days
                </label>
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  {gapDay}
                </span>
              </div>
              
              {/* Slider */}
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={14}
                  value={gapDay}
                  onChange={(e) => setGapDay(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
                  style={{
                    background: `linear-gradient(to right, #22d3ee 0%, #22d3ee ${(gapDay / 14) * 100}%, rgba(6, 182, 212, 0.2) ${(gapDay / 14) * 100}%, rgba(6, 182, 212, 0.2) 100%)`,
                  }}
                />
                
                {/* Min/Max labels */}
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>0</span>
                  <span>14</span>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Prevent repeating items worn within ±{gapDay} days of the selected date
              </p>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`
            w-full relative overflow-hidden group
            px-6 py-4 rounded-xl font-semibold text-base
            transition-all duration-300 ease-out mb-8
            ${isGenerating 
              ? 'bg-gradient-to-r from-cyan-600/50 to-blue-600/50 cursor-not-allowed' 
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 active:scale-[0.98]'
            }
            text-white shadow-lg shadow-cyan-500/25
            border border-cyan-400/30
            backdrop-blur-sm
          `}
        >
          <div className="relative flex items-center justify-center gap-2">
            {isGenerating ? (
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
          {!isGenerating && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          )}
        </button>
      </div>
    </GlassCard>
  );
}
