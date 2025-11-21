"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { SubscriptionStateCard } from "./index";
import { FeatureUsageCard } from "./feature-usage-card";
import { calculateRemainingUsage } from "./subscription-utils";
import type { UserSubscription, BenefitUsage } from "@/types/subscription";

interface CurrentSubscriptionTabProps {
  currentSubscription?: {
    subscriptionPlanId: number;
    dateExp: string;
    isActive: boolean;
    benefitUsage: BenefitUsage[];
  };
  plansData?: { data: UserSubscription[] };
  isLoading: boolean;
}

export function CurrentSubscriptionTab({
  currentSubscription,
  plansData,
  isLoading,
}: CurrentSubscriptionTabProps) {
  const currentSubscriptionUsage = useMemo(() => {
    if (!currentSubscription || !plansData?.data) return null;

    const currentPlan = plansData.data.find(
      (plan) => plan.id === currentSubscription.subscriptionPlanId
    );

    if (!currentPlan) return null;

    const remainingUsage = calculateRemainingUsage(
      currentPlan,
      currentSubscription.benefitUsage
    );

    return {
      plan: currentPlan,
      dateExp: currentSubscription.dateExp,
      isActive: currentSubscription.isActive,
      remainingUsage,
    };
  }, [currentSubscription, plansData]);

  const formattedExpiry = useMemo(() => {
    if (!currentSubscriptionUsage?.dateExp) return null;
    try {
      const date = new Date(currentSubscriptionUsage.dateExp);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return currentSubscriptionUsage.dateExp;
    }
  }, [currentSubscriptionUsage?.dateExp]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-poppins text-sm text-gray-300">
            Loading subscription information...
          </p>
        </div>
      </div>
    );
  }

  if (!currentSubscriptionUsage) {
    return (
      <div className="flex items-center justify-center py-12">
        <SubscriptionStateCard message="You don't have an active subscription yet. Choose a plan to get started!" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl p-6 lg:p-8 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-dela-gothic text-2xl md:text-3xl text-white mb-2">
            Current Subscription
          </h2>
          <p className="font-poppins text-sm text-gray-300">
            {currentSubscriptionUsage.plan.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentSubscriptionUsage.isActive ? (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/40 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Active
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold border border-red-400/40 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Inactive
            </span>
          )}
        </div>
      </div>

      {formattedExpiry && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Expires On</p>
              <p className="font-semibold text-white">{formattedExpiry}</p>
            </div>
          </div>
        </div>
      )}

      {currentSubscriptionUsage.remainingUsage.length > 0 && (
        <div>
          <h3 className="font-poppins font-semibold text-white mb-4">
            Feature Usage
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentSubscriptionUsage.remainingUsage.map((feature) => (
              <FeatureUsageCard key={feature.featureCode} feature={feature} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

