"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Package, CheckCircle2, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SubscriptionHero,
  PendingPaymentDialog,
} from "@/components/subscription";
import {
  SubscriptionPlansTab,
  CurrentSubscriptionTab,
  SubscriptionHistoryTab,
} from "@/components/subscription";
import {
  useCurrentSubscription,
  useSubscription,
  useSubscriptionHistory,
  useCancelPurchaseSubscriptionMutation,
} from "@/hooks/subscription/useSubscription";
import type { Purchase } from "@/types/subscription";
import { ConfirmModal } from "@/components/common/ConfirmModal";

interface PendingPaymentData {
  transactionId: number;
  planId: number;
  planName: string;
  amount: number;
  expiredAt: number;
}

const formatTimeLeft = (msRemaining: number) => {
  if (msRemaining <= 0) return "Expired";

  const totalSeconds = Math.floor(msRemaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export default function SubscriptionContentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState("plans");

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [pendingPaymentData, setPendingPaymentData] = useState<PendingPaymentData | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [showPlanBlockedModal, setShowPlanBlockedModal] = useState(false);

  const { data, isLoading, isError, error, refetch } = useSubscription();
  const {
    data: currentData,
    isLoading: isLoadingCurrent,
    refetch: refetchCurrent,
  } = useCurrentSubscription();
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isError: isErrorHistory,
    error: errorHistory,
    refetch: refetchHistory,
  } = useSubscriptionHistory();

  const {
    mutate: cancelSubscription,
    isPending: isCancelling,
  } = useCancelPurchaseSubscriptionMutation();

  const currentSubscription = currentData?.data;
  const currentPlanId = currentSubscription?.subscriptionPlanId;

  // Check pending payment từ localStorage khi mount
  useEffect(() => {
    const checkPendingPayment = () => {
      try {
        const pendingDataStr = localStorage.getItem("pendingPayment");
        if (!pendingDataStr) return;

        const pendingData: PendingPaymentData = JSON.parse(pendingDataStr);
        const expiredAt = pendingData.expiredAt;
        const currentTime = Date.now();

        // Check nếu đã expired
        if (expiredAt && currentTime >= expiredAt) {
          localStorage.removeItem("pendingPayment");
          return;
        }

        // Hiện dialog với thông tin từ localStorage
        setPendingPaymentData(pendingData);
        setExpiresAt(expiredAt);
        setNow(currentTime);
        setShowPendingDialog(true);
      } catch (err) {
        console.error("Error checking pending payment:", err);
      }
    };

    checkPendingPayment();
  }, []);

  // Update timer mỗi giây
  useEffect(() => {
    if (!expiresAt || !showPendingDialog) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, showPendingDialog]);

  const isExpired = useMemo(
    () => (expiresAt ? now >= expiresAt : false),
    [expiresAt, now]
  );

  const timeLeftLabel = useMemo(() => {
    if (!expiresAt) return "";
    const timeLeft = expiresAt - now;
    return formatTimeLeft(timeLeft);
  }, [expiresAt, now]);

  const handleGetStarted = useCallback(
    (planId: number) => {
      const hasPaidPlan =
        currentSubscription &&
        currentSubscription.subscriptionPlanName &&
        currentSubscription.subscriptionPlanName.toLowerCase() !== "free";

      const isDifferentPlan = planId !== currentPlanId;

      if (hasPaidPlan && isDifferentPlan) {
        setShowPlanBlockedModal(true);
        return;
      }

      router.push(`/purchase/checkout?planId=${planId}`);
    },
    [router, currentPlanId, currentSubscription]
  );

  const handleContinuePayment = useCallback(() => {
    if (pendingPaymentData?.planId) {
      setShowPendingDialog(false);
      router.push(`/purchase?planId=${pendingPaymentData.planId}`);
    }
  }, [router, pendingPaymentData]);

  const handleCancelPayment = useCallback(() => {
    if (!pendingPaymentData?.transactionId) {
      localStorage.removeItem("pendingPayment");
      setShowPendingDialog(false);
      return;
    }

    cancelSubscription(pendingPaymentData.transactionId, {
      onSuccess: () => {
        localStorage.removeItem("pendingPayment");
        setPendingPaymentData(null);
        setExpiresAt(null);
        setShowPendingDialog(false);
      },
      onError: (error) => {
        console.error("Error cancelling payment:", error);
        // Vẫn xóa localStorage và đóng dialog
        localStorage.removeItem("pendingPayment");
        setShowPendingDialog(false);
      },
    });
  }, [pendingPaymentData, cancelSubscription]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleRefresh = () => {
      refetch();
      refetchCurrent();
      refetchHistory();
    };

    window.addEventListener("subscription:refresh", handleRefresh);
    return () => {
      window.removeEventListener("subscription:refresh", handleRefresh);
    };
  }, [refetch, refetchCurrent, refetchHistory]);

  // Tạo Purchase object từ pendingPaymentData để hiển thị trong dialog
  const purchaseForDialog = useMemo<Purchase | null>(() => {
    if (!pendingPaymentData) return null;
    
    return {
      qrCode: "",
      paymentUrl: "",
      amount: pendingPaymentData.amount,
      subscriptionPlanName: pendingPaymentData.planName,
      userSubscriptionId: 0,
      transactionId: pendingPaymentData.transactionId,
      expiredAt: pendingPaymentData.expiredAt,
      bankInfo: {
        bin: "",
        accountNumber: "",
        accountName: "",
      },
    };
  }, [pendingPaymentData]);

  return (
    <div className="min-h-screen pt-32">
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-12">
        {/* Section header */}
        <SubscriptionHero />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-white/10 border border-white/20">
            <TabsTrigger
              value="plans"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
            >
              <Package className="w-4 h-4 mr-2" />
              Subscription Plans
            </TabsTrigger>
            <TabsTrigger
              value="current"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Current Subscription
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="mt-16">
            <SubscriptionPlansTab
              data={data}
              isLoading={isLoading}
              isError={isError}
              error={error}
              refetch={refetch}
              currentPlanId={currentPlanId}
              onGetStarted={handleGetStarted}
            />
          </TabsContent>

          <TabsContent value="current" className="mt-8">
            <CurrentSubscriptionTab
              currentSubscription={currentSubscription}
              isLoading={isLoadingCurrent}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-8">
            <SubscriptionHistoryTab
              data={historyData}
              isLoading={isLoadingHistory}
              isError={isErrorHistory}
              error={errorHistory}
              refetch={refetchHistory}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Pending Payment Dialog */}
      {purchaseForDialog && (
        <PendingPaymentDialog
          open={showPendingDialog}
          onOpenChange={setShowPendingDialog}
          purchase={purchaseForDialog}
          expiresAt={expiresAt}
          isExpired={isExpired}
          timeLeftLabel={timeLeftLabel}
          isCancelling={isCancelling}
          onContinuePayment={handleContinuePayment}
          onCancelPayment={handleCancelPayment}
        />
      )}
      <ConfirmModal
        open={showPlanBlockedModal}
        onOpenChange={setShowPlanBlockedModal}
        title="Action not allowed"
        subtitle="You already have an active paid subscription."
        confirmButtonText="Got it"
        showCancelButton={false}
        onConfirm={() => setShowPlanBlockedModal(false)}
      >
        <p className="text-sm text-gray-200">
          Please wait until your current plan expires before purchasing another subscription.
        </p>
      </ConfirmModal>
    </div>
  );
}
