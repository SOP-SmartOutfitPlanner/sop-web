import { apiClient } from "./client";
import type {
  CancelPurchaseResponse,
  CurrentSubscriptionResponse,
  PurchaseRequest,
  PurchaseResponse,
  SubscriptionHistoryResponse,
  UserSubscriptionResponse,
} from "@/types/subscription";

export const subscriptionAPI = {
  getUserSubscriptions: async (): Promise<UserSubscriptionResponse> => {
    return apiClient.get<UserSubscriptionResponse>("/subscriptions/plans");
  },
  getCurrentSubscription: async (): Promise<CurrentSubscriptionResponse> => {
    return apiClient.get<CurrentSubscriptionResponse>("/subscriptions/me");
  },
  getSubscriptionHistory: async (): Promise<SubscriptionHistoryResponse> => {
    return apiClient.get<SubscriptionHistoryResponse>("/subscriptions/history");
  },
  purchaseSubscription: async (
    data: PurchaseRequest
  ): Promise<PurchaseResponse> => {
    return apiClient.post<PurchaseResponse>("/subscriptions/purchase", data);
  },
  cancelSubscription: async (
    transactionId: number
  ): Promise<CancelPurchaseResponse> => {
    return apiClient.delete<CancelPurchaseResponse>(
      `/subscriptions/cancel/${transactionId}`
    );
  },
};
export default subscriptionAPI;