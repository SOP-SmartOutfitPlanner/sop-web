"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    id: 1,
    question: "How does SOP suggest outfits?",
    answer: "SOP uses a combination of factors including current weather, your calendar events, style preferences, and outfit history to generate personalized recommendations. Our AI learns from your choices to improve suggestions over time.",
  },
  {
    id: 2,
    question: "Do I need to photograph all my clothes?",
    answer: "Not necessarily! While photos help create visual outfit previews, you can also add items with just descriptions and categories. The app works great either way.",
  },
  {
    id: 3,
    question: "Can I use SOP offline?",
    answer: "Yes! Once your wardrobe is synced, you can browse and get basic suggestions offline. Weather and calendar features require internet connectivity.",
  },
  {
    id: 4,
    question: "How accurate is the weather integration?",
    answer: "We use multiple weather data sources to ensure accuracy. Weather forecasts are updated every hour, and outfit suggestions automatically adjust based on the latest conditions.",
  },
  {
    id: 5,
    question: "Can I share outfits with friends?",
    answer: "Absolutely! Pro users can share outfit combinations and get feedback from friends. Enterprise users can collaborate with their entire team on style guidelines.",
  },
  {
    id: 6,
    question: "What if I don't like a suggestion?",
    answer: "Simply swipe to see alternative suggestions, or manually select different pieces. SOP learns from your preferences and will adjust future recommendations accordingly.",
  },
];

export default function FAQSection() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleGetStarted = () => {
    router.push("/register");
  };

  return (
    <section id="faq-section" className="py-24 px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
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
        className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
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
        className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl"
      />

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
            className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full text-sm font-bricolage font-semibold text-blue-300 mb-6"
          >
            FAQ
          </motion.div>
          <h2 className="font-dela-gothic text-4xl md:text-5xl lg:text-6xl text-white mb-6">
            Frequently Asked
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300"> Questions</span>
          </h2>
          <p className="font-bricolage text-xl text-blue-100 max-w-2xl mx-auto">
            Everything you need to know about Smart Outfit Planner. Can&apos;t find your answer? Reach out to our support team.
          </p>
        </motion.div>

        {/* FAQ accordion */}
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.1 }}
              className="mb-4"
            >
              <GlassCard
                padding="0"
                blur="20px"
                brightness={1.1}
                glowColor="rgba(255, 255, 255, 0.1)"
                glowIntensity={6}
                borderColor="rgba(255, 255, 255, 0.2)"
                borderWidth="1px"
                borderRadius="16px"
                displacementScale={15}
                className="bg-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full py-6 px-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  aria-expanded={expandedFaq === index}
                >
                  <span className="font-bricolage text-lg font-semibold text-white pr-8">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="text-blue-300" size={24} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 px-6 font-bricolage text-blue-100 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="font-bricolage text-blue-100 mb-4">Still have questions?</p>
          <GlassButton
            className="font-bricolage font-bold text-lg"
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
            displacementScale={5}
            backgroundColor="rgba(6, 182, 212, 1)"
          >
            Contact Support
          </GlassButton>
        </motion.div>
      </div>
    </section>
  );
}
