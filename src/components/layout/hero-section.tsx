"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";
import { motion } from "framer-motion";

export default function HeroSection() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/register");
  };

  const handleViewWardrobe = () => {
    router.push("/wardrobe");
  };

  return (
    <section id="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/40 to-cyan-500/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-1/2 -right-1/4 w-[700px] h-[700px] bg-gradient-to-tl from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md border border-blue-400/30 rounded-full text-sm font-bricolage font-semibold mb-6 shadow-lg shadow-blue-500/20"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              AI-Powered Style Assistant
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-dela-gothic text-5xl md:text-6xl lg:text-7xl leading-tight mb-6"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                Dress Smarter.
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300">
                Every Day.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="font-bricolage text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed"
            >
              Never waste time choosing what to wear. Get personalized outfit recommendations based on weather, calendar, and your unique style.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <GlassButton
                className="font-bricolage font-bold text-lg group"
                size="lg"
                variant="primary"
                onClick={handleGetStarted}
                borderRadius="12px"
                blur="7px"
                brightness={1.1}
                glowColor="rgba(6, 182, 212, 0.5)"
                glowIntensity={10}
                borderColor="rgba(255, 255, 255, 0.3)"
                borderWidth="2px"
                displacementScale={10}
                backgroundColor="rgba(6, 182, 212, 1)"
              >
                Suggest My Outfit
                <ArrowRight className="ml-2 inline-block group-hover:translate-x-1 transition-transform" size={20} />
              </GlassButton>
              <GlassButton
                className="font-bricolage font-bold text-lg"
                textColor="rgba(255, 255, 255, 1)"
                size="lg"
                variant="outline"
                onClick={handleViewWardrobe}
                borderRadius="12px"
                blur="10px"
                brightness={1.1}
                glowColor="rgba(255, 255, 255, 0.3)"
                glowIntensity={6}
                borderColor="rgba(255, 255, 255, 0.5)"
                borderWidth="2px"
                backgroundColor="rgba(255, 255, 255, 0.1)"
                displacementScale={10}
              >
                See How It Works
              </GlassButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex items-center gap-8 flex-wrap text-white/80 mt-8"
            >
              <div className="flex items-center gap-2">
                <Check className="text-green-400" size={20} />
                <span className="font-bricolage text-sm">14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-green-400" size={20} />
                <span className="font-bricolage text-sm">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-green-400" size={20} />
                <span className="font-bricolage text-sm">Cancel anytime</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right column - Outfit mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative"
          >
            <motion.div
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative"
            >
              <GlassCard
                padding="2rem"
                blur="20px"
                brightness={1.15}
                glowColor="rgba(255, 255, 255, 0.2)"
                glowIntensity={8}
                borderColor="rgba(255, 255, 255, 0.3)"
                borderWidth="1px"
                borderRadius="24px"
                className="shadow-2xl shadow-blue-900/50 bg-white/10"
              >
                <div className="w-full flex flex-col">
                  {/* Mock outfit card */}
                  <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white font-bricolage font-semibold text-lg">Today&apos;s Pick</span>
                      <span className="px-3 py-1 bg-green-400/20 text-green-100 text-sm rounded-full font-bricolage font-semibold">
                        Perfect Match
                      </span>
                    </div>

                    <div className="bg-white/5 rounded-xl h-64 flex items-center justify-center mb-4 overflow-hidden relative">
                      {/* Floating clothing images inside mockup */}
                      <motion.div
                        animate={{
                          rotate: [-5, 5, -5],
                          y: [0, -10, 0]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute left-1/4 top-1/4"
                      >
                        <div className="relative w-36 h-36">
                          <Image
                            src="/skirt.png"
                            alt="Skirt"
                            fill
                            className="object-contain drop-shadow-xl"
                            priority
                          />
                        </div>
                      </motion.div>
                      <motion.div
                        animate={{
                          rotate: [5, -5, 5],
                          y: [0, 10, 0]
                        }}
                        transition={{
                          duration: 4.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute right-1/4 bottom-1/4"
                      >
                        <div className="relative w-36 h-36">
                          <Image
                            src="/jacket.png"
                            alt="Jacket"
                            fill
                            className="object-contain drop-shadow-xl"
                            priority
                          />
                        </div>
                      </motion.div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-blue-400/20 text-blue-100 text-sm rounded-lg font-bricolage">
                        Business Casual
                      </span>
                      <span className="px-3 py-1 bg-purple-400/20 text-purple-100 text-sm rounded-lg font-bricolage">
                        62°F
                      </span>
                      <span className="px-3 py-1 bg-orange-400/20 text-orange-100 text-sm rounded-lg font-bricolage">
                        Office Ready
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <GlassButton
                      className="font-bricolage font-semibold px-12"
                      size="md"
                      variant="primary"
                      onClick={handleViewWardrobe}
                      borderRadius="10px"
                      blur="5px"
                      brightness={1.2}
                      glowColor="rgba(59, 130, 246, 0.5)"
                      glowIntensity={8}
                      borderColor="rgba(148, 163, 184, 0.3)"
                      borderWidth="1px"
                      textColor="rgba(19, 19, 19, 1)"
                      backgroundColor="rgb(216, 234, 254)"
                    >
                      View Details
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Floating info cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4"
            >
              <GlassCard
                padding="1rem"
                blur="15px"
                brightness={1.2}
                glowColor="rgba(255, 255, 255, 0.3)"
                glowIntensity={6}
                borderColor="rgba(255, 255, 255, 0.4)"
                borderWidth="1px"
                borderRadius="16px"
                backgroundColor="rgba(255, 255, 255, 0.15)"
                className="shadow-xl"
              >
                <div className="text-white text-center">
                  <div className="font-dela-gothic text-2xl font-bold">85%</div>
                  <div className="font-bricolage text-xs text-white/80">Confidence</div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-4 -left-4"
            >
              <GlassCard
                padding="1rem"
                blur="15px"
                brightness={1.2}
                glowColor="rgba(255, 255, 255, 0.3)"
                glowIntensity={6}
                borderColor="rgba(255, 255, 255, 0.4)"
                borderWidth="1px"
                borderRadius="16px"
                backgroundColor="rgba(255, 255, 255, 0.15)"
                className="shadow-xl"
              >
                <div className="text-white text-center">
                  <div className="font-dela-gothic text-2xl font-bold">62°F</div>
                  <div className="font-bricolage text-xs text-white/80">Partly Cloudy</div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
