"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  MapPin,
  Droplets,
  Wind,
  Thermometer,
  CloudRain,
  RefreshCw,
} from "lucide-react";
import { DailyForecast, WeatherData } from "@/types/weather";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import GlassCard from "@/components/ui/glass-card";

interface WeatherForecastWidgetProps {
  weatherData: WeatherData | undefined;
  cityName: string | undefined;
  isLoading: boolean;
  error: string | Error | null;
  onRefresh: () => void;
}

// Get weather icon based on description
const getWeatherIcon = (description: string): string => {
  const desc = description.toLowerCase();

  if (desc.includes("thunder") || desc.includes("lightning") || desc.includes("storm")) {
    return "/icon/stormy-weather-50.png";
  }
  if (desc.includes("heavy") || desc.includes("downpour") || desc.includes("pour") || desc.includes("fall")) {
    return "/icon/rainfall-50.png";
  }
  if (desc.includes("rain") || desc.includes("rainy") || desc.includes("drizzle") || desc.includes("shower") || desc.includes("moderate")) {
    return "/icon/moderate-rain-50.png";
  }
  if (desc.includes("wind") || desc.includes("breezy") || desc.includes("gusty")) {
    return "/icon/windy-weather-50.png";
  }
  if (desc.includes("clear") || desc.includes("sunny") || desc.includes("bright")) {
    return "/icon/sun-50.png";
  }
  if (desc.includes("partly") || desc.includes("scattered") || desc.includes("few clouds")) {
    return "/icon/partly-cloudy-day-50.png";
  }

  return "/icon/clouds-50.png";
};

// Get background gradient based on weather
const getWeatherGradient = (description: string): string => {
  const desc = description.toLowerCase();

  if (desc.includes("thunder") || desc.includes("storm")) {
    return "from-slate-600/20 via-purple-500/10 to-slate-700/20";
  }
  if (desc.includes("rain") || desc.includes("drizzle") || desc.includes("shower")) {
    return "from-blue-500/20 via-slate-500/10 to-blue-600/20";
  }
  if (desc.includes("clear") || desc.includes("sunny")) {
    return "from-amber-400/20 via-orange-300/10 to-yellow-400/20";
  }
  if (desc.includes("cloud") || desc.includes("overcast")) {
    return "from-slate-400/20 via-gray-300/10 to-slate-500/20";
  }

  return "from-cyan-500/20 via-blue-400/10 to-indigo-500/20";
};

// Format day name
const formatDayName = (dateString: string, index: number): string => {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

export function WeatherForecastWidget({
  weatherData,
  cityName,
  isLoading,
  error,
  onRefresh,
}: WeatherForecastWidgetProps) {
  if (isLoading) {
    return (
      <GlassCard
        padding="1.5rem"
        blur="12px"
        brightness={1.1}
        glowColor="rgba(59, 130, 246, 0.2)"
        glowIntensity={6}
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius="1.5rem"
        className="bg-white/5"
      >
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />
              <div>
                <Skeleton className="h-5 w-32 bg-white/10 mb-1" />
                <Skeleton className="h-3 w-24 bg-white/10" />
              </div>
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded-xl bg-white/10 mb-4" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg bg-white/10" />
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  if (error || !weatherData) {
    return (
      <GlassCard
        padding="1.5rem"
        blur="12px"
        brightness={1.1}
        glowColor="rgba(239, 68, 68, 0.2)"
        glowIntensity={6}
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius="1.5rem"
        className="bg-white/5"
      >
        <div className="w-full flex flex-col items-center justify-center py-8 text-center">
          <CloudRain className="h-12 w-12 text-white/30 mb-3" />
          <p className="text-white/60 mb-2">Unable to load weather</p>
          <p className="text-sm text-white/40 mb-4">
            {error instanceof Error ? error.message : "Please try again"}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            className="border-white/20 text-white/70 hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </GlassCard>
    );
  }

  const todayForecast = weatherData.dailyForecasts[0];
  const upcomingForecasts = weatherData.dailyForecasts.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <GlassCard
        padding="1.5rem"
        blur="12px"
        brightness={1.1}
        glowColor="rgba(59, 130, 246, 0.2)"
        glowIntensity={6}
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius="1.5rem"
        className="bg-white/5"
      >
        <div className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-white">
                {cityName || "Unknown Location"}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onRefresh}
              className="h-8 w-8 p-0 text-white/50 hover:text-white hover:bg-white/10 rounded-lg"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Today's Weather - Main Card */}
          {todayForecast && (
            <div
              className={`relative overflow-hidden rounded-xl p-4 mb-4 bg-gradient-to-br ${getWeatherGradient(
                todayForecast.description
              )} border border-white/10`}
            >
              <div className="flex items-center justify-between">
                {/* Left - Temperature */}
                <div>
                  <p className="text-xs text-white/50 mb-1">Today</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-white">
                      {Math.round(todayForecast.temperature)}
                    </span>
                    <span className="text-2xl text-white/70">°C</span>
                  </div>
                  <p className="text-sm text-white/70 capitalize mt-1">
                    {todayForecast.description}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-white/50">
                    <Thermometer className="h-3 w-3" />
                    <span>
                      {Math.round(todayForecast.minTemperature)}° / {Math.round(todayForecast.maxTemperature)}°
                    </span>
                  </div>
                </div>

                {/* Right - Icon */}
                <div className="flex flex-col items-center">
                  <div className="relative w-20 h-20">
                    <Image
                      src={getWeatherIcon(todayForecast.description)}
                      alt={todayForecast.description}
                      fill
                      className="object-contain drop-shadow-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Weather Details */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-white/60">
                  <Droplets className="h-3.5 w-3.5 text-blue-400" />
                  <span>{todayForecast.humidity}%</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/60">
                  <Wind className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{todayForecast.wind.speed.value} {todayForecast.wind.speed.unit}</span>
                </div>
                {todayForecast.rain > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-white/60">
                    <CloudRain className="h-3.5 w-3.5 text-indigo-400" />
                    <span>{todayForecast.rain}mm</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Days Forecast */}
          {upcomingForecasts.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {upcomingForecasts.slice(1, 5).map((forecast, index) => (
                <motion.div
                  key={forecast.date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
                  className="flex flex-col items-center p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-xs text-white/50 mb-1">
                    {formatDayName(forecast.date, index + 1)}
                  </span>
                  <div className="relative w-8 h-8 my-1">
                    <Image
                      src={getWeatherIcon(forecast.description)}
                      alt={forecast.description}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {Math.round(forecast.temperature)}°
                  </span>
                  <span className="text-xs text-white/40">
                    {Math.round(forecast.minTemperature)}°
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
