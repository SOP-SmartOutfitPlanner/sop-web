"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingFooter() {
  return (
    <footer className="py-16 px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border-t border-white/10 relative overflow-hidden">
      {/* Animated background effects */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-dela-gothic text-3xl bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200 mb-4">SOP</h3>
            <p className="font-bricolage text-blue-100/80 text-sm leading-relaxed">
              Your smart outfit planner for effortless style every day.
            </p>
          </div>
          <div>
            <h4 className="font-bricolage font-bold text-white mb-4">Product</h4>
            <ul className="space-y-3 font-bricolage text-blue-100/70 text-sm">
              <li><a href="#features-section" className="hover:text-cyan-300 transition-colors flex items-center gap-2">
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                Features
              </a></li>
              <li><a href="#pricing-section" className="hover:text-cyan-300 transition-colors">Pricing</a></li>
              <li><a href="#faq-section" className="hover:text-cyan-300 transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bricolage font-bold text-white mb-4">Company</h4>
            <ul className="space-y-3 font-bricolage text-blue-100/70 text-sm">
              <li><a href="#" className="hover:text-cyan-300 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-cyan-300 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-cyan-300 transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bricolage font-bold text-white mb-4">Support</h4>
            <ul className="space-y-3 font-bricolage text-blue-100/70 text-sm">
              <li><a href="#" className="hover:text-cyan-300 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-cyan-300 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-cyan-300 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center">
          <p className="font-bricolage text-blue-100/60 text-sm">
            &copy; 2025 Smart Outfit Planner. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
