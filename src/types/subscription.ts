//==================User Subscription=========================
export interface UserSubscription {
    id: number;
    name: string;
    description: string;
    price: number;
    benefitLimit:{
        featureCode: string;
        usage: number;
        benefitType: string;
    }[];
    status: string;
    createdDate: string;
    updatedDate: string | null;
}
export interface UserSubscriptionResponse {
    statusCode: number;
    message: string;
    data: UserSubscription[];
}
//==================Current Subscription=========================
export interface CurrentSubscriptionResponse {
    statusCode: number;
    message: string;
    data: CurrentSubscription;
}
export interface CurrentSubscription {
    id:number;
    userId:number;
    subscriptionPlanId:number;
    subscriptionPlanName:string;
    dateExp:string;
    isActive:boolean;
    benefitUsage:BenefitUsage[];
}
export interface BenefitUsage {
    featureCode:string;
    usage:number;
    limit:number;
    benefitType:string;
}
export interface Transaction {
    id:number;
    userId:number;
    subscriptionPlanId:number;
    price:number;
    status:string;
    createdDate:string;
    transactionCode?: number;
    description?: string;
    updatedDate?: string;
}
//================Purchase===========================
export interface PurchaseRequest{
    subscriptionPlanId: number;
}
export interface PurchaseResponse {
    statusCode: number;
    message: string;
    data: Purchase;
}
export interface Purchase {
    qrCode: string;
    paymentUrl: string;
    amount: number;
    subscriptionPlanName: string;
    userSubscriptionId: number;
    transactionId: number;
    expiredAt: number;
    bankInfo: {
        bin: string;
        accountNumber: string;
        accountName: string;
    }
    
}

//================Cancel Purchase===========================
export interface CancelPurchaseResponse {
    statusCode: number;
    message: string;
    data: {
        transactionId: number;
        status: string;
        subscriptionPlanName: string;
    }
}

//================Payment Status Streaming===========================
export interface PaymentStatusUpdate {
    transactionId: number;
    status: string;
    message?: string;
    paidAt?: string;
    amount?: number;
    subscriptionPlanId?: number;
    subscriptionPlanName?: string;
    metadata?: Record<string, unknown>;
    data?: PaymentStatusDetails;
}

export interface PaymentStatusDetails {
    userId: number;
    transactionId: number;
    transactionCode: number;
    status: "PENDING" | "COMPLETED" | "FAILED" | "CANCEL";
    userSubscriptionId: number;
    isActive: boolean;
    dateExp: string;
    subscriptionPlanName: string;
}

export interface SubscriptionHistoryResponse {
    statusCode: number;
    message: string;
    data: SubscriptionHistory[];
}
export interface SubscriptionHistory {
    id: number;
    userId: number;
    subscriptionPlanId: number;
    dateExp: string;
    isActive: boolean;
    benefitUsage: BenefitUsage[];
    subscriptionPlan: UserSubscription;
    transactions: Transaction[];
    createdDate: string;
}