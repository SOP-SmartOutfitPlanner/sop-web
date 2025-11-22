"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";
import { useWeather } from "@/hooks/useWeather";
import { WeatherCard } from "@/components/suggest/WeatherCard";

export default function SuggestPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { isAuthenticated, user } = useAuthStore();

  // Weather hook
  const {
    todayForecast,
    cityName,
    isLoading: isLoadingWeather,
    error: weatherError,
    requestLocation,
    isRequestingLocation,
    locationError,
  } = useWeather();

  // Redirect to login if not authenticated
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated && !user) {
        router.push("/login");
      } else {
        setIsCheckingAuth(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32">
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h4 className="font-dela-gothic text-2xl md:text-3xl lg:text-4xl leading-tight">
              <span className="bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-cyan-200">
                What to wear today?
              </span>
            </h4>
            <p className="bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-cyan-200">
              Get personalized outfit suggestions powered by AI
            </p>
          </div>
        </div>

        {/* Weather Section */}
        <div className="space-y-4">
            <h4 className="font-bricolage font-bold text-xl md:text-2xl lg:text-3xl leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                Today&apos;s weather
              </span>
            </h4>

          {/* Loading State */}
          {isLoadingWeather && (
            <GlassCard
              padding="24px"
              borderRadius="24px"
              blur="10px"
              brightness={1.02}
              glowColor="rgba(34, 211, 238, 0.2)"
              borderColor="rgba(255, 255, 255, 0.2)"
              borderWidth="2px"
              className="bg-gradient-to-br from-cyan-300/20 via-blue-200/10 to-indigo-300/20"
            >
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white/70">
                    {isRequestingLocation
                      ? "Getting your location..."
                      : "Loading weather..."}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Error State */}
          {weatherError && !isLoadingWeather && (
            <GlassCard
              padding="24px"
              borderRadius="24px"
              blur="10px"
              brightness={1.02}
              glowColor="rgba(239, 68, 68, 0.2)"
              borderColor="rgba(248, 113, 113, 0.3)"
              borderWidth="2px"
              className="bg-gradient-to-br from-red-300/20 via-orange-200/10 to-red-300/20"
            >
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-300 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Unable to Get Weather
                  </h3>
                  <p className="text-white/70 text-sm mb-4">
                    {typeof weatherError === "string"
                      ? weatherError
                      : locationError ||
                        "We couldn't get your weather information. Please try sharing your location."}
                  </p>
                  <GlassButton
                    onClick={requestLocation}
                    disabled={isRequestingLocation}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {isRequestingLocation ? "Getting location..." : "Share Location"}
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Weather Card */}
          {todayForecast && !isLoadingWeather && (
            <WeatherCard forecast={todayForecast} cityName={cityName} />
          )}
        </div>
      </div>
    </div>
  );
}
