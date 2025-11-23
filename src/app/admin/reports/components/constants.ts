// Action color schemes - extracted to avoid recreation on each render
export const ACTION_COLORS = {
  HIDE: {
    selected:
      "border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100/50 shadow-lg shadow-orange-200/60 ring-2 ring-orange-300",
    default:
      "border-orange-200 bg-white hover:border-orange-300 hover:bg-orange-50/30",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    titleColor: "text-orange-900",
    badgeColor: "bg-orange-100 text-orange-700 border-orange-300",
  },
  DELETE: {
    selected:
      "border-red-400 bg-gradient-to-br from-red-50 to-red-100/50 shadow-lg shadow-red-200/60 ring-2 ring-red-300",
    default: "border-red-200 bg-white hover:border-red-300 hover:bg-red-50/30",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    titleColor: "text-red-900",
    badgeColor: "bg-red-100 text-red-700 border-red-300",
  },
  WARN: {
    selected:
      "border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100/50 shadow-lg shadow-amber-200/60 ring-2 ring-amber-300",
    default:
      "border-amber-200 bg-white hover:border-amber-300 hover:bg-amber-50/30",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    titleColor: "text-amber-900",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-300",
  },
  SUSPEND: {
    selected:
      "border-red-600 bg-gradient-to-br from-red-100 to-red-200/50 shadow-lg shadow-red-300/60 ring-2 ring-red-400",
    default: "border-red-300 bg-white hover:border-red-400 hover:bg-red-50/40",
    iconBg: "bg-red-200",
    iconColor: "text-red-700",
    titleColor: "text-red-900",
    badgeColor: "bg-red-200 text-red-800 border-red-400",
  },
} as const;

export const DEFAULT_ACTION_COLORS = {
  selected:
    "border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg shadow-blue-200/60 ring-2 ring-blue-300",
  default: "border-blue-200 bg-white hover:border-blue-300 hover:bg-blue-50/30",
  iconBg: "bg-blue-100",
  iconColor: "text-blue-600",
  titleColor: "text-blue-900",
  badgeColor: "bg-blue-100 text-blue-700 border-blue-300",
} as const;

export const MAX_VISIBLE_IMAGES = 4;

