"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Calendar,
  ChevronDown,
  ChevronUp,
  Package,
  Clock,
  DollarSign,
} from "lucide-react";
import { SubscriptionStateCard } from "./index";
import { getFeatureDisplayName, formatCurrency } from "./subscription-utils";
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
  // State quản lý toggle phần Feature Usage (đặt ở top level để tuân thủ hook rules)
  const [featureExpandedState, setFeatureExpandedState] = useState<
    Record<number, boolean>
  >(() => {
    const initial: Record<number, boolean> = {};
  data?.data?.forEach((history) => {
    initial[history.id] = false;
  });
    return initial;
  });

  // Auto-refetch data when component mounts or becomes visible
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Listen for subscription refresh event
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleRefresh = () => {
      refetch();
    };

    window.addEventListener("subscription:refresh", handleRefresh);
    return () => {
      window.removeEventListener("subscription:refresh", handleRefresh);
    };
  }, [refetch]);

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

  const toggleFeatures = (historyId: number) => {
    setFeatureExpandedState((prev) => ({
      ...prev,
      [historyId]: !(prev[historyId] ?? false),
    }));
  };

  return (
    <div className="space-y-6">
      {data.data.map((history, index) => {
        const isFeaturesExpanded = featureExpandedState[history.id] ?? false;

        const formattedDate = (() => {
          try {
            return new Date(history.createdDate).toLocaleDateString("en-US", {
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
            return new Date(history.dateExp).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          } catch {
            return history.dateExp;
          }
        })();

        const totalAmount = history.transactions?.reduce(
          (sum, t) => sum + (t.price || 0),
          0
        ) || 0;

        return (
          <motion.div
            key={history.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-white/10">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-linear-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30">
                  <Package className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-dela-gothic text-2xl text-white mb-2">
                    {history.subscriptionPlan.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <p className="font-poppins text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Started: {formattedDate}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {history.isActive ? (
                  <span className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-semibold border border-emerald-400/40 flex items-center gap-2 shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-4 h-4" />
                    Active
                  </span>
                ) : (
                  <span className="px-4 py-2 rounded-full bg-gray-500/20 text-gray-300 text-sm font-semibold border border-gray-400/40 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Expired
                  </span>
                )}
              </div>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-linear-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Calendar className="w-4 h-4 text-blue-300" />
                  </div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Expires On
                  </p>
                </div>
                <p className="font-semibold text-white text-lg">{formattedExpiry}</p>
              </div>

              {history.transactions && history.transactions.length > 0 && (
                <>
                  <div className="p-4 rounded-2xl bg-linear-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <CreditCard className="w-4 h-4 text-purple-300" />
                      </div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                        Transactions
                      </p>
                    </div>
                    <p className="font-semibold text-white text-lg">
                      {history.transactions.length}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-linear-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <DollarSign className="w-4 h-4 text-emerald-300" />
                      </div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                        Total Amount
                      </p>
                    </div>
                    <p className="font-semibold text-white text-lg">
                      {formatCurrency(totalAmount)}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Transactions Section */}
            {history.transactions && history.transactions.length > 0 && (
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <CreditCard className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-base">
                      Transactions ({history.transactions.length})
                    </p>
                    <p className="text-xs text-gray-400">
                      Latest payment activity
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {history.transactions.map((transaction, txIndex) => {
                    const formattedTransactionDate = (() => {
                      try {
                        return new Date(
                          transaction.createdDate
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      } catch {
                        return transaction.createdDate;
                      }
                    })();

                    const getStatusColor = (status: string) => {
                      const upperStatus = status.toUpperCase();
                      if (
                        upperStatus === "COMPLETED" ||
                        upperStatus === "SUCCESS"
                      ) {
                        return "bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-lg shadow-emerald-500/10";
                      }
                      if (upperStatus === "PENDING") {
                        return "bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-lg shadow-amber-500/10";
                      }
                      if (
                        upperStatus === "FAILED" ||
                        upperStatus === "CANCEL" ||
                        upperStatus === "CANCELLED"
                      ) {
                        return "bg-red-500/20 text-red-300 border-red-400/40 shadow-lg shadow-red-500/10";
                      }
                      return "bg-gray-500/20 text-gray-300 border-gray-400/40";
                    };

                    return (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: txIndex * 0.05 }}
                        className="p-5 rounded-2xl bg-linear-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 hover:shadow-lg transition-all group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 rounded-xl bg-linear-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 group-hover:scale-110 transition-transform">
                              <CreditCard className="w-5 h-5 text-blue-300" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <p className="font-semibold text-white">
                                  Transaction #{transaction.id}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                  <p className="text-gray-400 flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    Paid at {formattedTransactionDate}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-emerald-300" />
                                    <p className="font-semibold text-white">
                                      {formatCurrency(transaction.price)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">
                                  {transaction.transactionCode && (
                                    <p className="flex items-center gap-1">
                                      <span className="uppercase tracking-wide text-white/50">
                                        Code:
                                      </span>
                                      <span className="font-semibold text-white">
                                        {transaction.transactionCode}
                                      </span>
                                    </p>
                                  )}
                                  {transaction.description && (
                                    <p className="flex items-center gap-1 max-w-xs">
                                      <span className="uppercase tracking-wide text-white/50">
                                        Note:
                                      </span>
                                      <span className="text-white/80">
                                        {transaction.description}
                                      </span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-end">
                            <span
                              className={`px-4 py-2 rounded-full text-xs font-semibold border flex items-center gap-2 ${getStatusColor(
                                transaction.status
                              )}`}
                            >
                              {transaction.status === "COMPLETED" ||
                              transaction.status === "SUCCESS" ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : transaction.status === "PENDING" ? (
                                <AlertCircle className="w-4 h-4" />
                              ) : null}
                              {transaction.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Feature Usage Section */}
            {history.benefitUsage && history.benefitUsage.length > 0 && (
              <div>
                <button
                  onClick={() => toggleFeatures(history.id)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group mb-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
                      <Package className="w-5 h-5 text-cyan-300" />
                    </div>
                    <p className="font-semibold text-white text-base">
                      Feature Usage ({history.benefitUsage.length})
                    </p>
                  </div>
                  {isFeaturesExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {isFeaturesExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {history.benefitUsage.map((usage, usageIndex) => (
                          <motion.div
                            key={usage.featureCode}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              duration: 0.2,
                              delay: usageIndex * 0.05,
                            }}
                            className="p-4 rounded-xl bg-linear-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 hover:shadow-lg transition-all"
                          >
                            <p className="font-semibold text-white text-sm mb-1">
                              {getFeatureDisplayName(usage.featureCode)}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                                {usage.benefitType}
                              </span>
                              <span className="font-bold text-cyan-300">
                                {usage.usage}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

