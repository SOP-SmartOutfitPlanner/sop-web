"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Calendar,
  CloudSun,
  RefreshCw,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import { motion, AnimatePresence } from "framer-motion";

const demoOutfits = [
  {
    occasion: "Business Meeting",
    weather: { temp: 72, condition: "Partly Cloudy", icon: CloudSun },
    calendar: "Client Presentation at 2 PM",
    items: [
      { name: "Vest", image: "/vest.png", type: "top" },
      { name: "Formal Trouser", image: "/trouser.png", type: "bottom" },
      { name: "Formal Boots", image: "/formalBoots.png", type: "shoes" },
    ],
    confidence: 94,
  },
  {
    occasion: "Weekend Brunch",
    weather: { temp: 68, condition: "Sunny", icon: CloudSun },
    calendar: "Brunch with Friends at 11 AM",
    items: [
      { name: "Pink Jacket", image: "/pinkJacket.png", type: "top" },
      { name: "Casual Skirt", image: "/skirt.png", type: "bottom" },
      { name: "Sneakers", image: "/sneaker.png", type: "shoes" },
    ],
    confidence: 89,
  },
  {
    occasion: "Summer Garden Party",
    weather: { temp: 78, condition: "Clear", icon: CloudSun },
    calendar: "Garden Party at 4 PM",
    items: [
      { name: "Pink Dress", image: "/dress.png", type: "dress" },
      { name: "High Heels", image: "/heel.png", type: "shoes" },
      { name: "Sun Hat", image: "/hat.png", type: "accessory" },
    ],
    confidence: 92,
  },
];

export default function HowItWorksSection() {
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSuggestOutfit = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setCurrentOutfitIndex((prev) => (prev + 1) % demoOutfits.length);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <section id="how-it-works-section" className="py-24 px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background effects */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full text-sm font-bricolage font-semibold text-blue-300 mb-6"
          >
            How It Works
          </motion.div>
          <h2 className="font-dela-gothic text-4xl md:text-5xl lg:text-6xl text-white mb-6">
            Experience the Magic
          </h2>
          <p className="font-bricolage text-xl text-blue-100 max-w-2xl mx-auto">
            Watch how our AI creates the perfect outfit for any occasion
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Interactive Demo Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentOutfitIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                <GlassCard
                  padding="2rem"
                  blur="20px"
                  brightness={1.1}
                  glowColor="rgba(255, 255, 255, 0.2)"
                  glowIntensity={8}
                  borderColor="rgba(255, 255, 255, 0.2)"
                  borderWidth="1px"
                  borderRadius="24px"
                  className="bg-white/10 shadow-2xl"
                >
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-bricolage font-bold text-2xl text-white">
                        Today&apos;s Suggestion
                      </h3>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full font-bricolage font-semibold border border-green-400/30">
                        {demoOutfits[currentOutfitIndex].confidence}% Match
                      </span>
                    </div>

                    {/* Occasion Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full">
                      <Sparkles size={16} className="text-blue-300" />
                      <span className="font-bricolage font-semibold text-blue-200">
                        {demoOutfits[currentOutfitIndex].occasion}
                      </span>
                    </div>

                    {/* Weather & Calendar Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          {(() => {
                            const WeatherIcon = demoOutfits[currentOutfitIndex].weather.icon;
                            return <WeatherIcon size={20} className="text-blue-300" />;
                          })()}
                          <span className="font-bricolage text-sm text-blue-200">Weather</span>
                        </div>
                        <p className="font-dela-gothic text-2xl text-white">
                          {demoOutfits[currentOutfitIndex].weather.temp}°F
                        </p>
                        <p className="font-bricolage text-sm text-blue-100">
                          {demoOutfits[currentOutfitIndex].weather.condition}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar size={20} className="text-purple-300" />
                          <span className="font-bricolage text-sm text-purple-200">Calendar</span>
                        </div>
                        <p className="font-bricolage text-sm text-white leading-relaxed">
                          {demoOutfits[currentOutfitIndex].calendar}
                        </p>
                      </div>
                    </div>

                    {/* Outfit Items */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h4 className="font-bricolage font-semibold text-white mb-4 flex items-center gap-2">
                        <ImageIcon size={18} className="text-blue-300" />
                        Outfit Items
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {demoOutfits[currentOutfitIndex].items.map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white/10 rounded-lg p-3 border border-white/20 hover:border-blue-400/50 transition-all"
                          >
                            <div className="relative w-full h-24 mb-2 bg-white/5 rounded-lg overflow-hidden">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-contain p-2"
                              />
                            </div>
                            <p className="font-bricolage text-xs text-white text-center font-semibold">
                              {item.name}
                            </p>
                            <p className="font-bricolage text-[10px] text-blue-200 text-center capitalize mt-1">
                              {item.type}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSuggestOutfit}
                      disabled={isGenerating}
                      className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bricolage font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw size={20} className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={20} />
                          Suggest Another Outfit
                        </>
                      )}
                    </motion.button>
                  </div>
                </GlassCard>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Right: Features List */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            {[
              {
                icon: Sparkles,
                title: "AI-Powered Suggestions",
                description: "Advanced algorithms analyze your wardrobe, weather, and calendar to create perfect outfit combinations.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: CloudSun,
                title: "Weather Integration",
                description: "Real-time weather data ensures you're always dressed appropriately for the conditions.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Calendar,
                title: "Calendar Sync",
                description: "Connect your calendar to get outfit suggestions tailored to your daily events and meetings.",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: TrendingUp,
                title: "Smart Learning",
                description: "The AI learns your preferences over time, making suggestions more personalized each day.",
                color: "from-green-500 to-teal-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <GlassCard
                  padding="1.5rem"
                  blur="20px"
                  brightness={1.1}
                  glowColor="rgba(255, 255, 255, 0.2)"
                  glowIntensity={8}
                  borderColor="rgba(255, 255, 255, 0.2)"
                  borderWidth="1px"
                  borderRadius="16px"
                  className="bg-white/10 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <feature.icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bricolage font-bold text-xl text-white mb-2">
                        {feature.title}
                      </h4>
                      <p className="font-bricolage text-blue-100 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
