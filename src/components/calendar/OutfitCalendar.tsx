"use client";

import { useState } from "react";
import { WeeklyCalendar } from "./WeeklyCalendar";
import { MonthlyCalendar } from "./MonthlyCalendar";
import { useCalendarEntries } from "@/hooks/useCalendar";

export function OutfitCalendar() {
  const [viewMode, setViewMode] = useState<"week" | "month">("month");

  // Fetch calendar entries
  const { data: calendarData, isLoading } = useCalendarEntries({
    PageIndex: 1,
    PageSize: 100,
    takeAll: true,
  });

  const calendarEntries = calendarData?.data?.data || [];

  // If in week view, render WeeklyCalendar
  if (viewMode === "week") {
    return (
      <WeeklyCalendar
        onShowMonthView={() => setViewMode("month")}
        calendarEntries={calendarEntries}
        isLoading={isLoading}
      />
    );
  }

  // Render MonthlyCalendar for month view
  return (
    <MonthlyCalendar
      onShowWeekView={() => setViewMode("week")}
      calendarEntries={calendarEntries}
      isLoading={isLoading}
    />
  );
}
