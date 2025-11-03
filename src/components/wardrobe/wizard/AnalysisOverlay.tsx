"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

interface AnalysisOverlayProps {
  progress?: number;
}

export function AnalysisOverlay({ progress: _progress = 0 }: AnalysisOverlayProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const particleData: Particle[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
      size: 1 + Math.random() * 2,
    }));
    setParticles(particleData);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-10 pointer-events-none rounded-2xl overflow-hidden"
    >
      {/* Base gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-blue-800/20 to-blue-900/30 backdrop-blur-[1px]" />

      {/* Pulsing border */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          boxShadow: "inset 0 0 0 2px rgba(59, 130, 246, 0.4)",
        }}
        animate={{
          boxShadow: [
            "inset 0 0 0 2px rgba(59, 130, 246, 0.3)",
            "inset 0 0 0 2px rgba(96, 165, 250, 0.7)",
            "inset 0 0 0 2px rgba(59, 130, 246, 0.3)",
          ],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Radial glow */}
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
        }}
        animate={{
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Scanning lines */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        {/* Top to bottom scan */}
        <motion.div
          className="absolute left-0 right-0 h-32"
          style={{
            background:
              "linear-gradient(180deg, rgba(147, 197, 253, 0.5) 0%, rgba(59, 130, 246, 0.2) 40%, transparent 100%)",
            filter: "blur(10px)",
          }}
          animate={{
            top: ["-10%", "110%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Bottom to top scan */}
        <motion.div
          className="absolute left-0 right-0 h-24"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)",
            filter: "blur(6px)",
          }}
          animate={{
            bottom: ["-10%", "110%"],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
            delay: 1.5,
          }}
        />
      </div>

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-blue-300"
          style={{
            left: `${particle.x}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            filter: "blur(0.5px)",
            boxShadow: `0 0 ${particle.size * 2}px rgba(147, 197, 253, 0.6)`,
          }}
          animate={{
            y: ["-5%", "105%"],
            opacity: [0, 0.8, 0.8, 0],
            scale: [0.5, 1, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Top edge line */}
      <div className="absolute inset-x-0 top-0 h-px">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-blue-400 to-transparent"
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Bottom edge line */}
      <div className="absolute inset-x-0 bottom-0 h-px">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-blue-400 to-transparent"
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>
    </motion.div>
  );
}

