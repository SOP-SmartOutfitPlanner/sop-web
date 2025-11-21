import { getFeatureDisplayName, type RemainingUsage } from "./subscription-utils";

interface FeatureUsageCardProps {
  feature: RemainingUsage;
}

export function FeatureUsageCard({ feature }: FeatureUsageCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-white text-sm">
          {getFeatureDisplayName(feature.featureCode)}
        </p>
        {feature.benefitType && (
          <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
            {feature.benefitType}
          </span>
        )}
      </div>
      {feature.isUnlimited ? (
        <p className="text-emerald-300 text-sm font-medium">Unlimited</p>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Used</span>
            <span className="text-white">
              {feature.used} / {feature.limit}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            { }
            <div
              className={`h-2 rounded-full transition-all ${
                feature.remaining > feature.limit * 0.2
                  ? "bg-emerald-400"
                  : feature.remaining > 0
                  ? "bg-amber-400"
                  : "bg-red-400"
              }`}
              style={{
                width: `${Math.min(100, (feature.remaining / feature.limit) * 100)}%`,
              }}
            />
          </div>
          <p className="text-sm font-semibold mt-2">
            <span
              className={
                feature.remaining > feature.limit * 0.2
                  ? "text-emerald-300"
                  : feature.remaining > 0
                  ? "text-amber-300"
                  : "text-red-300"
              }
            >
              {feature.remaining}
            </span>
            <span className="text-gray-400 ml-1">remaining</span>
          </p>
        </div>
      )}
    </div>
  );
}

