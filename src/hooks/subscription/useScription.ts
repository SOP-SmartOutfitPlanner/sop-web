import { useQuery } from "@tanstack/react-query";
import subscriptionAPI from "@/lib/api/subscription-api";
import type { UserSubscriptionResponse } from "@/types/subscription";

const SUBSCRIPTION_QUERY_KEY = ["subscription", "plans"] as const;

export function useScription() {
  return useQuery<UserSubscriptionResponse>({
    queryKey: SUBSCRIPTION_QUERY_KEY,
    queryFn: () => subscriptionAPI.getUserSubscriptions(),
  });
}

export type UseSubscriptionPlansResult = ReturnType<typeof useScription>;
