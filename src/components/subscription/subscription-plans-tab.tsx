"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  SubscriptionPlanCard,
  SubscriptionSkeletonCard,
  SubscriptionStateCard,
  type SubscriptionCard,
} from "./index";
import { formatCurrency, formatBenefitLimit } from "./subscription-utils";
import type { UserSubscription } from "@/types/subscription";

const CARD_VARIANTS = ["outline", "primary", "ghost"] as const;
const SKELETON_PLACEHOLDER_COUNT = 3;

type SubscriptionCardVariant = (typeof CARD_VARIANTS)[number];

const resolveVariantByIndex = (
  index: number
): SubscriptionCardVariant => CARD_VARIANTS[index] ?? "outline";

const mapSubscriptionToCard = (
  plan: UserSubscription,
  index: number,
  currentPlanId?: number
): SubscriptionCard => {
  const variant = resolveVariantByIndex(index);
  const isPopular = variant === "primary";
  const isPremium = variant === "ghost";
  const isCurrent = typeof currentPlanId !== "undefined" && plan.id === currentPlanId;

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
    isCurrent,
    cta: isCurrent ? "Current plan" : "Get started",
    badge: isPopular
      ? "Most Popular"
      : isPremium
      ? "Premium Elite"
      : undefined,
  };
};

interface SubscriptionPlansTabProps {
  data?: { data: UserSubscription[] };
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  currentPlanId?: number;
  onGetStarted: (planId: number) => void;
}

export function SubscriptionPlansTab({
  data,
  isLoading,
  isError,
  error,
  refetch,
  currentPlanId,
  onGetStarted,
}: SubscriptionPlansTabProps) {
  const pricingPlans = useMemo<SubscriptionCard[]>(() => {
    if (!data?.data || !Array.isArray(data.data)) {
      return [];
    }
    return data.data.map((plan, index) =>
      mapSubscriptionToCard(plan, index, currentPlanId)
    );
  }, [data, currentPlanId]);

  const errorMessage = error?.message ?? "Unable to load subscription plans.";

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
        onAction={refetch}
        messageClassName="text-red-200"
      />
    ),
    [errorMessage, refetch]
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
          onGetStarted={onGetStarted}
        />
      )),
    [pricingPlans, onGetStarted]
  );

  let planContent: React.ReactNode;
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto items-center">
        {planContent}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="mt-20 text-center"
      >
        <p className="font-poppins text-sm text-gray-400">
          All plans include: Mobile & Web access • Secure cloud storage • Regular
          updates
        </p>
      </motion.div>
    </div>
  );
}

