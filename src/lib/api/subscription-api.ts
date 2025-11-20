import { apiClient } from "./client";
import type { UserSubscriptionResponse } from "@/types/subscription";

export const subscriptionAPI = {
    getUserSubscriptions: async (): Promise<UserSubscriptionResponse> => {
        return apiClient.get<UserSubscriptionResponse>('/subscriptions/plans');
    }
}
export default subscriptionAPI;