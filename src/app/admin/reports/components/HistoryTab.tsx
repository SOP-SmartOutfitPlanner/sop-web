"use client";

import { cn } from "@/lib/utils";

interface HistoryItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface HistoryTabProps {
  historyItems: HistoryItem[];
}

export function HistoryTab({ historyItems }: HistoryTabProps) {
  if (historyItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-12 w-12 text-slate-300 mb-3 flex items-center justify-center">
          <svg
            className="w-full h-full"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600">
          No history data recorded
        </p>
        <p className="text-xs text-slate-400 mt-1">
          History will appear here as the report is processed
        </p>
      </div>
    );
  }

  return (
    <ol className="relative border-l-2 border-slate-200 pl-8 space-y-6">
      {historyItems.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === historyItems.length - 1;
        return (
          <li key={item.id} className="relative">
            <span
              className={cn(
                "absolute -left-[2.125rem] flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md ring-2 ring-white transition-all",
                item.id === "created" && "bg-blue-600",
                item.id === "in-progress" && "bg-amber-600",
                item.id === "resolved" && "bg-emerald-600",
                item.id === "action" && "bg-red-600",
                item.id === "notes" && "bg-slate-600",
                !isLast && "animate-pulse"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                <p className="text-xs font-medium text-slate-500 whitespace-nowrap">
                  {item.time}
                </p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
