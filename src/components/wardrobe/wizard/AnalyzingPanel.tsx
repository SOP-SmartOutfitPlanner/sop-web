"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles, Check } from "lucide-react";

interface AnalysisStep {
  text: string;
  duration: number;
}

const analysisSteps: AnalysisStep[] = [
  { text: "Analyzing image quality", duration: 400 },
  { text: "Detecting clothing item", duration: 500 },
  { text: "Identifying colors", duration: 450 },
  { text: "Analyzing patterns", duration: 400 },
  { text: "Detecting fabric texture", duration: 500 },
  { text: "Determining weather suitability", duration: 350 },
  { text: "Finalizing analysis", duration: 400 },
];

interface AnalyzingPanelProps {
  onProgressUpdate: (progress: number) => void;
}

export function AnalyzingPanel({ onProgressUpdate }: AnalyzingPanelProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let stepIndex = 0;
    let totalElapsed = 0;
    const totalDuration = analysisSteps.reduce((sum, step) => sum + step.duration, 0);

    const showNextStep = () => {
      if (stepIndex < analysisSteps.length) {
        const step = analysisSteps[stepIndex];

        setCurrentStepIndex(stepIndex);

        totalElapsed += step.duration;
        const progress = Math.min((totalElapsed / totalDuration) * 100, 100);
        setCurrentProgress(progress);
        onProgressUpdate(progress);

        setTimeout(() => {
          setCompletedSteps((prev) => [...prev, stepIndex]);
          stepIndex++;

          if (stepIndex < analysisSteps.length) {
            setTimeout(showNextStep, 100);
          }
        }, step.duration - 100);
      }
    };

    showNextStep();
  }, [onProgressUpdate]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="w-full max-w-md mx-auto lg:mx-0"
    >
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }}
                className="p-3 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/30 ring-1 ring-blue-400/40 shadow-lg shadow-blue-500/20"
              >
                <Sparkles className="w-6 h-6 text-blue-300" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-white">Analyzing</h3>
                <p className="text-sm text-white/50">AI processing</p>
              </div>
            </div>

            {/* Progress percentage */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-2xl font-bold text-blue-400"
            >
              {Math.round(currentProgress)}%
            </motion.div>
          </div>

          {/* Steps list */}
          <div className="space-y-3 mb-6">
            {analysisSteps.map((step, index) => {
              const isCompleted = completedSteps.includes(index);
              const isCurrent = currentStepIndex === index && !isCompleted;
              const isPending = index > currentStepIndex;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: isPending ? 0.3 : 1,
                    x: 0,
                  }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  {/* Status indicator */}
                  <div className="relative flex-shrink-0">
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/30"
                      >
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </motion.div>
                    ) : isCurrent ? (
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg shadow-blue-500/50"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20" />
                    )}
                  </div>

                  {/* Step text */}
                  <p
                    className={`text-sm font-medium transition-colors ${
                      isCompleted
                        ? "text-white/70 line-through"
                        : isCurrent
                        ? "text-white"
                        : "text-white/40"
                    }`}
                  >
                    {step.text}
                  </p>

                  {/* Loading dots for current step */}
                  {isCurrent && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="ml-auto"
                    >
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ y: [0, -4, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                            className="w-1 h-1 rounded-full bg-blue-400"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full relative overflow-hidden"
                initial={{ width: "0%" }}
                animate={{ width: `${currentProgress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

