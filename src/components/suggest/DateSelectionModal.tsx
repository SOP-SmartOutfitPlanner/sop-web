"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { format, addDays, startOfDay } from "date-fns";
import Image from "next/image";
import { useScrollLock } from "@/hooks/useScrollLock";
import { weatherAPI } from "@/lib/api/weather-api";
import { CalenderAPI } from "@/lib/api/calender-api";
import { DailyForecast } from "@/types/weather";

interface DateSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
  lat?: number;
  lng?: number;
}

interface DateWithWeather {
  date: Date;
  dayName: string;
  dayNumber: number;
  temperature?: number;
  weatherIcon?: string;
  isToday: boolean;
  hasOccasion?: boolean;
}

export function DateSelectionModal({
  open,
  onOpenChange,
  onDateSelect,
  selectedDate,
  lat,
  lng,
}: DateSelectionModalProps) {
  useScrollLock(open);
  
  const [dates, setDates] = useState<DateWithWeather[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

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

  // Load 16 days from today with weather data and occasions
  useEffect(() => {
    if (!open) return;

    const loadDatesWithWeatherAndOccasions = async () => {
      const today = startOfDay(new Date());
      const datesArray: DateWithWeather[] = [];
      
      // Generate 16 days from today
      for (let i = 0; i < 16; i++) {
        const date = addDays(today, i);
        datesArray.push({
          date,
          dayName: format(date, "EEE"),
          dayNumber: parseInt(format(date, "d")),
          isToday: i === 0,
          hasOccasion: false,
        });
      }
      
      setDates(datesArray);
      setIsLoadingWeather(true);

      try {
        // Load calendar entries for 16 days
        const startDate = format(today, "yyyy-MM-dd");
        const endDate = format(addDays(today, 15), "yyyy-MM-dd");
        
        const [weatherResponse, calendarResponse] = await Promise.all([
          lat && lng ? weatherAPI.getWeatherByCoordinates(lat, lng, 16) : Promise.resolve(null),
          CalenderAPI.getCalendarEntries({
            PageIndex: 1,
            PageSize: 100,
            takeAll: true,
            StartDate: startDate,
            EndDate: endDate,
          }),
        ]);

        // Process weather data
        if (weatherResponse?.statusCode === 200 && weatherResponse.data?.dailyForecasts) {
          const forecasts = weatherResponse.data.dailyForecasts;
          
          datesArray.forEach((dateItem, index) => {
            const forecast = forecasts[index] as DailyForecast | undefined;
            if (forecast) {
              dateItem.temperature = Math.round(forecast.temperature);
              dateItem.weatherIcon = getWeatherIcon(forecast.description);
            }
          });
        }

        // Mark dates with occasions
        if (calendarResponse?.statusCode === 200 && calendarResponse.data?.data) {
          const entries = calendarResponse.data.data;
          const occasionDates = new Set<string>();

          entries.forEach((entry) => {
            if (!entry.isDaily && entry.userOccasion?.dateOccasion) {
              const occasionDateObj = new Date(entry.userOccasion.dateOccasion);
              if (!isNaN(occasionDateObj.getTime())) {
                const occasionDateStr = format(occasionDateObj, "yyyy-MM-dd");
                occasionDates.add(occasionDateStr);
              }
            }
          });

          // Mark dates that have occasions
          datesArray.forEach((dateItem) => {
            const dateStr = format(dateItem.date, "yyyy-MM-dd");
            if (occasionDates.has(dateStr)) {
              dateItem.hasOccasion = true;
            }
          });
        }

        setDates([...datesArray]);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoadingWeather(false);
      }
    };

    loadDatesWithWeatherAndOccasions();
  }, [open, lat, lng]);

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
    onOpenChange(false);
  };

  if (!open) return null;

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/70 via-slate-900/60 to-black/70 backdrop-blur-md"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="relative bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-2xl rounded-3xl shadow-2xl border border-cyan-500/30 overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
          
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl opacity-50 -z-10" />
          
          {/* Header */}
          <div className="relative flex items-center justify-between p-8 border-b border-cyan-500/20 bg-gradient-to-r from-slate-900/50 to-slate-800/50">
            <div>
              <h2 className="text-3xl font-bricolage font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent mb-1">
                Select Date
              </h2>
              <p className="text-sm text-gray-400">Choose a date to generate outfit suggestions</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
                <span>Dates with planned occasions</span>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="group p-2.5 hover:bg-cyan-500/20 rounded-xl transition-all duration-200 border border-transparent hover:border-cyan-500/30"
            >
              <X className="w-6 h-6 text-gray-400 group-hover:text-cyan-300 transition-colors" />
            </button>
          </div>

          {/* Content */}
          <div className="relative p-8">
            {isLoadingWeather && (
              <div className="flex items-center justify-center gap-2 text-sm text-cyan-300 mb-6 animate-pulse">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>Loading weather data...</span>
              </div>
            )}
            
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {dates.map((dateItem) => {
                const isSelected = format(dateItem.date, "yyyy-MM-dd") === selectedDateStr;
                
                return (
                  <button
                    key={dateItem.date.toISOString()}
                    onClick={() => handleDateClick(dateItem.date)}
                    className={`
                      group relative p-5 rounded-2xl border transition-all duration-300 transform
                      ${isSelected 
                        ? "border-cyan-400 bg-gradient-to-br from-cyan-600/30 via-blue-600/20 to-indigo-600/30 shadow-xl shadow-cyan-500/30 scale-105 ring-2 ring-cyan-400/50" 
                        : "border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-700/60 hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 active:scale-95"
                      }
                    `}
                  >
                    {/* Occasion indicator */}
                    {dateItem.hasOccasion && (
                      <div className="absolute top-2 right-2 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50 animate-pulse" />
                      </div>
                    )}

                    {/* Glow on hover/selected */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur animate-pulse" />
                    )}
                    
                    <div className="relative flex flex-col items-center gap-2.5">
                      {/* Day name */}
                      <div className={`text-xs font-semibold uppercase tracking-wider ${isSelected ? "text-cyan-300" : "text-gray-400 group-hover:text-cyan-400"} transition-colors`}>
                        {dateItem.dayName}
                      </div>
                      
                      {/* Day number */}
                      <div className={`text-3xl font-bold tabular-nums ${isSelected ? "bg-gradient-to-br from-cyan-200 via-blue-200 to-indigo-200 bg-clip-text text-transparent" : "text-white group-hover:text-cyan-100"} transition-colors`}>
                        {dateItem.dayNumber}
                      </div>
                      
                      {/* Weather icon */}
                      {dateItem.weatherIcon && (
                        <div className="w-12 h-12 flex items-center justify-center my-1">
                          <Image
                            src={dateItem.weatherIcon}
                            alt="Weather"
                            width={48}
                            height={48}
                            className="drop-shadow-lg group-hover:scale-110 transition-transform"
                          />
                        </div>
                      )}
                      
                      {/* Temperature */}
                      {dateItem.temperature && (
                        <div className={`text-base font-semibold ${isSelected ? "text-cyan-300" : "text-gray-300 group-hover:text-cyan-400"} transition-colors`}>
                          {dateItem.temperature}°
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
