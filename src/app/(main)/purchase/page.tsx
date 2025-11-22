"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "react-qr-code";
import { useMutation } from "@tanstack/react-query";

import subscriptionAPI from "@/lib/api/subscription-api";
import { useCancelPurchaseSubscriptionMutation } from "@/hooks/subscription/useSubscription";
import { usePaymentStatusUpdates } from "@/hooks/subscription/usePaymentStatusUpdates";
import type { PurchaseResponse } from "@/types/subscription";
import { Button } from "@/components/ui/button";
import { SubscriptionStateCard } from "@/components/subscription";
import { useAuthStore } from "@/store/auth-store";

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
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="font-poppins text-sm text-gray-300">
            Preparing purchase flow...
          </p>
        </div>
      }
    >
      <PurchaseContent />
    </Suspense>
  );
}

function PurchaseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planIdParam = searchParams.get("planId");

  const planId = planIdParam ? Number(planIdParam) : NaN;
  const [purchase, setPurchase] = useState<PurchaseData | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);

  const normalizeExpiry = useCallback((expiry: number) => {
    if (!expiry) return null;
    

    const MILLISECONDS_THRESHOLD = 1_000_000_000_000; // 1 trillion
    
    if (expiry >= MILLISECONDS_THRESHOLD) {

      return expiry;
    }
    return expiry * 1000;
  }, []);

  const {
    mutate: createPurchase,
    isError,
    error,
  } = useMutation({
    mutationFn: async (subscriptionPlanId: number) =>
      subscriptionAPI.purchaseSubscription({ subscriptionPlanId }),
    onSuccess: (response) => {
      setPurchase(response.data);
      setExpiresAt(normalizeExpiry(response.data.expiredAt));
      // Lưu thông tin pending payment vào localStorage
      if (response.data.transactionId) {
        localStorage.setItem(
          "pendingPayment",
          JSON.stringify({
            transactionId: response.data.transactionId,
            planId: planId,
            planName: response.data.subscriptionPlanName,
            amount: response.data.amount,
            expiredAt: normalizeExpiry(response.data.expiredAt),
          })
        );
      }
    },
  });

  const {
    mutate: cancelSubscription,
    isPending: isCancelling,
  } = useCancelPurchaseSubscriptionMutation();
  const currentUserId = useAuthStore((state) => {
    const rawId = state.user?.id;
    return rawId ? Number(rawId) : null;
  });
  const isExpired = useMemo(
    () => (expiresAt ? now >= expiresAt : false),
    [expiresAt, now]
  );
  const { statusUpdate, connectionState } = usePaymentStatusUpdates(
    purchase?.transactionId,
    {
      enabled: Boolean(purchase?.transactionId || purchase?.userSubscriptionId) && !isExpired,
      userId: currentUserId,
      userSubscriptionId: purchase?.userSubscriptionId,
    }
  );

  // timeLeft = 1763795855000 - now (milliseconds)
  const timeLeftLabel = useMemo(
    () => {
      if (!expiresAt) {
        return planIdParam ? "Preparing payment request..." : "";
      }
      
      // Đảm bảo cả expiresAt và now đều là milliseconds
      const timeLeft = expiresAt - now;
      
      return formatTimeLeft(timeLeft);
    },
    [expiresAt, now, planIdParam]
  );

  useEffect(() => {
    if (!Number.isFinite(planId)) return;
    createPurchase(planId);
  }, [planId, createPurchase]);

  // Cập nhật now mỗi giây để đếm ngược thời gian
  useEffect(() => {
    if (!expiresAt) return;

    // Cập nhật ngay lập tức
    setNow(Date.now());

    // Sau đó cập nhật mỗi giây
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Redirect đến trang result khi có status update final
  useEffect(() => {
    if (!statusUpdate) return;

    const finalStatus = statusUpdate.status?.toUpperCase();
    if (finalStatus === "COMPLETED" || finalStatus === "FAILED" || finalStatus === "CANCEL") {
      setIsRedirecting(true);
      
      const params = new URLSearchParams({
        status: finalStatus,
        message: statusUpdate.message ?? "",
      });

      if (statusUpdate.data?.subscriptionPlanName) {
        params.set("planName", statusUpdate.data.subscriptionPlanName);
      }

      if (statusUpdate.data?.transactionCode) {
        params.set("transactionCode", statusUpdate.data.transactionCode.toString());
      }

      if (statusUpdate.data?.dateExp) {
        params.set("dateExp", statusUpdate.data.dateExp);
      }

      const amountValue = statusUpdate.amount ?? purchase?.amount;
      if (amountValue) {
        params.set("amount", amountValue.toString());
      }

      // Xóa pending payment từ localStorage khi complete/failed/cancel
      localStorage.removeItem("pendingPayment");
      
      setTimeout(() => {
        router.push(`/purchase/result?${params.toString()}`);
      }, 1500);
    }
  }, [statusUpdate, purchase, router]);

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
        // Xóa pending payment từ localStorage
        localStorage.removeItem("pendingPayment");
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


  const planName = purchase?.subscriptionPlanName;
  const amountLabel = purchase?.amount;

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
        {planName && (
          <p className="font-poppins text-sm text-blue-100">
            Plan:{" "}
            <span className="font-semibold">{planName}</span> •
            {typeof amountLabel === "number" && (
              <>
                {" "}
                Amount:{" "}
                <span className="font-semibold">
                  {amountLabel.toLocaleString("vi-VN")} ₫
                </span>
              </>
            )}
          </p>
        )}

        {/* QR Code */}
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

        {/* Bank Information */}
        {purchase?.bankInfo && (
          <div className="rounded-2xl border border-white/20 bg-white/5 p-5 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 text-center mb-3">
              Bank Transfer Information
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <p className="text-sm text-gray-400 font-medium">Account Name</p>
                <p className="font-semibold text-white text-right max-w-[60%] wrap-break-word">
                  {purchase.bankInfo.accountName}
                </p>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <p className="text-sm text-gray-400 font-medium">Account Number</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono font-semibold text-white">
                    {purchase.bankInfo.accountNumber}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(purchase.bankInfo.accountNumber);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    title="Copy account number"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400 font-medium">Bank BIN</p>
                <p className="font-mono font-semibold text-white">
                  {purchase.bankInfo.bin}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-4 pt-3 border-t border-white/10">
              You can also transfer manually using the information above
            </p>
          </div>
        )}

        {/* Timer */}
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

        {/* Connection Status */}
        <div className="rounded-2xl border border-white/20 bg-white/5 p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionState === "connected"
                  ? "bg-emerald-400 animate-pulse"
                  : connectionState === "connecting"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-gray-400"
              }`}
            />
            <p className="text-sm text-gray-300">
              {connectionState === "connected"
                ? "Tracking payment status..."
                : connectionState === "connecting"
                ? "Connecting to payment tracker..."
                : "Waiting for connection..."}
            </p>
          </div>
        </div>

        {cancelFeedback?.status === "error" && (
          <p className="font-poppins text-sm text-red-300">
            {cancelFeedback.message}
          </p>
        )}

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mt-4">
          <Button
            variant="outline"
            className="border-white/40 text-white hover:bg-white/10"
            onClick={handleBackToPlans}
          >
            Back to plans
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

      {/* Loading Overlay khi đang redirect */}
      {isRedirecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl p-8 space-y-6 text-center max-w-md w-full mx-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-cyan-400 rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="font-dela-gothic text-xl text-white">
                Processing Payment Result...
              </h2>
              <p className="font-poppins text-sm text-gray-300">
                Please wait while we redirect you to the result page.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


