"use client";

import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  error: string;
  onDismiss?: () => void;
}

export function ErrorDisplay({
  error,
  onDismiss,
}: ErrorDisplayProps) {
  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 text-sm"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
