"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, CheckCircle2, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionHero } from "@/components/subscription";
import {
  SubscriptionPlansTab,
  CurrentSubscriptionTab,
  SubscriptionHistoryTab,
} from "@/components/subscription";
import {
  useCurrentSubscription,
  useSubscription,
  useSubscriptionHistory,
} from "@/hooks/subscription/useSubscription";

export default function SubscriptionContentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("plans");

  const { data, isLoading, isError, error, refetch } = useSubscription();
  const {
    data: currentData,
    isLoading: isLoadingCurrent,
  } = useCurrentSubscription();
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isError: isErrorHistory,
    error: errorHistory,
    refetch: refetchHistory,
  } = useSubscriptionHistory();

  const currentSubscription = currentData?.data;
  const currentPlanId = currentSubscription?.subscriptionPlanId;

  const handleGetStarted = useCallback(
    (planId: number) => {
      router.push(`/purchase?planId=${planId}`);
    },
    [router]
  );

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

          <TabsContent value="plans" className="mt-8">
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
              plansData={data}
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
    </div>
  );
}
