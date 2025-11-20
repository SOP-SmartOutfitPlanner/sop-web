"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Star } from "lucide-react";

import { useScription } from "@/hooks/subscription/useScription";
import type { UserSubscription } from "@/types/subscription";

type SubscriptionCardVariant = "outline" | "primary" | "ghost";

type SubscriptionCard = {
  id: number;
  name: string;
  description: string;
  priceValue: number;
  priceDisplay: string;
  periodLabel: string;
  features: string[];
  status: string;
  variant: SubscriptionCardVariant;
  isPopular: boolean;
  isPremium: boolean;
  isFree: boolean;
  cta: string;
  badge?: string;
};

const CARD_VARIANTS: SubscriptionCardVariant[] = ["outline", "primary", "ghost"];

const formatCurrency = (value: number) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `$${value}`;
  }
};

const formatBenefitLimit = (
  benefit: UserSubscription["benefitLimit"][number]
) => {
  const details: string[] = [];
  if (typeof benefit.usage !== "undefined") {
    details.push(`${benefit.usage}`);
  }
  if (benefit.benefitType) {
    details.push(benefit.benefitType);
  }

  return details.length
    ? `${benefit.featureCode} • ${details.join(" ")}`
    : benefit.featureCode;
};

const resolveVariantByIndex = (
  index: number
): SubscriptionCardVariant => CARD_VARIANTS[index] ?? "outline";

const mapSubscriptionToCard = (
  plan: UserSubscription,
  index: number
): SubscriptionCard => {
  const variant = resolveVariantByIndex(index);
  const isPopular = variant === "primary";
  const isPremium = variant === "ghost";
  const isActivePlan = plan.status?.toLowerCase() === "active";

  return {
    id: plan.id,
    name: plan.name,
    description:
      plan.description?.trim().length > 0
        ? plan.description
        : "Smart Outfit Planner subscription",
    priceValue: plan.price,
    priceDisplay: formatCurrency(plan.price ?? 0),
    periodLabel: "month",
    features: plan.benefitLimit?.map(formatBenefitLimit) ?? [],
    status: plan.status,
    variant,
    isPopular,
    isPremium,
    isFree: plan.price === 0,
    cta: isActivePlan ? "Current plan" : "Subscribe now",
    badge: isPopular
      ? "Most Popular"
      : isPremium
      ? "Premium Elite"
      : undefined,
  };
};

export default function SubscriptionContentPage() {
  const { data, isLoading, isError, error, refetch } = useScription();
  useEffect(() => {
    console.log(data);
  }, [data]);
  const pricingPlans = useMemo<SubscriptionCard[]>(() => {
    if (!data?.data || !Array.isArray(data.data)) {
      return [];
    }
    return data.data.map((plan, index) =>
      mapSubscriptionToCard(plan, index)
    );
  }, [data]);

  const handleGetStarted = (planId: number) => {
    // TODO: Connect payment/subscription flow when backend is ready
    console.info("Selected subscription plan:", planId);
  };

  const errorMessage =
    error?.message ?? "Unable to load subscription plans.";

  let planContent: React.ReactNode;

  if (isLoading) {
    planContent = Array.from({ length: 3 }).map((_, index) => (
      <div
        key={`skeleton-${index}`}
        className="rounded-2xl p-8 h-full bg-white/5 border border-white/10 animate-pulse space-y-6"
      >
        <div className="h-5 w-24 bg-white/10 rounded-full" />
        <div className="h-10 w-32 bg-white/10 rounded-lg" />
        <div className="h-4 w-20 bg-white/10 rounded-full" />
        <div className="h-4 w-full bg-white/10 rounded-full" />
        <div className="h-4 w-5/6 bg-white/10 rounded-full" />
        <div className="h-12 w-full bg-white/10 rounded-xl" />
      </div>
    ));
  } else if (isError) {
    planContent = (
      <div className="col-span-full text-center bg-white/5 border border-white/10 rounded-2xl p-10">
        <p className="font-poppins text-lg text-red-200 mb-4">{errorMessage}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-6 py-3 font-bricolage font-semibold rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 transition-all"
        >
          Try again
        </button>
      </div>
    );
  } else if (!pricingPlans.length) {
    planContent = (
      <div className="col-span-full text-center bg-white/5 border border-white/10 rounded-2xl p-10">
        <p className="font-poppins text-base text-gray-300">
          There are currently no subscription plans available.
        </p>
      </div>
    );
  } else {
    planContent = pricingPlans.map((plan, index) => (
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
              Billed monthly • Cancel anytime
            </p>
          ) : (
            <p className="font-poppins text-xs text-gray-300">
              No credit card required
            </p>
          )}
        </div>

        <ul className="space-y-3.5 mb-8 flex-1 list-none">
          {(plan.features.length
            ? plan.features
            : ["No benefits information available yet"]).map(
            (feature, featureIndex) => (
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
            )
          )}
        </ul>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGetStarted(plan.id)}
          className={`w-full py-4 px-6 font-bricolage font-bold rounded-xl transition-all shadow-lg ${
            plan.isPopular
              ? "bg-white text-blue-600 hover:bg-blue-50 hover:shadow-2xl"
              : plan.isPremium
              ? "bg-linear-to-r from-cyan-400 via-blue-400 to-cyan-500 text-slate-900 hover:from-cyan-300 hover:via-blue-300 hover:to-cyan-400 hover:shadow-2xl shadow-cyan-500/50"
              : "bg-linear-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl"
          }`}
        >
          {plan.cta}
        </motion.button>

        {plan.isPremium && (
          <p className="font-bricolage text-center text-xs mt-4 text-cyan-300">
            ✨ Premium support & exclusive perks
          </p>
        )}
      </motion.div>
    ));
  }

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
          {planContent}
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
