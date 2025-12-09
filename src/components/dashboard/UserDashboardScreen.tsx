"use client";

import { useAuthStore } from "@/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { CalenderAPI } from "@/lib/api/calender-api";
import { UserOccasionFilterType } from "@/types/userOccasion";
import { WelcomeHeader } from "./widgets/WelcomeHeader";
import { TodayOccasionCard } from "./widgets/TodayOccasionCard";
import { UpcomingOccasionsTimeline } from "./widgets/UpcomingOccasionsTimeline";
import { MonthlyOccasionCalendar } from "./widgets/MonthlyOccasionCalendar";
import { QuickAddOccasion } from "./widgets/QuickAddOccasion";
import { OccasionStatsWidget } from "./widgets/OccasionStatsWidget";

export function UserDashboardScreen() {
  const { user } = useAuthStore();

  // Fetch today's occasions
  const { data: todayOccasions, isLoading: isLoadingToday } = useQuery({
    queryKey: ["user-occasions", "today"],
    queryFn: () =>
      CalenderAPI.getUserOccasions({
        PageIndex: 1,
        PageSize: 100,
        takeAll: true,
        Today: true,
      }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch upcoming occasions (this week)
  const { data: weekOccasions, isLoading: isLoadingWeek } = useQuery({
    queryKey: ["user-occasions", "this-week"],
    queryFn: () =>
      CalenderAPI.getUserOccasions({
        PageIndex: 1,
        PageSize: 100,
        takeAll: true,
        FilterType: UserOccasionFilterType.THIS_WEEK,
      }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch this month's occasions for calendar
  const { data: monthOccasions, isLoading: isLoadingMonth } = useQuery({
    queryKey: ["user-occasions", "this-month"],
    queryFn: () =>
      CalenderAPI.getUserOccasions({
        PageIndex: 1,
        PageSize: 100,
        takeAll: true,
        FilterType: UserOccasionFilterType.THIS_MONTH,
      }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const todayEvents = todayOccasions?.data?.data || [];
  const weekEvents = weekOccasions?.data?.data || [];
  const monthEvents = monthOccasions?.data?.data || [];

  return (
    <div className="relative min-h-screen w-full px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      {/* Main Content */}
      <div className="relative mx-auto max-w-7xl space-y-8 mt-10">
        {/* Welcome Header */}
        <WelcomeHeader user={user} />

        {/* Stats Overview */}
        <OccasionStatsWidget
          todayCount={todayEvents.length}
          weekCount={weekEvents.length}
          monthCount={monthEvents.length}
          isLoading={isLoadingToday || isLoadingWeek || isLoadingMonth}
        />

        {/* Main Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Today & Timeline */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Today's Occasions - Full width in left column */}
            <TodayOccasionCard
              occasions={todayEvents}
              isLoading={isLoadingToday}
            />

            {/* Upcoming Timeline */}
            <UpcomingOccasionsTimeline
              occasions={weekEvents}
              isLoading={isLoadingWeek}
            />
          </div>

          {/* Right Column - Calendar & Quick Add */}
          <div className="flex flex-col gap-6">
            {/* Mini Calendar */}
            <MonthlyOccasionCalendar
              occasions={monthEvents}
              isLoading={isLoadingMonth}
            />

            {/* Quick Add */}
            <QuickAddOccasion />
          </div>
        </div>
      </div>
    </div>
  );
}
