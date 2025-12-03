"use client";

import Image from "next/image";
import GlassCard from "@/components/ui/glass-card";
import { DailyForecast } from "@/types/weather";

interface SimpleWeatherCardProps {
  forecast: DailyForecast;
  cityName?: string;
}

export function SimpleWeatherCard({ forecast }: SimpleWeatherCardProps) {
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

  return (
    <GlassCard
      padding="1.5rem"
      borderRadius="20px"
      blur="12px"
      brightness={1.05}
      className="bg-gradient-to-br from-amber-200/40 via-yellow-100/30 to-orange-200/40"
    >
      <div className="flex items-center justify-between">
        {/* Left side - Temperature and condition */}
        <div className="flex-1">
          <div className="text-4xl font-bold text-gray-800 mb-1">
            {Math.round(forecast.temperature)}°C
          </div>
          <p className="text-gray-600 text-sm font-medium capitalize">
            {forecast.description}
          </p>
        </div>

        {/* Right side - Weather icon */}
        <div className="w-16 h-16 flex items-center justify-center">
          <Image
            src={getWeatherIcon(forecast.description)}
            alt={forecast.description}
            width={64}
            height={64}
            className="drop-shadow-lg"
          />
        </div>
      </div>
    </GlassCard>
  );
}
