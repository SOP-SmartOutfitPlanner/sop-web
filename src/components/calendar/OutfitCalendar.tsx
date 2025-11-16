"use client";

import { useState } from "react";
import { WeeklyCalendar } from "./WeeklyCalendar";
import { MonthlyCalendar } from "./MonthlyCalendar";
import { useCalendarEntries, useUserOccasions } from "@/hooks/useCalendar";

export function OutfitCalendar() {
  const [viewMode, setViewMode] = useState<"week" | "month">("month");

  // Fetch calendar entries
  const { data: calendarData, isLoading } = useCalendarEntries({
    PageIndex: 1,
    PageSize: 100,
    takeAll: true,
  });

  // Fetch user occasions
  const { data: occasionsData } = useUserOccasions({
    PageIndex: 1,
    PageSize: 100,
    takeAll: true,
  });

  const calendarEntries = calendarData?.data?.data || [];
  const allUserOccasions = occasionsData?.data?.data || [];

  // Pass all user occasions to WeeklyCalendar, it will filter by week
  const userOccasions = allUserOccasions;

  // If in week view, render WeeklyCalendar
  if (viewMode === "week") {
    return (
      <WeeklyCalendar
        onShowMonthView={() => setViewMode("month")}
        calendarEntries={calendarEntries}
        userOccasions={userOccasions}
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
