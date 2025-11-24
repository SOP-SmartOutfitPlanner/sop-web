"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Check, Star, Zap } from "lucide-react";

import type { SubscriptionPlanCardProps } from "./types";

const SubscriptionPlanCardComponent = ({
  plan,
  index,
  onGetStarted,
}: SubscriptionPlanCardProps) => {
  const features = plan.features.length
    ? plan.features
    : ["No benefits information available yet"];

  const isCurrentPlan = plan.isCurrent;

  return (
    <motion.div
      key={plan.id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3 },
      }}
      className={`relative rounded-2xl p-8 transition-all h-full flex flex-col backdrop-blur-sm ${
        plan.isPopular
          ? "bg-linear-to-br from-blue-600/90 via-cyan-600/90 to-blue-700/90 text-white shadow-2xl shadow-blue-500/30 scale-100 lg:scale-105 z-10 border-2 border-cyan-300/50"
          : plan.isPremium
          ? "bg-linear-to-br from-slate-900/90 via-blue-950/90 to-indigo-950/90 text-white shadow-xl shadow-indigo-900/30 border border-cyan-400/20"
          : "bg-white/10 border border-white/20 hover:border-cyan-400/50 hover:shadow-xl shadow-lg"
      }`}
    >
      {plan.isPopular && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-5 py-2 bg-linear-to-r from-amber-400 via-orange-500 to-pink-500 text-white text-xs font-bricolage font-bold rounded-full shadow-lg shadow-orange-500/50 flex items-center gap-1.5"
        >
          <Zap size={14} className="fill-current" />
          {plan.badge ?? "Most Popular"}
        </motion.div>
      )}

      {plan.isPremium && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-5 py-2 bg-linear-to-r from-cyan-400 via-blue-400 to-cyan-400 text-slate-900 text-xs font-bricolage font-bold rounded-full shadow-lg shadow-cyan-500/50 flex items-center gap-1.5"
        >
          <Star size={14} className="fill-current" />
          {plan.badge ?? "Premium Elite"}
        </motion.div>
      )}

      <div className="text-center mb-6 pb-6 border-b border-white/20">
        <h3 className="font-dela-gothic text-2xl font-bold mb-3 text-white">
          {plan.name}
        </h3>
        <p
          className={`font-poppins text-sm mb-6 ${
            plan.isPopular
              ? "text-blue-100"
              : plan.isPremium
              ? "text-cyan-200"
              : "text-gray-200"
          }`}
        >
          {plan.description}
        </p>
        <div className="flex items-baseline justify-center gap-1 mb-2">
          <span className="font-dela-gothic text-5xl font-bold text-white">
            {plan.priceDisplay}
          </span>
          <span
            className={`font-poppins text-base ${
              plan.isPopular
                ? "text-blue-200"
                : plan.isPremium
                ? "text-cyan-200"
                : "text-gray-300"
            }`}
          >
            /{plan.periodLabel}
          </span>
        </div>
        {!plan.isFree ? (
          <p
            className={`font-poppins text-xs ${
              plan.isPopular
                ? "text-blue-200"
                : plan.isPremium
                ? "text-cyan-300"
                : "text-gray-300"
            }`}
          >
            Billed monthly
          </p>
        ) : (
          <p className="font-poppins text-xs text-gray-300">
            No credit card required
          </p>
        )}
      </div>

      <ul className="space-y-3.5 mb-8 flex-1 list-none">
        {features.map((feature, featureIndex) => (
          <li key={`${plan.id}-${featureIndex}`} className="list-none">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + featureIndex * 0.05 }}
              className="flex items-start"
            >
              <div
                className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                  plan.isPopular
                    ? "bg-blue-400/30"
                    : plan.isPremium
                    ? "bg-cyan-400/20"
                    : "bg-white/20"
                }`}
              >
                <Check
                  size={14}
                  className={`${
                    plan.isPopular
                      ? "text-blue-100"
                      : plan.isPremium
                      ? "text-cyan-300"
                      : "text-white"
                  }`}
                />
              </div>
              <span
                className={`font-poppins text-sm leading-relaxed ${
                  plan.isPopular
                    ? "text-blue-50"
                    : plan.isPremium
                    ? "text-blue-100"
                    : "text-gray-100"
                }`}
              >
                {feature}
              </span>
            </motion.div>
          </li>
        ))}
      </ul>

      <motion.button
        whileHover={isCurrentPlan ? undefined : { scale: 1.02 }}
        whileTap={isCurrentPlan ? undefined : { scale: 0.98 }}
        disabled={isCurrentPlan}
        onClick={() => {
          if (!isCurrentPlan) {
            onGetStarted(plan.id);
          }
        }}
        className={`w-full py-4 px-6 font-bricolage font-bold rounded-xl transition-all shadow-lg ${
          plan.isPopular
            ? "bg-white text-blue-600 hover:bg-blue-50 hover:shadow-2xl"
            : plan.isPremium
            ? "bg-linear-to-r from-cyan-400 via-blue-400 to-cyan-500 text-slate-900 hover:from-cyan-300 hover:via-blue-300 hover:to-cyan-400 hover:shadow-2xl shadow-cyan-500/50"
            : "bg-linear-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl"
        } ${isCurrentPlan ? "cursor-not-allowed opacity-90" : "cursor-pointer"}`}
      >
        {plan.cta}
      </motion.button>

      {plan.isPremium && (
        <p className="font-bricolage text-center text-xs mt-4 text-cyan-300">
          ✨ Premium support & exclusive perks
        </p>
      )}
    </motion.div>
  );
};

export const SubscriptionPlanCard = memo(SubscriptionPlanCardComponent);
SubscriptionPlanCard.displayName = "SubscriptionPlanCard";

