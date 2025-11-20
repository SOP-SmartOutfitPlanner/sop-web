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