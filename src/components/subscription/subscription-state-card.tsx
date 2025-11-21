"use client";

import type { SubscriptionStateCardProps } from "./types";

export const SubscriptionStateCard = ({
  message,
  actionLabel,
  onAction,
  messageClassName,
}: SubscriptionStateCardProps) => (
  <div className="col-span-full text-center bg-white/5 border border-white/10 rounded-2xl p-10">
    <p
      className={`font-poppins text-lg mb-4 ${
        messageClassName ?? "text-gray-200"
      }`}
    >
      {message}
    </p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="px-6 py-3 font-bricolage font-semibold rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 transition-all"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

