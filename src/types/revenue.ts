// Revenue Types - matches API response from /admin-dashboard/revenue

export interface MonthlyRevenue {
  month: number;
  year: number;
  monthName: string;
  revenue: number;
  transactionCount: number;
  completedCount: number;
}

export interface RevenueByPlan {
  subscriptionPlanId: number;
  planName: string;
  planPrice: number;
  totalRevenue: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
}

export interface RecentTransaction {
  transactionId: number;
  userSubscriptionId: number;
  userId: number;
  userEmail: string;
  userDisplayName: string;
  subscriptionPlanName: string;
  transactionCode: number;
  price: number;
  status: TransactionStatus;
  createdDate: string;
}

export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED" | "CANCELLED";

export interface RevenueStatistics {
  totalRevenue: number;
  totalTransactions: number;
  totalCompletedTransactions: number;
  totalPendingTransactions: number;
  totalFailedTransactions: number;
  totalCancelledTransactions: number;
  totalActiveSubscriptions: number;
  monthlyRevenue: MonthlyRevenue[];
  revenueByPlan: RevenueByPlan[];
  recentTransactions: RecentTransaction[];
}

export interface GetRevenueParams {
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
  subscriptionPlanId?: number;
  recentTransactionLimit?: number;
}