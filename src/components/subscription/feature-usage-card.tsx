import { motion } from "framer-motion";
import { getFeatureDisplayName, type RemainingUsage } from "./subscription-utils";

interface FeatureUsageCardProps {
  feature: RemainingUsage;
}

export function FeatureUsageCard({ feature }: FeatureUsageCardProps) {
  const usagePercentage = feature.isUnlimited
    ? 0
    : Math.min(100, (feature.used / feature.limit) * 100);

  const getProgressColor = () => {
    if (feature.isUnlimited) return "bg-emerald-400";
    if (feature.remaining > feature.limit * 0.2) return "bg-emerald-400";
    if (feature.remaining > 0) return "bg-amber-400";
    return "bg-red-400";
  };

  const getTextColor = () => {
    if (feature.isUnlimited) return "text-emerald-300";
    if (feature.remaining > feature.limit * 0.2) return "text-emerald-300";
    if (feature.remaining > 0) return "text-amber-300";
    return "text-red-300";
  };

  return (
    <div className="p-5 rounded-2xl bg-linear-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 hover:shadow-lg transition-all group">
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-white text-sm leading-tight">
          {getFeatureDisplayName(feature.featureCode)}
        </p>
        {feature.benefitType && (
          <span className="text-xs text-gray-400 bg-white/10 px-2.5 py-1 rounded-full border border-white/10 font-medium">
            {feature.benefitType}
          </span>
        )}
      </div>
      {feature.isUnlimited ? (
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          </div>
          <p className="text-emerald-300 text-sm font-semibold">Unlimited</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Used</span>
            <span className="text-white font-semibold text-sm">
              {feature.used} / {feature.limit}
            </span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full transition-all ${getProgressColor()}`}
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-gray-400">Remaining</p>
            <p className={`text-sm font-bold ${getTextColor()}`}>
              {feature.remaining}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

