"use client";

import { useState, useEffect } from "react";
import { WeeklyCalendar } from "./WeeklyCalendar";
import { MonthlyCalendar } from "./MonthlyCalendar";
import { useCalendarEntries, useUserOccasions } from "@/hooks/useCalendar";
import { CalendarFilterType } from "@/types/calendar";
import { UserOccasionFilterType } from "@/types/userOccasion";

export function OutfitCalendar() {
  const [viewMode, setViewMode] = useState<"week" | "month">("week");

  // Fetch calendar entries với filter type dựa trên view mode
  const { data: calendarData, isLoading, refetch: refetchCalendar } = useCalendarEntries({
    PageIndex: 1,
    PageSize: 100,
    takeAll: true,
    FilterType: viewMode === "week" ? CalendarFilterType.THIS_WEEK : CalendarFilterType.THIS_MONTH,
  });

  // Fetch user occasions với filter type dựa trên view mode
  const { data: occasionsData, refetch: refetchOccasions } = useUserOccasions({
    PageIndex: 1,
    PageSize: 100,
    takeAll: true,
    FilterType: viewMode === "week" ? UserOccasionFilterType.THIS_WEEK : UserOccasionFilterType.THIS_MONTH,
  });

  // Refetch data khi component mount hoặc khi view mode thay đổi
  useEffect(() => {
    refetchCalendar();
    refetchOccasions();
  }, [viewMode, refetchCalendar, refetchOccasions]);

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
