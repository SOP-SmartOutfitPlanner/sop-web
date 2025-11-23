"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Package,
  Sparkles,
} from "lucide-react";
import { SubscriptionStateCard } from "./index";
import { FeatureUsageCard } from "./feature-usage-card";
import { calculateRemainingUsage, formatCurrency } from "./subscription-utils";
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
      className="rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-linear-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30">
            <Package className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <h2 className="font-dela-gothic text-2xl md:text-3xl text-white mb-2">
              Current Subscription
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-poppins text-base text-gray-300 font-medium">
                {currentSubscriptionUsage.plan.name}
              </p>
              {currentSubscriptionUsage.plan.price !== undefined && (
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-semibold border border-blue-400/40">
                  {formatCurrency(currentSubscriptionUsage.plan.price)}
                  {currentSubscriptionUsage.plan.price > 0 && "/month"}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentSubscriptionUsage.isActive ? (
            <span className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-semibold border border-emerald-400/40 flex items-center gap-2 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-4 h-4" />
              Active
            </span>
          ) : (
            <span className="px-4 py-2 rounded-full bg-red-500/20 text-red-300 text-sm font-semibold border border-red-400/40 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {formattedExpiry && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-5 rounded-2xl bg-linear-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20">
                <Calendar className="w-5 h-5 text-blue-300" />
              </div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                Expires On
              </p>
            </div>
            <p className="font-semibold text-white text-lg">{formattedExpiry}</p>
          </motion.div>
        )}

        {currentSubscriptionUsage.plan.description && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="p-5 rounded-2xl bg-linear-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20">
                <Sparkles className="w-5 h-5 text-purple-300" />
              </div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                Description
              </p>
            </div>
            <p className="font-poppins text-sm text-gray-200 leading-relaxed">
              {currentSubscriptionUsage.plan.description}
            </p>
          </motion.div>
        )}
      </div>

      {/* Feature Usage Section */}
      {currentSubscriptionUsage.remainingUsage.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
            <h3 className="font-dela-gothic text-xl text-white">
              Feature Usage
            </h3>
            <span className="px-3 py-1 rounded-full bg-white/5 text-gray-300 text-xs font-semibold border border-white/10">
              {currentSubscriptionUsage.remainingUsage.length} features
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentSubscriptionUsage.remainingUsage.map((feature, index) => (
              <motion.div
                key={feature.featureCode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <FeatureUsageCard feature={feature} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

