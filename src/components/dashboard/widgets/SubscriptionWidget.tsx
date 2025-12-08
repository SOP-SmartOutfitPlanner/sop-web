"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CreditCard,
  Crown,
  ChevronRight,
  Sparkles,
  Zap,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { CurrentSubscription } from "@/types/subscription";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import GlassCard from "@/components/ui/glass-card";

interface SubscriptionWidgetProps {
  subscription: CurrentSubscription | undefined;
  isLoading: boolean;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getDaysRemaining(dateExp: string): number {
  const expDate = new Date(dateExp);
  const today = new Date();
  const diff = expDate.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function SubscriptionWidget({
  subscription,
  isLoading,
}: SubscriptionWidgetProps) {
  const isPremium =
    subscription?.subscriptionPlanName?.toLowerCase() !== "free" &&
    subscription?.isActive;
  const daysRemaining = subscription?.dateExp
    ? getDaysRemaining(subscription.dateExp)
    : 0;

  if (isLoading) {
    return (
      <GlassCard
        padding="1.5rem"
        blur="12px"
        brightness={1.1}
        glowColor="rgba(251, 191, 36, 0.2)"
        glowIntensity={6}
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius="1.5rem"
        className="bg-white/5"
      >
        <div className="w-full">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />
            <div>
              <Skeleton className="h-5 w-32 bg-white/10 mb-1" />
              <Skeleton className="h-3 w-20 bg-white/10" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-xl bg-white/10" />
        </div>
      </GlassCard>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <GlassCard
        padding="1.5rem"
        blur="12px"
        brightness={1.1}
        glowColor={isPremium ? "rgba(251, 191, 36, 0.3)" : "rgba(100, 116, 139, 0.2)"}
        glowIntensity={6}
        borderColor={isPremium ? "rgba(251, 191, 36, 0.2)" : "rgba(255, 255, 255, 0.1)"}
        borderRadius="1.5rem"
        className="bg-white/5"
      >
        <div className="w-full relative">
          {/* Premium glow effect */}
          {isPremium && (
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
          )}

          {/* Header */}
          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-lg ${
                  isPremium
                    ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30"
                    : "bg-gradient-to-br from-slate-600 to-slate-700 shadow-slate-500/30"
                }`}
              >
                {isPremium ? (
                  <Crown className="h-5 w-5 text-white" />
                ) : (
                  <CreditCard className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Subscription</h2>
                <p className="text-xs text-white/50">
                  {subscription?.subscriptionPlanName || "Free Plan"}
                </p>
              </div>
            </div>
            {isPremium && (
              <div className="flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400">Premium</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="relative space-y-4">
            {isPremium ? (
              <>
                {/* Expiry info */}
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Clock className="h-4 w-4" />
                  <span>
                    {daysRemaining > 0
                      ? `${daysRemaining} days remaining`
                      : "Expired"}
                  </span>
                </div>

                {/* Benefit usage */}
                {subscription?.benefitUsage && subscription.benefitUsage.length > 0 && (
                  <div className="space-y-3">
                    {subscription.benefitUsage.slice(0, 3).map((benefit) => {
                      const percentage = benefit.limit > 0
                        ? Math.min(100, (benefit.usage / benefit.limit) * 100)
                        : 0;
                      const isUnlimited = benefit.benefitType === "UNLIMITED";

                      return (
                        <div key={benefit.featureCode} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/60 capitalize">
                              {benefit.featureCode.replace(/_/g, " ").toLowerCase()}
                            </span>
                            <span className="text-white/80">
                              {isUnlimited ? (
                                <span className="flex items-center gap-1">
                                  <Zap className="h-3 w-3 text-amber-400" />
                                  Unlimited
                                </span>
                              ) : (
                                `${benefit.usage}/${benefit.limit}`
                              )}
                            </span>
                          </div>
                          {!isUnlimited && (
                            <Progress
                              value={percentage}
                              className="h-1.5 bg-white/10"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Premium Features */}
                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs text-white/40 mb-2">Premium Features</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-white/60">
                      <CheckCircle2 className="h-3 w-3 text-amber-400" />
                      <span>AI Styling</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/60">
                      <CheckCircle2 className="h-3 w-3 text-amber-400" />
                      <span>Unlimited Items</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/60">
                      <CheckCircle2 className="h-3 w-3 text-amber-400" />
                      <span>Priority Support</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/60">
                      <CheckCircle2 className="h-3 w-3 text-amber-400" />
                      <span>Advanced Analytics</span>
                    </div>
                  </div>
                </div>

                {/* Expiry date */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-xs text-white/40">Expires</span>
                  <span className="text-xs text-white/60">
                    {subscription?.dateExp
                      ? formatDate(subscription.dateExp)
                      : "N/A"}
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Free plan info */}
                <div className="space-y-2.5 py-2">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Basic wardrobe management</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Limited AI suggestions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    <span>Up to 20 wardrobe items</span>
                  </div>
                </div>

                {/* Premium benefits preview */}
                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs text-amber-400/80 mb-2 font-medium">Unlock with Premium</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Sparkles className="h-3 w-3 text-amber-400/60" />
                      <span>Unlimited AI outfit suggestions</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Sparkles className="h-3 w-3 text-amber-400/60" />
                      <span>Advanced style analytics</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Sparkles className="h-3 w-3 text-amber-400/60" />
                      <span>Weather-based recommendations</span>
                    </div>
                  </div>
                </div>

                {/* Upgrade CTA */}
                <Link href="/subscription" className="block pt-3">
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* View details link */}
          {isPremium && (
            <Link href="/subscription" className="block mt-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
              >
                Manage Subscription
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
