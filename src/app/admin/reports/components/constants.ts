// Action color schemes - extracted to avoid recreation on each render
// Dark theme optimized for glass morphism design
export const ACTION_COLORS = {
  HIDE: {
    selected:
      "border-orange-500/50 bg-gradient-to-br from-orange-500/20 to-orange-500/10 shadow-lg shadow-orange-500/20 ring-2 ring-orange-500/50",
    default:
      "border-white/10 bg-white/5 hover:border-orange-500/30 hover:bg-orange-500/10",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
    titleColor: "text-orange-200",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  },
  DELETE: {
    selected:
      "border-red-500/50 bg-gradient-to-br from-red-500/20 to-red-500/10 shadow-lg shadow-red-500/20 ring-2 ring-red-500/50",
    default:
      "border-white/10 bg-white/5 hover:border-red-500/30 hover:bg-red-500/10",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
    titleColor: "text-red-200",
    badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
  },
  WARN: {
    selected:
      "border-amber-500/50 bg-gradient-to-br from-amber-500/20 to-amber-500/10 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/50",
    default:
      "border-white/10 bg-white/5 hover:border-amber-500/30 hover:bg-amber-500/10",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    titleColor: "text-amber-200",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  SUSPEND: {
    selected:
      "border-red-600/60 bg-gradient-to-br from-red-600/25 to-red-600/15 shadow-lg shadow-red-600/25 ring-2 ring-red-600/50",
    default:
      "border-white/10 bg-white/5 hover:border-red-600/40 hover:bg-red-600/15",
    iconBg: "bg-red-600/25",
    iconColor: "text-red-400",
    titleColor: "text-red-200",
    badgeColor: "bg-red-600/25 text-red-300 border-red-600/40",
  },
} as const;

export const DEFAULT_ACTION_COLORS = {
  selected:
    "border-cyan-500/50 bg-gradient-to-br from-cyan-500/20 to-cyan-500/10 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-500/50",
  default:
    "border-white/10 bg-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/10",
  iconBg: "bg-cyan-500/20",
  iconColor: "text-cyan-400",
  titleColor: "text-cyan-200",
  badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
} as const;

export const MAX_VISIBLE_IMAGES = 4;
