"use client";

import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  SubscriptionHero,
  SubscriptionPlanCard,
  SubscriptionSkeletonCard,
  SubscriptionStateCard,
  type SubscriptionCard,
  type SubscriptionCardVariant,
} from "@/components/subscription";
import { useScription } from "@/hooks/subscription/useScription";
import type { UserSubscription } from "@/types/subscription";

const CARD_VARIANTS: SubscriptionCardVariant[] = ["outline", "primary", "ghost"];
const SKELETON_PLACEHOLDER_COUNT = 3;

const formatCurrency = (value: number) => {
  const normalizedValue = Number.isFinite(value) ? value : Number(value) || 0;

  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(normalizedValue);
  } catch {
    return `${normalizedValue.toLocaleString("vi-VN")} ₫`;
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

  const handleGetStarted = useCallback((planId: number) => {
    console.info("Selected subscription plan:", planId);
  }, []);

  const errorMessage =
    error?.message ?? "Unable to load subscription plans.";

  let planContent: React.ReactNode;

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const skeletonContent = useMemo(
    () =>
      Array.from({ length: SKELETON_PLACEHOLDER_COUNT }).map((_, index) => (
        <SubscriptionSkeletonCard key={`skeleton-${index}`} />
      )),
    []
  );

  const errorContent = useMemo(
    () => (
      <SubscriptionStateCard
        message={errorMessage}
        actionLabel="Try again"
        onAction={handleRetry}
        messageClassName="text-red-200"
      />
    ),
    [errorMessage, handleRetry]
  );

  const emptyContent = useMemo(
    () => (
      <SubscriptionStateCard message="There are currently no subscription plans available." />
    ),
    []
  );

  const cardsContent = useMemo(
    () =>
      pricingPlans.map((plan, index) => (
        <SubscriptionPlanCard
          key={plan.id}
          plan={plan}
          index={index}
          onGetStarted={handleGetStarted}
        />
      )),
    [pricingPlans, handleGetStarted]
  );

  if (isLoading) {
    planContent = skeletonContent;
  } else if (isError) {
    planContent = errorContent;
  } else if (!pricingPlans.length) {
    planContent = emptyContent;
  } else {
    planContent = cardsContent;
  }

  return (
    <div className="min-h-screen pt-32">
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-12">
        {/* Section header */}
        <SubscriptionHero />

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
