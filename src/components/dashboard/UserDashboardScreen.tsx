"use client";

import { useAuthStore } from "@/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { CalenderAPI } from "@/lib/api/calender-api";
import { subscriptionAPI } from "@/lib/api/subscription-api";
import { wardrobeAPI } from "@/lib/api/wardrobe-api";
import { UpcomingOccasionsWidget } from "./widgets/UpcomingOccasionsWidget";
import { MostWornItemsWidget } from "./widgets/MostWornItemsWidget";
import { SubscriptionWidget } from "./widgets/SubscriptionWidget";
import { WardrobeOverviewWidget } from "./widgets/WardrobeOverviewWidget";
import { StatsOverviewWidget, calculateStatsFromItems } from "./widgets/StatsOverviewWidget";
import { WeatherForecastWidget } from "./widgets/WeatherForecastWidget";
import { RecentlyAddedWidget } from "./widgets/RecentlyAddedWidget";
import { WelcomeHeader } from "./widgets/WelcomeHeader";
import { useWeather } from "@/hooks/useWeather";

export function UserDashboardScreen() {
  const { user } = useAuthStore();

  // Fetch weather data (5 days forecast)
  const {
    weatherData,
    cityName,
    isLoading: isLoadingWeather,
    error: weatherError,
    refetch: refetchWeather,
  } = useWeather({ cnt: 5, enabled: !!user });

  // Fetch occasions for this week
  const { data: weekOccasions, isLoading: isLoadingOccasions } = useQuery({
    queryKey: ["user-occasions", "this-week"],
    queryFn: () =>
      CalenderAPI.getUserOccasions({
        PageIndex: 1,
        PageSize: 20,
        UpcomingDays: true,
      }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch current subscription
  const { data: currentSubscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ["subscription", "current"],
    queryFn: () => subscriptionAPI.getCurrentSubscription(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch wardrobe stats
  const { data: wardrobeStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["wardrobe", "stats"],
    queryFn: () => wardrobeAPI.getUserStats(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch most worn items (first page, sorted by frequency)
  const { data: wardrobeItems, isLoading: isLoadingItems } = useQuery({
    queryKey: ["wardrobe", "items", "most-worn"],
    queryFn: () =>
      wardrobeAPI.getItems(1, 50, {
        sortByDate: "desc",
      }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const occasions = weekOccasions?.data?.data || [];
  const subscription = currentSubscription?.data;
  const stats = wardrobeStats || { totalItems: 0, categoryCounts: {} };
  const items = wardrobeItems?.data || [];

  // Sort items by times worn to get most worn
  const mostWornItems = [...items]
    .filter((item) => (item.frequencyWorn ? parseInt(item.frequencyWorn) : 0) > 0)
    .sort((a, b) => {
      const aWorn = a.frequencyWorn ? parseInt(a.frequencyWorn) : 0;
      const bWorn = b.frequencyWorn ? parseInt(b.frequencyWorn) : 0;
      return bWorn - aWorn;
    })
    .slice(0, 6);

  // Get recently added items (sorted by date, newest first)
  const recentlyAddedItems = [...items]
    .sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    })
    .slice(0, 5);

  // Calculate stats for overview
  const itemStats = calculateStatsFromItems(items);

  return (
    <div className="relative min-h-screen w-full px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      {/* Main Content */}
      <div className="relative mx-auto max-w-7xl space-y-8 mt-10">
        {/* Welcome Header */}
        <WelcomeHeader user={user} />

        {/* Stats Overview */}
        <StatsOverviewWidget
          totalItems={itemStats.totalItems}
          analyzedItems={itemStats.analyzedItems}
          totalWornCount={itemStats.totalWornCount}
          categoryCount={itemStats.categoryCount}
          isLoading={isLoadingItems}
        />

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3 items-stretch">
          {/* Left Column - Weather, Upcoming Events & Items */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <WeatherForecastWidget
              weatherData={weatherData}
              cityName={cityName}
              isLoading={isLoadingWeather}
              error={weatherError}
              onRefresh={refetchWeather}
            />
            <UpcomingOccasionsWidget
              occasions={occasions}
              isLoading={isLoadingOccasions}
            />
            <div className="grid gap-6 md:grid-cols-2 auto-rows-fr flex-1">
              <RecentlyAddedWidget
                items={recentlyAddedItems}
                isLoading={isLoadingItems}
              />
              <MostWornItemsWidget
                items={mostWornItems}
                isLoading={isLoadingItems}
              />
            </div>
          </div>

          {/* Right Column - Subscription & Wardrobe Chart */}
          <div className="space-y-6">
            <SubscriptionWidget
              subscription={subscription}
              isLoading={isLoadingSubscription}
            />
            <WardrobeOverviewWidget
              stats={stats}
              isLoading={isLoadingStats}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
