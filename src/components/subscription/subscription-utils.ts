import type { UserSubscription, BenefitUsage } from "@/types/subscription";

// Map feature code thành tên hiển thị thân thiện
export const getFeatureDisplayName = (featureCode: string): string => {
  const featureNameMap: Record<string, string> = {
    OutfitSuggestion: "Outfit Suggest by AI",
    SplitItem: "Upload & Split Outfit",
    PlanOccasion: "Outfit Calendar",
    ItemWardrobe: "Item in Wardrobe",
  };

  return featureNameMap[featureCode] ?? featureCode;
};

export const formatCurrency = (value: number) => {
  const normalizedValue = Number.isFinite(value) ? value : Number(value) || 0;

  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(normalizedValue);
  } catch {
    return `${normalizedValue.toLocaleString("vi-VN")} ₫`;
  }
};

export const formatBenefitLimit = (
  benefit: UserSubscription["benefitLimit"][number]
) => {
  const details: string[] = [];
  if (typeof benefit.usage !== "undefined") {
    details.push(`${benefit.usage}`);
  }
  if (benefit.benefitType) {
    details.push(benefit.benefitType);
  }

  return details.length
    ? `${benefit.featureCode} • ${details.join(" ")}`
    : benefit.featureCode;
};

// Tính toán số lần còn lại
export function calculateRemainingUsage(
  plan: UserSubscription,
  benefitUsage: BenefitUsage[]
) {
  const usageMap = new Map<string, BenefitUsage>();
  benefitUsage?.forEach((usage) => {
    usageMap.set(usage.featureCode, usage);
  });

  return (
    plan.benefitLimit?.map((limit) => {
      const used = usageMap.get(limit.featureCode);
      const usedCount = used?.usage ?? 0;
      // remaining = limit.usage (tổng số có thể dùng từ benefitLimit)
      const remaining = limit.usage;

      return {
        featureCode: limit.featureCode,
        benefitType: limit.benefitType,
        limit: limit.usage,
        used: usedCount,
        remaining,
        isUnlimited: limit.usage === -1 || limit.usage === Infinity,
      };
    }) ?? []
  );
}

export type RemainingUsage = ReturnType<typeof calculateRemainingUsage>[number];

