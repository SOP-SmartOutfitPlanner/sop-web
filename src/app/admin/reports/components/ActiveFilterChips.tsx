"use client";

import { Button } from "@/components/ui/button";

interface FilterChip {
  key: "type" | "status" | "fromDate" | "toDate";
  label: string;
}

interface ActiveFilterChipsProps {
  chips: FilterChip[];
  onClearFilter: (key: FilterChip["key"]) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  chips,
  onClearFilter,
  onClearAll,
}: ActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => onClearFilter(chip.key)}
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
        >
          {chip.label}
          <span className="text-slate-400">×</span>
        </button>
      ))}
      <Button variant="ghost" size="sm" onClick={onClearAll}>
        Clear all
      </Button>
    </div>
  );
}

