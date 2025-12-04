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
        <div className="h-12 w-12 text-white/30 mb-3 flex items-center justify-center">
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
        <p className="text-sm font-medium text-white/70">
          No history data recorded
        </p>
        <p className="text-xs text-white/40 mt-1">
          History will appear here as the report is processed
        </p>
      </div>
    );
  }

  return (
    <ol className="relative border-l-2 border-white/20 pl-8 space-y-6">
      {historyItems.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === historyItems.length - 1;
        return (
          <li key={item.id} className="relative">
            <span
              className={cn(
                "absolute -left-[2.125rem] flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md ring-2 ring-slate-900 transition-all",
                item.id === "created" && "bg-cyan-600",
                item.id === "in-progress" && "bg-amber-500",
                item.id === "resolved" && "bg-emerald-500",
                item.id === "action" && "bg-red-500",
                item.id === "notes" && "bg-slate-500",
                !isLast && "animate-pulse"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm font-bold text-white">{item.title}</p>
                <p className="text-xs font-medium text-white/50 whitespace-nowrap">
                  {item.time}
                </p>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                {item.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
