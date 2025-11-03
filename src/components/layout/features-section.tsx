"use client";

import Image from "next/image";
import {
  Sparkles,
  Calendar,
  History,
  CloudSun,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    id: 1,
    icon: Sparkles,
    title: "Smart Recommendations",
    description: "AI-powered outfit suggestions based on weather, calendar events, and your personal style preferences.",
    color: "rgba(168, 85, 247, 0.8)",
  },
  {
    id: 2,
    icon: CloudSun,
    title: "Weather Integration",
    description: "Get outfit suggestions that match the forecast. Never be caught unprepared again.",
    color: "rgba(59, 130, 246, 0.8)",
  },
  {
    id: 3,
    icon: TrendingUp,
    title: "Wardrobe Analytics",
    description: "Discover which items you wear most and identify gaps in your collection.",
    color: "rgba(34, 197, 94, 0.8)",
  },
  {
    id: 4,
    icon: Calendar,
    title: "Calendar Sync",
    description: "Plan outfits for upcoming events and meetings automatically.",
    color: "rgba(236, 72, 153, 0.8)",
  },
  {
    id: 5,
    icon: History,
    title: "Style Memory",
    description: "Never repeat an outfit too soon. SOP tracks what you wore and when.",
    color: "rgba(251, 146, 60, 0.8)",
  },
  {
    id: 6,
    icon: RefreshCw,
    title: "Mix & Match",
    description: "Discover new combinations from your existing wardrobe with intelligent pairing.",
    color: "rgba(14, 165, 233, 0.8)",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features-section" className="py-24 px-4 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Bomber Jacket Background - Right */}
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        whileInView={{ x: 0, opacity: 0.5 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
      >
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [-8, 8, -8]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative w-full h-full"
        >
          <Image
            src="/bomberJacket.png"
            alt="Bomber Jacket"
            fill
            className="object-contain drop-shadow-2xl"
          />
        </motion.div>
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm font-bricolage font-semibold text-blue-600 mb-4"
          >
            Features
          </motion.div>
          <h2 className="font-dela-gothic text-4xl md:text-5xl text-gray-900 mb-6">
            Everything You Need to
            <span className="text-blue-600"> Dress Smart</span>
          </h2>
          <p className="font-bricolage text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to simplify your daily outfit decisions and maximize your wardrobe potential.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full border border-gray-100">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: feature.color }}
                >
                  <feature.icon className="text-white" size={28} />
                </div>
                <h3 className="font-bricolage font-bold text-2xl text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="font-bricolage text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
