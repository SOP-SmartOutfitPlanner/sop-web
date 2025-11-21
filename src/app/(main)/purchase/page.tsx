"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "react-qr-code";
import { useMutation } from "@tanstack/react-query";

import subscriptionAPI from "@/lib/api/subscription-api";
import {
  useCancelPurchaseSubscriptionMutation,
} from "@/hooks/subscription/useScription";
import type { PurchaseResponse } from "@/types/subscription";
import { Button } from "@/components/ui/button";
import { SubscriptionStateCard } from "@/components/subscription";

type PurchaseData = PurchaseResponse["data"];

const formatTimeLeft = (msRemaining: number) => {
  if (msRemaining <= 0) return "Expired";

  const totalSeconds = Math.floor(msRemaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export default function PurchasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planIdParam = searchParams.get("planId");

  const planId = planIdParam ? Number(planIdParam) : NaN;
  const [purchase, setPurchase] = useState<PurchaseData | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [cancelFeedback, setCancelFeedback] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);

  const normalizeExpiry = useCallback((expiry: number) => {
    if (!expiry) return null;
    // Backend có thể trả epoch seconds → nhân 1000 để chuyển sang milliseconds
    return expiry > 1_000_000_000_000 ? expiry : expiry * 1000;
  }, []);

  const {
    mutate: createPurchase,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async (subscriptionPlanId: number) =>
      subscriptionAPI.purchaseSubscription({ subscriptionPlanId }),
    onSuccess: (response) => {
      setPurchase(response.data);
      setExpiresAt(normalizeExpiry(response.data.expiredAt));
    },
  });

  const {
    mutate: cancelSubscription,
    isPending: isCancelling,
  } = useCancelPurchaseSubscriptionMutation();

  const isExpired = useMemo(
    () => (expiresAt ? now >= expiresAt : false),
    [expiresAt, now]
  );

  const timeLeftLabel = useMemo(
    () =>
      expiresAt
        ? formatTimeLeft(expiresAt - now)
        : planIdParam
        ? "Preparing payment request..."
        : "",
    [expiresAt, now, planIdParam]
  );

  useEffect(() => {
    if (!Number.isFinite(planId)) return;
    createPurchase(planId);
  }, [planId, createPurchase]);

  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleRetry = useCallback(() => {
    if (!Number.isFinite(planId)) return;
    setPurchase(null);
    setExpiresAt(null);
    setCancelFeedback(null);
    createPurchase(planId);
  }, [createPurchase, planId]);

  const handleBackToPlans = useCallback(() => {
    router.push("/subscription");
  }, [router]);

  const handleCancelPurchase = useCallback(() => {
    if (!purchase?.transactionId) return;
    cancelSubscription(purchase.transactionId, {
      onSuccess: (response) => {
        setCancelFeedback({
          status: "success",
          message: response.message ?? "Payment cancelled successfully.",
        });
        setPurchase(null);
        setExpiresAt(null);
      },
      onError: (cancelError) => {
        setCancelFeedback({
          status: "error",
          message:
            cancelError.message ?? "Unable to cancel this payment request.",
        });
      },
    });
  }, [cancelSubscription, purchase]);

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

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <SubscriptionStateCard
          message={
            error instanceof Error ? error.message : "Unable to create payment request."
          }
          actionLabel="Retry"
          onAction={handleRetry}
          messageClassName="text-red-200"
        />
      </div>
    );
  }

  if (cancelFeedback?.status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <SubscriptionStateCard
          message={cancelFeedback.message}
          actionLabel="Back to plans"
          onAction={handleBackToPlans}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="max-w-xl w-full rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl p-8 space-y-6 text-center">
        <h1 className="font-dela-gothic text-2xl md:text-3xl text-white mb-2">
          Complete your subscription purchase
        </h1>
        {purchase && (
          <p className="font-poppins text-sm text-blue-100">
            Plan:{" "}
            <span className="font-semibold">{purchase.subscriptionPlanName}</span> •
            Amount:{" "}
            <span className="font-semibold">
              {purchase.amount.toLocaleString("vi-VN")} ₫
            </span>
          </p>
        )}

        <div className="mt-4 flex flex-col items-center gap-4">
          {purchase ? (
            <>
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <QRCode value={purchase.qrCode} size={220} />
              </div>
              <p className="font-poppins text-xs text-gray-200">
                Scan the QR code with your banking app to pay.
              </p>
            </>
          ) : (
            <p className="font-poppins text-sm text-gray-200">
              Generating payment request, please wait...
            </p>
          )}
        </div>

        {expiresAt && (
          <p
            className={`font-poppins text-sm ${
              isExpired ? "text-red-300" : "text-amber-200"
            }`}
          >
            {isExpired
              ? "This payment request has expired."
              : `This QR will expire in: ${timeLeftLabel}`}
          </p>
        )}

        {cancelFeedback?.status === "error" && (
          <p className="font-poppins text-sm text-red-300">
            {cancelFeedback.message}
          </p>
        )}

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mt-4">
          <Button
            variant="outline"
            className="border-white/40 text-white/90 hover:bg-white/10"
            onClick={handleBackToPlans}
          >
            Back to plans
          </Button>
          <Button
            disabled={isPending}
            onClick={handleRetry}
            className="bg-linear-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 disabled:opacity-60"
          >
            {isExpired ? "Generate new QR" : "Refresh QR"}
          </Button>
          <Button
            disabled={!purchase || isCancelling}
            onClick={handleCancelPurchase}
            className="bg-red-600/80 hover:bg-red-500 text-white disabled:opacity-60"
          >
            {isCancelling ? "Cancelling..." : "Cancel payment"}
          </Button>
        </div>
      </div>
    </div>
  );
}


