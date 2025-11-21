"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { SubscriptionStateCard } from "./index";
import { getFeatureDisplayName } from "./subscription-utils";
import type { SubscriptionHistory } from "@/types/subscription";

interface SubscriptionHistoryTabProps {
  data?: { data: SubscriptionHistory[] };
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function SubscriptionHistoryTab({
  data,
  isLoading,
  isError,
  error,
  refetch,
}: SubscriptionHistoryTabProps) {
  const errorMessage =
    error?.message ?? "Unable to load subscription history.";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-poppins text-sm text-gray-300">
            Loading subscription history...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <SubscriptionStateCard
          message={errorMessage}
          actionLabel="Try again"
          onAction={refetch}
          messageClassName="text-red-200"
        />
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <SubscriptionStateCard message="No subscription history found." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.data.map((history) => {
        const formattedDate = (() => {
          try {
            return new Date(history.createdDate).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          } catch {
            return history.createdDate;
          }
        })();

        const formattedExpiry = (() => {
          try {
            return new Date(history.dateExp).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          } catch {
            return history.dateExp;
          }
        })();

        return (
          <motion.div
            key={history.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-dela-gothic text-xl text-white mb-1">
                  {history.subscriptionPlan.name}
                </h3>
                <p className="font-poppins text-sm text-gray-400">
                  Started: {formattedDate}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {history.isActive ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-300 text-xs font-semibold border border-gray-400/40 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Expired
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-400 font-medium mb-1">Expires On</p>
                <p className="font-semibold text-white">{formattedExpiry}</p>
              </div>
              {history.transactions && history.transactions.length > 0 && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-gray-400 font-medium mb-1">
                    Total Transactions
                  </p>
                  <p className="font-semibold text-white">
                    {history.transactions.length}
                  </p>
                </div>
              )}
            </div>

            {history.benefitUsage && history.benefitUsage.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 font-medium mb-2">
                  Feature Usage
                </p>
                <div className="flex flex-wrap gap-2">
                  {history.benefitUsage.map((usage) => (
                    <span
                      key={usage.featureCode}
                      className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300"
                    >
                      {getFeatureDisplayName(usage.featureCode)}: {usage.usage}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

