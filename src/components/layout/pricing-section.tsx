"use client";

import { useRouter } from "next/navigation";
import { Check, Zap, Star } from "lucide-react";
import { motion } from "framer-motion";

const pricingPlans = [
  {
    id: 1,
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Up to 30 wardrobe items",
      "Basic outfit suggestions",
      "Weather integration",
      "Mobile app access",
      "5 AI suggestions per day",
    ],
    notIncluded: [
      "Unlimited AI suggestions",
      "Calendar sync",
      "Style analytics",
      "Outfit history",
      "Priority support",
    ],
    cta: "Get Started Free",
    popular: false,
    variant: "outline" as const,
  },
  {
    id: 2,
    name: "Pro",
    price: "$9.99",
    period: "month",
    description: "Most popular for daily users",
    features: [
      "Unlimited wardrobe items",
      "Unlimited AI suggestions",
      "Advanced weather forecasts",
      "Calendar sync & event planning",
      "Style analytics & insights",
      "Outfit history tracking",
      "Priority email support",
      "Ad-free experience",
    ],
    notIncluded: [],
    cta: "Subscribe Now",
    popular: true,
    variant: "primary" as const,
    badge: "Most Popular",
  },
  {
    id: 3,
    name: "Ultra",
    price: "$19.99",
    period: "month",
    description: "For fashion enthusiasts",
    features: [
      "Everything in Pro",
      "Personal style AI assistant",
      "Virtual wardrobe photoshoots",
      "Trend forecasting & alerts",
      "Shopping recommendations",
      "Collaborative outfit planning",
      "Export & backup options",
      "Priority phone support",
      "Early access to new features",
    ],
    notIncluded: [],
    cta: "Subscribe Now",
    popular: false,
    variant: "ghost" as const,
  },
];

export default function PricingSection() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/register");
  };

  return (
    <section id="pricing-section" className="py-24 px-4 bg-gradient-to-br from-cyan-50 via-blue-100 to-indigo-100">
      <div className="max-w-7xl mx-auto">
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
            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200 rounded-full text-sm font-bricolage font-bold text-blue-600 mb-6"
          >
            <Zap size={16} className="fill-current" />
            Simple, Transparent Pricing
          </motion.div>
          <h2 className="font-dela-gothic text-4xl md:text-5xl text-gray-900 mb-6">
            Choose Your
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600"> Perfect Plan</span>
          </h2>
          <p className="font-bricolage text-xl text-gray-600 max-w-2xl mx-auto mb-4">
            Start free forever. Upgrade anytime to unlock premium features.
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="font-bricolage text-sm text-gray-500 flex items-center justify-center gap-2"
          >
            <Check size={16} className="text-green-500" />
            14-day money-back guarantee on all paid plans
          </motion.p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3 }
              }}
              className={`relative rounded-3xl p-8 transition-all ${
                plan.popular
                  ? 'bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 text-white shadow-2xl shadow-blue-500/30 scale-105 md:scale-110 z-10 border-2 border-cyan-400/50'
                  : plan.name === 'Ultra'
                  ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl shadow-blue-900/50 border-2 border-cyan-400/40'
                  : 'bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-white text-sm font-bricolage font-bold rounded-full shadow-lg shadow-orange-500/50 flex items-center"
                >
                  <Zap size={14} className="mr-1 fill-current" />
                  Most Popular
                </motion.div>
              )}

              {/* Ultra Premium badge */}
              {plan.name === 'Ultra' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, 0, -2, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 text-slate-900 text-sm font-bricolage font-bold rounded-full shadow-lg shadow-cyan-500/50 flex items-center"
                >
                  <Star size={14} className="mr-1 fill-current" />
                  Premium Elite
                </motion.div>
              )}

              {/* Plan header */}
              <div className="text-center mb-8">
                <h3 className={`font-dela-gothic text-3xl font-bold mb-2 ${
                  plan.popular || plan.name === 'Ultra' ? 'text-white' : 'text-gray-900'
                  }`}>
                  {plan.name}
                </h3>
                <p className={`font-bricolage text-sm mb-6 min-h-[40px] ${
                  plan.popular
                    ? 'text-blue-100'
                    : plan.name === 'Ultra'
                    ? 'text-cyan-100'
                    : 'text-gray-600'
                  }`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center mb-2">
                  <span className={`font-dela-gothic text-5xl font-bold ${
                    plan.popular || plan.name === 'Ultra' ? 'text-white' : 'text-gray-900'
                    }`}>
                    {plan.price}
                  </span>
                  <span className={`font-bricolage ml-2 text-lg ${
                    plan.popular
                      ? 'text-blue-100'
                      : plan.name === 'Ultra'
                      ? 'text-cyan-100'
                      : 'text-gray-600'
                    }`}>
                    {plan.period && `/${plan.period}`}
                  </span>
                </div>
                {plan.price !== "$0" && (
                  <p className={`font-bricolage text-xs ${
                    plan.popular
                      ? 'text-blue-200'
                      : plan.name === 'Ultra'
                      ? 'text-cyan-200'
                      : 'text-gray-500'
                    }`}>
                    Billed monthly, cancel anytime
                  </p>
                )}
              </div>

              {/* Features list */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li
                    key={featureIndex}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + featureIndex * 0.05 }}
                    className="flex items-start"
                  >
                    <Check
                      size={20}
                      className={`flex-shrink-0 mt-0.5 mr-3 ${
                        plan.popular
                          ? 'text-blue-200'
                          : plan.name === 'Ultra'
                          ? 'text-cyan-300'
                          : 'text-blue-600'
                        }`}
                    />
                    <span className={`font-bricolage ${
                      plan.popular
                        ? 'text-blue-50'
                        : plan.name === 'Ultra'
                        ? 'text-blue-50'
                        : 'text-gray-700'
                      }`}>
                      {feature}
                    </span>
                  </motion.li>
                ))}
                {plan.notIncluded && plan.notIncluded.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start opacity-50">
                    <div className="w-5 h-5 flex-shrink-0 mt-0.5 mr-3 rounded-full border-2 border-current" />
                    <span className={`font-bricolage line-through ${plan.popular ? 'text-blue-100' : 'text-gray-500'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGetStarted}
                className={`w-full py-4 font-bricolage font-bold rounded-xl transition-all ${
                  plan.popular
                    ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl'
                    : plan.name === 'Ultra'
                    ? 'bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 text-slate-900 hover:from-cyan-300 hover:via-blue-300 hover:to-cyan-400 shadow-xl hover:shadow-2xl shadow-cyan-500/50'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:shadow-lg hover:shadow-gray-500/30'
                  }`}
              >
                {plan.cta}
              </motion.button>

              {plan.price === "$0" && (
                <p className="font-bricolage text-center text-xs mt-3 text-gray-500">
                  No credit card required
                </p>
              )}

              {plan.name === 'Ultra' && (
                <p className="font-bricolage text-center text-xs mt-3 text-cyan-200">
                  Premium support & exclusive features
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
