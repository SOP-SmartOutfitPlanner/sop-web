"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export const SubscriptionHero = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6 }}
    className="text-center mb-16"
  >
    <h2 className="font-dela-gothic text-4xl md:text-5xl leading-tight mb-6">
      <span className="bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-cyan-200">
        Choose Your
      </span>
      <br />
      <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-cyan-400 to-blue-500">
        Perfect Plan
      </span>
    </h2>
    <p className="font-poppins text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-4">
      Start free forever. Upgrade anytime to unlock premium features and
      AI-powered styling.
    </p>
    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 }}
      className="font-poppins text-sm text-gray-400 flex items-center justify-center gap-2"
    >
      <Check size={16} className="text-green-400" />
      14-day money-back guarantee on all paid plans
    </motion.p>
  </motion.div>
);

