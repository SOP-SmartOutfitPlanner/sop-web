import { useMutation, useQuery } from "@tanstack/react-query";
import subscriptionAPI from "@/lib/api/subscription-api";
import type {
  CancelPurchaseResponse,
  CurrentSubscriptionResponse,
  SubscriptionHistoryResponse,
  UserSubscriptionResponse,
} from "@/types/subscription";

const SUBSCRIPTION_QUERY_KEY = ["subscription", "plans"] as const;
const CURRENT_SUBSCRIPTION_QUERY_KEY = ["subscription", "current"] as const;
const SUBSCRIPTION_HISTORY_QUERY_KEY = ["subscription", "history"] as const;

export function useSubscription() {
  return useQuery<UserSubscriptionResponse>({
    queryKey: SUBSCRIPTION_QUERY_KEY,
    queryFn: () => subscriptionAPI.getUserSubscriptions(),
    staleTime: 0, // Always consider data stale
    refetchOnMount: 'always', // Always refetch when component mounts
  });
}

export function useCurrentSubscription() {
  return useQuery<CurrentSubscriptionResponse>({
    queryKey: CURRENT_SUBSCRIPTION_QUERY_KEY,
    queryFn: () => subscriptionAPI.getCurrentSubscription(),
    staleTime: 0, // Always consider data stale
    refetchOnMount: 'always', // Always refetch when component mounts
  });
}

export function useSubscriptionHistory() {
  return useQuery<SubscriptionHistoryResponse>({
    queryKey: SUBSCRIPTION_HISTORY_QUERY_KEY,
    queryFn: () => subscriptionAPI.getSubscriptionHistory(),
    staleTime: 0, // Always consider data stale
    refetchOnMount: 'always', // Always refetch when component mounts
  });
}

export function useCancelPurchaseSubscriptionMutation() {
  return useMutation<CancelPurchaseResponse, Error, number>({
    mutationFn: (transactionId: number) =>
      subscriptionAPI.cancelSubscription(transactionId),
  });
}

export type UseSubscriptionPlansResult = ReturnType<typeof useSubscription>;
export type UseCurrentSubscriptionResult = ReturnType<
  typeof useCurrentSubscription
>;
