export type SubscriptionCardVariant = "outline" | "primary" | "ghost";

export type SubscriptionCard = {
  id: number;
  name: string;
  description: string;
  priceValue: number;
  priceDisplay: string;
  periodLabel: string;
  features: string[];
  status: string;
  variant: SubscriptionCardVariant;
  isPopular: boolean;
  isPremium: boolean;
  isFree: boolean;
  cta: string;
  badge?: string;
};

export type SubscriptionPlanCardProps = {
  plan: SubscriptionCard;
  index: number;
  onGetStarted: (planId: number) => void;
};

export type SubscriptionStateCardProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  messageClassName?: string;
};

