"use client";

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

export default function SubscriptionContentPage() {
  // const router = useRouter();

  const handleGetStarted = () => {
    // router.push("/register");
  };

  return (
    <div className="min-h-screen pt-32">
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-12">
        {/* Section header */}
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

        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto items-center">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3 },
              }}
              className={`relative rounded-2xl p-8 transition-all h-full flex flex-col backdrop-blur-sm ${
                plan.popular
                  ? "bg-gradient-to-br from-blue-600/90 via-cyan-600/90 to-blue-700/90 text-white shadow-2xl shadow-blue-500/30 scale-100 lg:scale-105 z-10 border-2 border-cyan-300/50"
                  : plan.name === "Ultra"
                  ? "bg-gradient-to-br from-slate-900/90 via-blue-950/90 to-indigo-950/90 text-white shadow-xl shadow-indigo-900/30 border border-cyan-400/20"
                  : "bg-white/10 border border-white/20 hover:border-cyan-400/50 hover:shadow-xl shadow-lg"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-5 py-2 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-white text-xs font-bricolage font-bold rounded-full shadow-lg shadow-orange-500/50 flex items-center gap-1.5"
                >
                  <Zap size={14} className="fill-current" />
                  Most Popular
                </motion.div>
              )}

              {/* Ultra Premium badge */}
              {plan.name === "Ultra" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-5 py-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 text-slate-900 text-xs font-bricolage font-bold rounded-full shadow-lg shadow-cyan-500/50 flex items-center gap-1.5"
                >
                  <Star size={14} className="fill-current" />
                  Premium Elite
                </motion.div>
              )}

              {/* Plan header */}
              <div
                className={`text-center mb-6 pb-6 border-b ${
                  plan.popular || plan.name === "Ultra"
                    ? "border-white/20"
                    : "border-white/20"
                }`}
              >
                <h3
                  className={`font-dela-gothic text-2xl font-bold mb-3 ${
                    plan.popular || plan.name === "Ultra"
                      ? "text-white"
                      : "text-white"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`font-poppins text-sm mb-6 ${
                    plan.popular
                      ? "text-blue-100"
                      : plan.name === "Ultra"
                      ? "text-cyan-200"
                      : "text-gray-200"
                  }`}
                >
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span
                    className={`font-dela-gothic text-5xl font-bold ${
                      plan.popular || plan.name === "Ultra"
                        ? "text-white"
                        : "text-white"
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`font-poppins text-base ${
                        plan.popular
                          ? "text-blue-200"
                          : plan.name === "Ultra"
                          ? "text-cyan-200"
                          : "text-gray-300"
                      }`}
                    >
                      /{plan.period}
                    </span>
                  )}
                </div>
                {plan.price !== "$0" && (
                  <p
                    className={`font-poppins text-xs ${
                      plan.popular
                        ? "text-blue-200"
                        : plan.name === "Ultra"
                        ? "text-cyan-300"
                        : "text-gray-300"
                    }`}
                  >
                    Billed monthly • Cancel anytime
                  </p>
                )}
                {plan.price === "$0" && (
                  <p className="font-poppins text-xs text-gray-300">
                    No credit card required
                  </p>
                )}
              </div>

              {/* Features list */}
              <ul className="space-y-3.5 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li
                    key={featureIndex}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + featureIndex * 0.05 }}
                    className="flex items-start"
                  >
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                        plan.popular
                          ? "bg-blue-400/30"
                          : plan.name === "Ultra"
                          ? "bg-cyan-400/20"
                          : "bg-white/20"
                      }`}
                    >
                      <Check
                        size={14}
                        className={`${
                          plan.popular
                            ? "text-blue-100"
                            : plan.name === "Ultra"
                            ? "text-cyan-300"
                            : "text-white"
                        }`}
                      />
                    </div>
                    <span
                      className={`font-poppins text-sm leading-relaxed ${
                        plan.popular
                          ? "text-blue-50"
                          : plan.name === "Ultra"
                          ? "text-blue-100"
                          : "text-gray-100"
                      }`}
                    >
                      {feature}
                    </span>
                  </motion.li>
                ))}
                {plan.notIncluded &&
                  plan.notIncluded.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start opacity-40">
                      <div className="w-5 h-5 flex-shrink-0 mt-0.5 mr-3 rounded-full border border-current flex items-center justify-center">
                        <div className="w-2 h-0.5 bg-current" />
                      </div>
                      <span
                        className={`font-poppins text-sm line-through ${
                          plan.popular ? "text-blue-200" : "text-gray-300"
                        }`}
                      >
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
                className={`w-full py-4 px-6 font-bricolage font-bold rounded-xl transition-all shadow-lg ${
                  plan.popular
                    ? "bg-white text-blue-600 hover:bg-blue-50 hover:shadow-2xl"
                    : plan.name === "Ultra"
                    ? "bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 text-slate-900 hover:from-cyan-300 hover:via-blue-300 hover:to-cyan-400 hover:shadow-2xl shadow-cyan-500/50"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl"
                }`}
              >
                {plan.cta}
              </motion.button>

              {plan.name === "Ultra" && (
                <p className="font-bricolage text-center text-xs mt-4 text-cyan-300">
                  ✨ Premium support & exclusive features
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center"
        >
          <p className="font-poppins text-gray-300 mb-4">
            Need help choosing?{" "}
            <a
              href="#"
              className="text-blue-400 hover:text-blue-300 font-semibold underline"
            >
              Compare all features
            </a>
          </p>
          <p className="font-poppins text-sm text-gray-400">
            All plans include: Mobile & Web access • Secure cloud storage •
            Regular updates
          </p>
        </motion.div>
      </div>
    </div>
  );
}
