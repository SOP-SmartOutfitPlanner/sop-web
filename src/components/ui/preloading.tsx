'use client'
import React, { useState, useEffect } from 'react';

const LoadingPreloader = () => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate asset loading with multiple steps
    const loadAssets = async () => {
      const steps = [
        { name: 'fonts', duration: 300 },
        { name: 'images', duration: 500 },
        { name: 'scripts', duration: 400 },
        { name: 'styles', duration: 300 },
        { name: 'data', duration: 200 }
      ];

      let currentProgress = 0;
      const increment = 100 / steps.length;

      for (const step of steps) {
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, step.duration));
        
        // Smooth progress increment
        const targetProgress = Math.min(currentProgress + increment, 100);
        animateProgress(currentProgress, targetProgress);
        currentProgress = targetProgress;
      }

      // Ensure we reach 100%
      setProgress(100);
      
      // Small delay before hiding loader
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    };

    loadAssets();
  }, []);

  const animateProgress = (from: number, to: number) => {
    const duration = 200;
    const steps = 20;
    const increment = (to - from) / steps;
    let current = from;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      setProgress(Math.min(Math.round(current), 100));

      if (step >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);
  };

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#5490ff]">

      <div className="relative z-10 text-center">
        <div className="relative w-48 h-48 mb-8 mx-auto">
          {/* Percentage text */}
          <div className="absolute font-dela-gothic inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-1">
                {progress}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPreloader;