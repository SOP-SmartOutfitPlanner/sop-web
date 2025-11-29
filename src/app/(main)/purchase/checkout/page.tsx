"use client";

import { Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/subscription/useSubscription";
import { Button } from "@/components/ui/button";
import { SubscriptionStateCard } from "@/components/subscription";
import { formatCurrency, getFeatureDisplayName } from "@/components/subscription/subscription-utils";
import type { UserSubscription } from "@/types/subscription";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="font-poppins text-sm text-gray-300">
            Loading checkout...
          </p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planIdParam = searchParams.get("planId");

  const planId = planIdParam ? Number(planIdParam) : NaN;

  const { data: plansData, isLoading, isError, error } = useSubscription();

  const selectedPlan = useMemo<UserSubscription | null>(() => {
    if (!plansData?.data || !Number.isFinite(planId)) {
      return null;
    }
    return plansData.data.find((plan) => plan.id === planId) ?? null;
  }, [plansData, planId]);

  const handleBackToPlans = useCallback(() => {
    router.push("/subscription");
  }, [router]);

  const handleConfirmPurchase = useCallback(() => {
    if (!Number.isFinite(planId)) return;
    router.push(`/purchase?planId=${planId}`);
  }, [router, planId]);

  const planFeatures = useMemo(() => {
    if (!selectedPlan?.benefitLimit) return [];
    return selectedPlan.benefitLimit.map((benefit) => {
      const featureName = getFeatureDisplayName(benefit.featureCode);
      const details: string[] = [];
      
      if (typeof benefit.usage !== "undefined") {
        details.push(`${benefit.usage}`);
      }
      if (benefit.benefitType) {
        details.push(benefit.benefitType);
      }

      return details.length
        ? `${featureName} • ${details.join(" ")}`
        : featureName;
    });
  }, [selectedPlan]);

  if (!planIdParam || !Number.isFinite(planId)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <SubscriptionStateCard
          message="Missing plan information. Please return to the pricing page."
          actionLabel="Back to plans"
          onAction={handleBackToPlans}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <p className="font-poppins text-sm text-gray-300">
            Loading plan details...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <SubscriptionStateCard
          message={
            error instanceof Error
              ? error.message
              : "Plan not found. Please return to the pricing page."
          }
          actionLabel="Back to plans"
          onAction={handleBackToPlans}
          messageClassName="text-red-200"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="max-w-2xl w-full space-y-6 pt-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToPlans}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-dela-gothic text-3xl md:text-4xl text-white">
            Checkout
          </h1>
        </div>

        {/* Plan Summary Card */}
        <div className="rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl p-8 space-y-6">
          <div className="text-center pb-6 border-b border-white/20">
            <h2 className="font-dela-gothic text-2xl text-white mb-2">
              {selectedPlan.name}
            </h2>
            <p className="font-poppins text-sm text-gray-300 mb-6">
              {selectedPlan.description || "Smart Outfit Planner subscription"}
            </p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="font-dela-gothic text-5xl font-bold text-white">
                {formatCurrency(selectedPlan.price ?? 0)}
              </span>
              <span className="font-poppins text-lg text-gray-300">/month</span>
            </div>
            {selectedPlan.price !== 0 && (
              <p className="font-poppins text-xs text-gray-400 mt-2">
                Billed monthly • Cancel anytime
              </p>
            )}
          </div>

          {/* Features */}
          {planFeatures.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-dela-gothic text-lg text-white mb-4">
                What is included:
              </h3>
              <ul className="space-y-3">
                {planFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="shrink-0 w-5 h-5 rounded-full bg-blue-400/30 flex items-center justify-center mr-3 mt-0.5">
                      <Check size={14} className="text-blue-100" />
                    </div>
                    <span className="font-poppins text-sm text-gray-100 leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Order Summary */}
          <div className="rounded-2xl border border-white/20 bg-white/5 p-5 space-y-3 mt-6">
            <h3 className="font-dela-gothic text-lg text-white mb-4">
              Order Summary
            </h3>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <p className="font-poppins text-sm text-gray-400">
                Subscription Plan
              </p>
              <p className="font-semibold text-white">{selectedPlan.name}</p>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <p className="font-poppins text-sm text-gray-400">Billing Period</p>
              <p className="font-semibold text-white">Monthly</p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <p className="font-dela-gothic text-lg text-white">Total</p>
              <p className="font-dela-gothic text-2xl font-bold text-white">
                {formatCurrency(selectedPlan.price ?? 0)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 border-white/40 text-black hover:bg-white/10"
              onClick={handleBackToPlans}
            >
              Back to plans
            </Button>
            <Button
              onClick={handleConfirmPurchase}
              className="flex-1 bg-linear-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500"
            >
              Proceed to Payment
            </Button>
          </div>

          {/* Info Note */}
          <p className="font-poppins text-xs text-gray-400 text-center pt-4 border-t border-white/10">
            You will be redirected to the payment page to complete your purchase.
            All payments are secure and encrypted.
          </p>
        </div>
      </div>
    </div>
  );
}

