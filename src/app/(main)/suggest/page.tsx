"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Sparkles, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { TimePicker, ConfigProvider } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { format } from "date-fns";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";

import { UserOccasionList, SelectedOccasionData } from "@/components/suggest/UserOccasionList";
import {
  OutfitConfigPanel,
  OutfitConfig,
} from "@/components/suggest/OutfitConfigPanel";
import { WeatherSkeleton } from "@/components/suggest/WeatherSkeleton";
import { SuggestionResultView } from "@/components/suggest/SuggestionResultView";
import LocationMapModal from "@/components/suggest/LocationMapModal";
import { BodyImageUpload } from "@/components/suggest/BodyImageUpload";
import { useWeather } from "@/hooks/useWeather";
import { weatherAPI } from "@/lib/api/weather-api";
import { outfitAPI } from "@/lib/api/outfit-api";
import { DailyForecast, HourlyForecast } from "@/types/weather";
import { SuggestedItem } from "@/types/outfit";
import { toast } from "sonner";

interface OutfitSuggestion {
  suggestedItems: SuggestedItem[];
  reason: string;
}

interface TryOnResult {
  success: boolean;
  url: string | null;
  error: string | null;
}

export default function SuggestPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [selectedDate] = useState(new Date()); // Fixed to today, no longer changeable
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedOccasionId, setSelectedOccasionId] = useState<number | null>(
    null
  );
  const [selectedOccasionData, setSelectedOccasionData] = useState<SelectedOccasionData | null>(null);
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(dayjs()); // Default to current time
  const [isSuggestingOutfit, setIsSuggestingOutfit] = useState(false);
  const [suggestionResults, setSuggestionResults] = useState<
    OutfitSuggestion[]
  >([]);

  // Virtual Try-On states
  const [bodyImageUrl, setBodyImageUrl] = useState<string | null>(null);
  const [tryOnResults, setTryOnResults] = useState<(TryOnResult | null)[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Carousel state
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);

  // Store refetch function from UserOccasionList
  const refetchOccasionsRef = useRef<(() => void) | null>(null);

  const handleRefetchReady = useCallback((refetchFn: () => void) => {
    refetchOccasionsRef.current = refetchFn;
  }, []);

  const handleOutfitUsed = useCallback(() => {
    if (refetchOccasionsRef.current) {
      refetchOccasionsRef.current();
    }
  }, []);

  // Location state
  const [customLocation, setCustomLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  // Weather state
  const {
    todayForecast: currentLocationForecast,
    cityName: currentCityName,
    coordinates: currentCoordinates,
    isLoading: isLoadingCurrentWeather,
  } = useWeather();

  const [customWeather, setCustomWeather] = useState<{
    forecast: DailyForecast;
    cityName: string;
  } | null>(null);
  const [isLoadingCustomWeather, setIsLoadingCustomWeather] = useState(false);

  // Occasion-based weather (using time-specific API)
  const [occasionWeather, setOccasionWeather] = useState<{
    forecast: HourlyForecast;
    cityName: string;
  } | null>(null);
  const [isLoadingOccasionWeather, setIsLoadingOccasionWeather] = useState(false);

  // Determine which weather to display (priority: occasion > custom > current)
  const displayWeather = occasionWeather?.forecast || customWeather?.forecast || currentLocationForecast;
  const displayCityName = occasionWeather?.cityName || customWeather?.cityName || currentCityName;

  // Check authentication
  useEffect(() => {
    if (isInitialized) {
      if (!user) {
        router.push("/login");
      } else {
        setIsCheckingAuth(false);
      }
    }
  }, [user, isInitialized, router]);

  // Helper to build ISO datetime from time
  const buildDateTimeFromTime = (time: Dayjs | null): string => {
    const today = format(selectedDate, "yyyy-MM-dd");
    if (!time) {
      return `${today}T${format(new Date(), "HH:mm:ss")}`;
    }
    return `${today}T${time.format("HH:mm:ss")}`;
  };

  // Helper to extract time string (HH:mm:ss) from various formats
  const extractTimeString = (timeStr: string): string => {
    if (!timeStr) return "00:00:00";
    // If it's a full datetime string like "2024-12-18T20:05:00", extract time part
    if (timeStr.includes("T")) {
      return timeStr.split("T")[1];
    }
    // Already in HH:mm:ss format
    return timeStr;
  };

  // Helper to parse time string to dayjs object
  const parseTimeToDayjs = (timeStr: string): Dayjs => {
    const timeOnly = extractTimeString(timeStr);
    return dayjs(timeOnly, "HH:mm:ss");
  };

  // Helper to build ISO datetime from occasion date and time
  const buildOccasionDateTime = (dateOccasion: string, startTime: string): string => {
    // dateOccasion format: "yyyy-MM-dd" or "yyyy-MM-ddT00:00:00"
    // startTime format: "HH:mm:ss" or "yyyy-MM-ddTHH:mm:ss"

    // Extract date part
    const datePart = dateOccasion.includes("T")
      ? dateOccasion.split("T")[0]
      : dateOccasion;

    // Extract time part
    const timePart = extractTimeString(startTime);

    return `${datePart}T${timePart}`;
  };

  // Handle time selection - fetch weather for selected time
  const handleTimeChange = async (time: Dayjs | null) => {
    setSelectedTime(time);

    // Clear occasion selection when manually picking time
    if (selectedOccasionId) {
      setSelectedOccasionId(null);
      setSelectedOccasionData(null);
    }

    if (!time) {
      setOccasionWeather(null);
      return;
    }

    // Get coordinates to use (custom location or current)
    const coords = customLocation
      ? { latitude: customLocation.lat, longitude: customLocation.lng }
      : currentCoordinates;

    if (!coords) {
      return;
    }

    setIsLoadingOccasionWeather(true);

    try {
      const targetTime = buildDateTimeFromTime(time);
      const response = await weatherAPI.getWeatherDetailsByCoordinates(
        coords.latitude,
        coords.longitude,
        targetTime
      );

      if (response.statusCode === 200 && response.data) {
        const hourlyForecast = response.data.hourlyForecasts?.[0];
        if (hourlyForecast) {
          setOccasionWeather({
            forecast: hourlyForecast,
            cityName: response.data.cityName || displayCityName || "Current Location",
          });
        }
      }
    } catch (error) {
      console.error("Failed to load weather for selected time:", error);
      toast.error("Failed to load weather for selected time. Time must be within 5 days.");
      setOccasionWeather(null);
    } finally {
      setIsLoadingOccasionWeather(false);
    }
  };

  // Load weather for custom location
  const handleLocationSelect = async (
    lat: number,
    lng: number,
    address: string
  ) => {
    setCustomLocation({ lat, lng, address });
    setIsLoadingCustomWeather(true);
    // Clear occasion weather when location changes
    setOccasionWeather(null);

    try {
      // If we have a selected occasion or selected time, fetch weather for that specific time
      if (selectedOccasionData) {
        const occasionTime = buildOccasionDateTime(selectedOccasionData.dateOccasion, selectedOccasionData.startTime);
        const response = await weatherAPI.getWeatherDetailsByCoordinates(lat, lng, occasionTime);

        if (response.statusCode === 200 && response.data) {
          const hourlyForecast = response.data.hourlyForecasts?.[0];
          if (hourlyForecast) {
            setOccasionWeather({
              forecast: hourlyForecast,
              cityName: response.data.cityName || address.split(",")[0] || "Selected Location",
            });
          }
        }
      } else if (selectedTime) {
        // Use selected time for weather fetch
        const targetTime = buildDateTimeFromTime(selectedTime);
        const response = await weatherAPI.getWeatherDetailsByCoordinates(lat, lng, targetTime);

        if (response.statusCode === 200 && response.data) {
          const hourlyForecast = response.data.hourlyForecasts?.[0];
          if (hourlyForecast) {
            setOccasionWeather({
              forecast: hourlyForecast,
              cityName: response.data.cityName || address.split(",")[0] || "Selected Location",
            });
          }
        }
      } else {
        // No time selected, use regular weather API
        const response = await weatherAPI.getWeatherByCoordinates(lat, lng, 1);

        if (response.statusCode === 200 && response.data) {
          const todayForecast = response.data.dailyForecasts?.[0] as
            | DailyForecast
            | undefined;

          if (todayForecast) {
            setCustomWeather({
              forecast: todayForecast,
              cityName: address.split(",")[0] || "Selected Location",
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to load weather:", error);
      toast.error("Failed to load weather for selected location");
    } finally {
      setIsLoadingCustomWeather(false);
    }
  };

  // Handle occasion selection - fetch weather for occasion time
  const handleOccasionSelect = async (occasionId: number | null, occasionData?: SelectedOccasionData) => {
    setSelectedOccasionId(occasionId);
    setSelectedOccasionData(occasionData || null);

    if (!occasionId || !occasionData) {
      // Occasion deselected, clear occasion weather and reset time
      setOccasionWeather(null);
      setSelectedTime(dayjs()); // Reset to current time
      return;
    }

    // Update selected time to occasion start time
    setSelectedTime(parseTimeToDayjs(occasionData.startTime));

    // Get coordinates to use (custom location or current)
    const coords = customLocation
      ? { latitude: customLocation.lat, longitude: customLocation.lng }
      : currentCoordinates;

    if (!coords) {
      return;
    }

    setIsLoadingOccasionWeather(true);

    try {
      const occasionTime = buildOccasionDateTime(occasionData.dateOccasion, occasionData.startTime);
      const response = await weatherAPI.getWeatherDetailsByCoordinates(
        coords.latitude,
        coords.longitude,
        occasionTime
      );

      if (response.statusCode === 200 && response.data) {
        const hourlyForecast = response.data.hourlyForecasts?.[0];
        if (hourlyForecast) {
          setOccasionWeather({
            forecast: hourlyForecast,
            cityName: response.data.cityName || displayCityName || "Current Location",
          });
        }
      }
    } catch (error) {
      console.error("Failed to load weather for occasion time:", error);
      // Don't show error toast, just use existing weather
    } finally {
      setIsLoadingOccasionWeather(false);
    }
  };

  // Generate outfit suggestions
  const handleGenerateOutfit = async (config: OutfitConfig) => {
    if (!user) return;

    setIsSuggestingOutfit(true);
    setSuggestionResults([]);
    setCurrentOutfitIndex(0);

    try {
      // Format weather string
      let weatherString: string | undefined;
      if (displayWeather) {
        weatherString = `${displayWeather.description}, ${Math.round(
          displayWeather.temperature
        )}°C`;
      }

      // Format target date
      const targetDate = format(selectedDate, "yyyy-MM-dd");

      // Call API
      const response = await outfitAPI.getSuggestionV2(
        Number(user.id),
        config.totalOutfit,
        config.gapDay,
        targetDate,
        undefined, // occasionId (system occasion)
        selectedOccasionId || undefined, // userOccasionId
        weatherString
      );

      if (response.statusCode === 200 && response.data) {
        setSuggestionResults(response.data);
        setTryOnResults(new Array(response.data.length).fill(null));
        toast.success(`Generated ${response.data.length} outfit suggestions!`);
      }
    } catch (error) {
      console.error("Failed to generate outfit:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate outfit suggestions"
      );
    } finally {
      setIsSuggestingOutfit(false);
    }
  };

  // Handle individual try-on for a specific outfit
  const handleIndividualTryOn = useCallback(
    async (outfitIndex: number) => {
      if (!bodyImageUrl) {
        toast.error("Please upload your full body photo first");
        return;
      }

      const outfit = suggestionResults[outfitIndex];
      if (!outfit) return;

      const loadingToast = toast.loading("Generating virtual try-on...");

      try {
        // Get clothing URLs from the outfit items
        const clothingUrls = outfit.suggestedItems
          .map((item) => item.imgUrl)
          .filter((url): url is string => !!url);

        if (clothingUrls.length === 0) {
          throw new Error("No valid item images found");
        }

        // Call individual virtual try-on API
        const response = await outfitAPI.virtualTryOn(
          // Convert URL to File (we'll need to fetch it)
          await urlToFile(bodyImageUrl, "body-image.jpg"),
          clothingUrls
        );

        if (response.statusCode === 200 && response.data?.url) {
          // Update try-on result for this outfit
          setTryOnResults((prev) => {
            const newResults = [...prev];
            newResults[outfitIndex] = {
              success: true,
              url: response.data.url,
              error: null,
            };
            return newResults;
          });
          toast.success("Virtual try-on generated successfully!", {
            id: loadingToast,
          });
        }
      } catch (error) {
        console.error("Try-on error:", error);
        setTryOnResults((prev) => {
          const newResults = [...prev];
          newResults[outfitIndex] = {
            success: false,
            url: null,
            error:
              error instanceof Error
                ? error.message
                : "Failed to generate try-on",
          };
          return newResults;
        });
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to generate virtual try-on",
          { id: loadingToast }
        );
      }
    },
    [bodyImageUrl, suggestionResults]
  );

  // Handle batch try-on for all outfits
  const handleBatchTryOn = useCallback(async () => {
    if (!bodyImageUrl) {
      toast.error("Please upload your full body photo first");
      return;
    }

    if (suggestionResults.length === 0) {
      toast.error("No outfits to try on");
      return;
    }

    setIsBatchProcessing(true);
    const loadingToast = toast.loading(
      `Processing ${suggestionResults.length} outfits...`
    );

    try {
      // Build batch request
      const items = suggestionResults.map((outfit, index) => ({
        uuid: index + 1,
        human_image_url: bodyImageUrl,
        clothing_urls: outfit.suggestedItems
          .map((item) => item.imgUrl)
          .filter((url): url is string => !!url),
      }));

      // Call batch API
      const response = await outfitAPI.batchVirtualTryOn(items);

      if (response.statusCode === 200 && response.data) {
        // Update try-on results
        const newResults = suggestionResults.map((_, index) => {
          const result = response.data.results.find(
            (r) => r.uuid === index + 1
          );
          return result
            ? {
                success: result.success,
                url: result.url,
                error: result.error,
              }
            : null;
        });
        setTryOnResults(newResults);

        const successCount = response.data.results.filter(
          (r) => r.success
        ).length;
        toast.success(
          `Batch processing complete! ${successCount}/${response.data.results.length} successful`,
          { id: loadingToast }
        );
      }
    } catch (error) {
      console.error("Batch try-on error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to process batch try-on",
        { id: loadingToast }
      );
    } finally {
      setIsBatchProcessing(false);
    }
  }, [bodyImageUrl, suggestionResults]);

  // Helper function to convert URL to File
  const urlToFile = async (url: string, filename: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-cyan-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Title Section */}
        <div className="text-center mb-10">
          <h1 className="font-bricolage text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
              What to wear today?
            </span>
          </h1>
          <p className="mt-3 text-gray-300 text-lg font-poppins">
            Get personalized outfit suggestions based on your schedule and
            weather
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* LEFT PANEL - 3/10 */}
          <div className="lg:col-span-3 space-y-6">
            {/* Selected Date Card with Weather */}
            <GlassCard
              padding="1.5rem"
              blur="16px"
              brightness={0.95}
              glowColor="rgba(6, 182, 212, 0.4)"
              borderColor="rgba(34, 211, 238, 0.3)"
              borderWidth="1px"
              className="bg-gradient-to-br from-cyan-950/40 via-blue-900/30 to-indigo-950/40"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bricolage font-semibold text-white">
                    Today
                  </h3>
                  <div className="p-2">
                    <Calendar className="w-5 h-5 text-cyan-300" />
                  </div>
                </div>

                <div className="text-center bg-gradient-to-br from-cyan-500/20 via-blue-500/15 to-indigo-500/20 backdrop-blur-sm rounded-xl p-4 border border-cyan-400/30 shadow-lg shadow-cyan-500/10">
                  <div className="text-sm text-cyan-300 font-medium mb-1">
                    {format(selectedDate, "EEEE")}
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
                    {format(selectedDate, "MMM d")}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center justify-between pt-2 border-cyan-400/20">
                  <div className="flex items-center gap-2 text-sm text-gray-200">
                    <MapPin className="w-8 h-8 text-cyan-300" />
                    <span className="font-medium">
                      {customLocation
                        ? customLocation.address
                        : displayCityName}
                    </span>
                  </div>
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    className="p-2 px-3"
                    onClick={() => setIsLocationModalOpen(true)}
                  >
                    Change
                  </GlassButton>
                </div>

                {/* Time Picker for Weather */}
                <div className="pt-3 border-t border-cyan-400/20 mt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-200">
                      <Clock className="w-5 h-5 text-cyan-300" />
                      <span className="font-medium">Weather Time</span>
                    </div>
                    <ConfigProvider
                      theme={{
                        components: {
                          DatePicker: {
                            colorBgContainer: "#1e293b",
                            colorBgElevated: "#1e293b",
                            colorText: "#fff",
                            colorTextPlaceholder: "#94a3b8",
                            colorBorder: "#475569",
                            colorPrimary: "#22d3ee",
                            colorTextDisabled: "#94a3b8",
                            colorBgContainerDisabled: "#334155",
                          },
                        },
                      }}
                    >
                      <TimePicker
                        value={selectedOccasionData ? parseTimeToDayjs(selectedOccasionData.startTime) : selectedTime}
                        onChange={handleTimeChange}
                        format="HH:mm"
                        placeholder={selectedOccasionData ? parseTimeToDayjs(selectedOccasionData.startTime).format("HH:mm") : "Select time"}
                        disabled={isLoadingOccasionWeather || !!selectedOccasionData}
                        allowClear={!selectedOccasionData}
                      />
                    </ConfigProvider>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {selectedOccasionData
                      ? `${selectedOccasionData.name} - ${dayjs(selectedOccasionData.dateOccasion).format("MMM D")} at ${parseTimeToDayjs(selectedOccasionData.startTime).format("HH:mm")}`
                      : "Pick a time to see weather forecast (max 5 days ahead)"
                    }
                  </p>
                </div>

                {/* Weather Section */}
                <div className="pt-4 border-cyan-400/20">
                  {isLoadingCurrentWeather || isLoadingCustomWeather || isLoadingOccasionWeather ? (
                    <WeatherSkeleton />
                  ) : displayWeather ? (
                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-slate-600/30 shadow-xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
                      <div className="relative flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-5xl font-bold bg-gradient-to-br from-white to-gray-200 bg-clip-text text-transparent mb-2">
                            {Math.round(displayWeather.temperature)}°C
                          </div>
                          <p className="text-gray-300 text-sm font-medium capitalize flex items-center gap-2">
                            {displayWeather.description}
                          </p>
                        </div>
                        <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl backdrop-blur-sm">
                          <Image
                            src={(() => {
                              const desc =
                                displayWeather.description.toLowerCase();
                              if (
                                desc.includes("thunder") ||
                                desc.includes("storm")
                              )
                                return "/icon/stormy-weather-50.png";
                              if (
                                desc.includes("heavy") ||
                                desc.includes("pour")
                              )
                                return "/icon/rainfall-50.png";
                              if (
                                desc.includes("rain") ||
                                desc.includes("drizzle")
                              )
                                return "/icon/moderate-rain-50.png";
                              if (desc.includes("wind"))
                                return "/icon/windy-weather-50.png";
                              if (
                                desc.includes("clear") ||
                                desc.includes("sunny")
                              )
                                return "/icon/sun-50.png";
                              if (
                                desc.includes("partly") ||
                                desc.includes("scattered")
                              )
                                return "/icon/partly-cloudy-day-50.png";
                              return "/icon/clouds-50.png";
                            })()}
                            alt={displayWeather.description}
                            width={64}
                            height={64}
                            className="drop-shadow-lg"
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </GlassCard>

            {/* User Occasions */}
            <div>
              <UserOccasionList
                selectedDate={selectedDate}
                onOccasionSelect={handleOccasionSelect}
                selectedOccasionId={selectedOccasionId}
                onRefetchReady={handleRefetchReady}
              />
            </div>

            {/* Body Image Upload - For Virtual Try-On */}
            <GlassCard
              padding="1.5rem"
              blur="16px"
              brightness={0.95}
              glowColor="rgba(6, 182, 212, 0.4)"
              borderColor="rgba(34, 211, 238, 0.3)"
              borderWidth="1px"
              className="bg-gradient-to-br from-cyan-950/40 via-blue-900/30 to-indigo-950/40"
            >
              <BodyImageUpload
                imageUrl={bodyImageUrl}
                onImageUrlChange={setBodyImageUrl}
              />
            </GlassCard>
          </div>

          {/* RIGHT PANEL - 7/10 */}
          <div className="lg:col-span-7 space-y-6">
            {/* Outfit Config Panel */}
            <OutfitConfigPanel
              onGenerate={handleGenerateOutfit}
              isGenerating={isSuggestingOutfit}
              isWeatherLoading={
                isLoadingCurrentWeather || isLoadingCustomWeather || isLoadingOccasionWeather
              }
            />

            {/* Suggestions Results - Carousel */}
            {suggestionResults.length > 0 && (
              <div className="space-y-4">
                {/* Header with Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-bricolage font-bold bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200 bg-clip-text text-transparent">
                      Your Suggestions
                    </h3>

                    {/* Carousel Navigation */}
                    {suggestionResults.length > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentOutfitIndex((prev) => Math.max(0, prev - 1))}
                          disabled={currentOutfitIndex === 0}
                          className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/20"
                        >
                          <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <span className="text-white font-medium px-3 py-1 rounded-full bg-white/10 border border-white/20 min-w-[80px] text-center">
                          {currentOutfitIndex + 1} / {suggestionResults.length}
                        </span>
                        <button
                          onClick={() => setCurrentOutfitIndex((prev) => Math.min(suggestionResults.length - 1, prev + 1))}
                          disabled={currentOutfitIndex === suggestionResults.length - 1}
                          className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/20"
                        >
                          <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Batch Virtual Try-On Button */}
                  {bodyImageUrl && suggestionResults.length > 0 && (
                    <GlassButton
                      variant="custom"
                      size="md"
                      onClick={handleBatchTryOn}
                      disabled={isBatchProcessing}
                      backgroundColor="rgba(236, 72, 153, 0.25)"
                      borderColor="rgba(244, 114, 182, 0.5)"
                      borderWidth="2px"
                      glowColor="rgba(236, 72, 153, 0.4)"
                      glowIntensity={12}
                      className="font-poppins font-semibold hover:bg-pink-500/30 transition-all"
                    >
                      {isBatchProcessing && (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      )}
                      <Sparkles className="w-5 h-5 mr-2" />
                      {isBatchProcessing
                        ? "Processing..."
                        : "Visualize All Outfits"}
                    </GlassButton>
                  )}
                </div>

                {/* Dot Indicators */}
                {suggestionResults.length > 1 && (
                  <div className="flex justify-center gap-2">
                    {suggestionResults.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentOutfitIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          index === currentOutfitIndex
                            ? "bg-cyan-400 w-8"
                            : "bg-white/30 hover:bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Carousel Content */}
                <div className="relative overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentOutfitIndex * 100}%)` }}
                  >
                    {suggestionResults.map((suggestion, index) => (
                      <div key={index} className="w-full flex-shrink-0 px-1">
                        <h4 className="text-xl font-bricolage font-bold text-white mb-4">
                          Outfit {index + 1}
                        </h4>
                        <SuggestionResultView
                          items={suggestion.suggestedItems}
                          reason={suggestion.reason}
                          selectedDate={selectedDate}
                          selectedOccasionId={selectedOccasionId}
                          onOutfitUsed={handleOutfitUsed}
                          bodyImageUrl={bodyImageUrl}
                          outfitIndex={index}
                          tryOnResult={tryOnResults[index] || undefined}
                          onTryOn={handleIndividualTryOn}
                          isBatchProcessing={isBatchProcessing}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {suggestionResults.length === 0 && !isSuggestingOutfit && (
              <GlassCard
                padding="3rem"
                blur="16px"
                brightness={0.95}
                glowColor="rgba(6, 182, 212, 0.3)"
                className="text-center bg-gradient-to-br from-cyan-950/30 via-blue-900/20 to-indigo-950/30 mt-10"
              >
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 backdrop-blur-sm flex items-center justify-center border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/20">
                    <Calendar className="w-10 h-10 text-cyan-200" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bricolage font-bold bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200 bg-clip-text text-transparent mb-2">
                      Ready to Generate Outfits
                    </h4>
                    <p className="text-gray-300">
                      Configure your preferences and click generate to get
                      AI-powered outfit suggestions
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Modals */}
        <LocationMapModal
          open={isLocationModalOpen}
          onOpenChange={setIsLocationModalOpen}
          onLocationSelect={handleLocationSelect}
          initialLocation={customLocation || undefined}
        />
      </div>
    </div>
  );
}
