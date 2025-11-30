"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MapPin, AlertCircle, Sparkles, Loader2, Check, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Radio, Select, Checkbox, Tabs, Carousel } from "antd";
import type { CarouselRef } from "antd/es/carousel";
import { useAuthStore } from "@/store/auth-store";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";
import { useWeather } from "@/hooks/useWeather";
import { WeatherCard } from "@/components/suggest/WeatherCard";
import { SuggestionResultView } from "@/components/suggest/SuggestionResultView";
import LocationMapModal from "@/components/suggest/LocationMapModal";
import { weatherAPI } from "@/lib/api/weather-api";
import { outfitAPI } from "@/lib/api/outfit-api";
import { adminAPI } from "@/lib/api/admin-api";
import { DailyForecast } from "@/types/weather";
import { SuggestedItem } from "@/types/outfit";
import { Occasion } from "@/types/occasion";
import { toast } from "sonner";

type WeatherTab = "my-location" | "selected-location";

interface OutfitSuggestion {
  suggestedItems: SuggestedItem[];
  reason: string;
}

export default function SuggestPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<WeatherTab>("my-location");
  const [customWeather, setCustomWeather] = useState<{
    forecast: DailyForecast;
    cityName: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoadingCustomWeather, setIsLoadingCustomWeather] = useState(false);
  const [isSuggestingOutfit, setIsSuggestingOutfit] = useState(false);
  const [suggestionResults, setSuggestionResults] = useState<OutfitSuggestion[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [selectedOccasionId, setSelectedOccasionId] = useState<number | undefined>(undefined);
  const [isLoadingOccasions, setIsLoadingOccasions] = useState(false);
  const [totalOutfit, setTotalOutfit] = useState<number>(1);
  const [selectedOutfitIndexes, setSelectedOutfitIndexes] = useState<number[]>([]);
  const [isAddingMultiple, setIsAddingMultiple] = useState(false);
  const [extendedForecast, setExtendedForecast] = useState<DailyForecast[]>([]);
  const [isLoadingExtendedForecast, setIsLoadingExtendedForecast] = useState(false);
  const [selectedForecastDay, setSelectedForecastDay] = useState<DailyForecast | null>(null);
  const carouselRef = useRef<CarouselRef>(null);
  const hasAutoSelectedTomorrow = useRef(false);
  // Occasion section location state
  const [isOccasionLocationModalOpen, setIsOccasionLocationModalOpen] = useState(false);
  const [occasionLocationTab, setOccasionLocationTab] = useState<WeatherTab>("my-location");
  const [occasionLocation, setOccasionLocation] = useState<{
    lat: number;
    lng: number;
    cityName: string;
  } | null>(null);
  const { isAuthenticated, user } = useAuthStore();

  // Weather hook (handles browser geolocation with user profile fallback)
  const {
    todayForecast,
    cityName,
    coordinates: userCoordinates,
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

  // Fetch occasions on component mount
  useEffect(() => {
    const fetchOccasions = async () => {
      setIsLoadingOccasions(true);
      try {
        const response = await adminAPI.getOccasions({
          PageIndex: 1,
          PageSize: 100,
          takeAll: true,
        });
        if (response.statusCode === 200) {
          setOccasions(response.data.data);
        }
      } catch {
        // Error fetching occasions
      } finally {
        setIsLoadingOccasions(false);
      }
    };

    fetchOccasions();
  }, []);

  // Fetch 16-day extended forecast based on occasionLocationTab and occasionLocation
  // Uses userCoordinates from useWeather hook which handles browser geolocation with user profile fallback
  useEffect(() => {
    const fetchExtendedForecast = async () => {
      let lat: number;
      let lng: number;

      if (occasionLocationTab === "selected-location" && occasionLocation) {
        // Use selected occasion location
        lat = occasionLocation.lat;
        lng = occasionLocation.lng;
      } else if (userCoordinates) {
        // Use coordinates from useWeather hook (browser location or user profile fallback)
        lat = userCoordinates.latitude;
        lng = userCoordinates.longitude;
      } else {
        // No coordinates available yet, wait for useWeather to resolve
        return;
      }

      setIsLoadingExtendedForecast(true);
      try {
        const response = await weatherAPI.getWeatherByCoordinates(lat, lng, 16);
        if (response.statusCode === 200 && response.data.dailyForecasts.length > 0) {
          const forecasts = response.data.dailyForecasts;
          setExtendedForecast(forecasts);

          // Auto-select tomorrow's forecast as default
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const tomorrowForecast = forecasts.find((forecast) => {
            const forecastDate = new Date(forecast.date);
            return forecastDate.toDateString() === tomorrow.toDateString();
          });

          if (tomorrowForecast && !hasAutoSelectedTomorrow.current) {
            setSelectedForecastDay(tomorrowForecast);
            hasAutoSelectedTomorrow.current = true;
          }
        }
      } catch {
        // If location fails, we'll show a message to select location
      } finally {
        setIsLoadingExtendedForecast(false);
      }
    };

    fetchExtendedForecast();
  }, [occasionLocation, occasionLocationTab, userCoordinates]);

  // Handler to suggest outfit based on current weather
  const handleSuggestOutfit = async () => {
    // Determine which weather to use
    const activeWeather = activeTab === "selected-location" && customWeather
      ? customWeather.forecast
      : todayForecast;

    setIsSuggestingOutfit(true);

    // Sequential loading toasts with timeout IDs for cleanup
    const toast1 = toast.loading("Looking through your wardrobe…");
    let isRequestCompleted = false;

    const timeout1 = setTimeout(() => {
      if (!isRequestCompleted) {
        toast.loading("Finding what suits today best…", { id: toast1 });
      }
    }, 4000);

    const timeout2 = setTimeout(() => {
      if (!isRequestCompleted) {
        toast.loading("Your outfit is almost ready…", { id: toast1 });
      }
    }, 8000);

    try {
      const userId = parseInt(user?.id || "0");

      const weatherString = activeWeather
        ? `${activeWeather.description}, Temperature: ${activeWeather.temperature}°C, Feels like: ${activeWeather.feelsLike}°C`
        : undefined;

      const response = await outfitAPI.getSuggestionV2(
        userId,
        totalOutfit,
        selectedOccasionId,
        weatherString
      );

      isRequestCompleted = true;
      clearTimeout(timeout1);
      clearTimeout(timeout2);

      setSuggestionResults(response.data);

      toast.success("Outfit suggestions generated!", { id: toast1 });

      // Scroll to results
      setTimeout(() => {
        document.getElementById("suggestion-results")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 100);
    } catch (error) {
      isRequestCompleted = true;
      clearTimeout(timeout1);
      clearTimeout(timeout2);

      // Extract error message from API response
      let errorMessage = "Failed to generate outfit suggestions";
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { id: toast1, duration: 6000 });
    } finally {
      setIsSuggestingOutfit(false);
    }
  };

  const handleCloseResults = () => {
    setSuggestionResults([]);
    setSelectedOutfitIndexes([]);
  };

  // Toggle outfit selection
  const handleToggleOutfitSelection = (index: number) => {
    setSelectedOutfitIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  // Select/Deselect all outfits
  const handleSelectAll = () => {
    if (selectedOutfitIndexes.length === suggestionResults.length) {
      setSelectedOutfitIndexes([]);
    } else {
      setSelectedOutfitIndexes(suggestionResults.map((_, index) => index));
    }
  };

  // Add selected outfits using mass create API
  const handleAddSelectedOutfits = async () => {
    if (selectedOutfitIndexes.length === 0) {
      toast.error("Please select at least one outfit");
      return;
    }

    setIsAddingMultiple(true);
    const loadingToast = toast.loading(`Adding ${selectedOutfitIndexes.length} outfit(s)...`);

    try {
      const outfitsToCreate = selectedOutfitIndexes.map((index) => {
        const suggestion = suggestionResults[index];
        return {
          name: `AI Suggested Outfit ${index + 1} - ${new Date().toLocaleDateString()}`,
          description: suggestion.reason,
          itemIds: suggestion.suggestedItems.map((item) => item.id),
        };
      });

      const response = await outfitAPI.massCreateOutfits(outfitsToCreate);

      if (response.data.totalFailed === 0) {
        toast.success(`Successfully added ${response.data.totalCreated} outfit(s)!`, { id: loadingToast });
        setSelectedOutfitIndexes([]);
      } else if (response.data.totalCreated > 0) {
        // Partial success - show warning with error details
        const errorMessages = response.data.failedOutfits
          .map((f) => `${f.name}: ${f.error}`)
          .join("\n");
        toast.warning(
          `Added ${response.data.totalCreated} outfit(s), ${response.data.totalFailed} failed:\n${errorMessages}`,
          { id: loadingToast, duration: 8000 }
        );
        setSelectedOutfitIndexes([]);
      } else {
        // All failed - show error with details
        const errorMessages = response.data.failedOutfits
          .map((f) => `${f.name}: ${f.error}`)
          .join("\n");
        toast.error(`Failed to add outfits:\n${errorMessages}`, { id: loadingToast, duration: 8000 });
      }
    } catch (error) {
      console.error("Error adding multiple outfits:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add outfits",
        { id: loadingToast }
      );
    } finally {
      setIsAddingMultiple(false);
    }
  };


  // Get weather icon for carousel cards
  const getWeatherIcon = (description: string, size: number = 32) => {
    const desc = description.toLowerCase();

    if (desc.includes("thunder") || desc.includes("lightning") || desc.includes("storm")) {
      return <Image src="/icon/stormy-weather-50.png" alt="Stormy" width={size} height={size} className="drop-shadow-lg" />;
    }
    if (desc.includes("heavy") || desc.includes("downpour") || desc.includes("pour") || desc.includes("fall")) {
      return <Image src="/icon/rainfall-50.png" alt="Rain Fall" width={size} height={size} className="drop-shadow-lg" />;
    }
    if (desc.includes("rain") || desc.includes("rainy") || desc.includes("drizzle") || desc.includes("shower") || desc.includes("moderate")) {
      return <Image src="/icon/moderate-rain-50.png" alt="Moderate Rain" width={size} height={size} className="drop-shadow-lg" />;
    }
    if (desc.includes("wind") || desc.includes("breezy") || desc.includes("gusty")) {
      return <Image src="/icon/windy-weather-50.png" alt="Windy" width={size} height={size} className="drop-shadow-lg" />;
    }
    if (desc.includes("clear") || desc.includes("sunny") || desc.includes("bright")) {
      return <Image src="/icon/sun-50.png" alt="Sunny" width={size} height={size} className="drop-shadow-lg" />;
    }
    if (desc.includes("partly") || desc.includes("scattered") || desc.includes("few clouds")) {
      return <Image src="/icon/partly-cloudy-day-50.png" alt="Partly Cloudy" width={size} height={size} className="drop-shadow-lg" />;
    }

    return <Image src="/icon/clouds-50.png" alt="Cloudy" width={size} height={size} className="drop-shadow-lg" />;
  };

  // Format date for carousel cards
  const formatCarouselDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const month = date.toLocaleDateString("en-US", { month: "short" });

    if (date.toDateString() === today.toDateString()) {
      return { day: "Today", date: date.getDate().toString(), month };
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return { day: "Tomorrow", date: date.getDate().toString(), month };
    }

    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.getDate().toString(),
      month,
    };
  };

  // Carousel navigation handlers
  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      if (direction === "left") {
        carouselRef.current.prev();
      } else {
        carouselRef.current.next();
      }
    }
  };

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

  // Render Today's Outfit tab content
  const renderTodayOutfitContent = () => (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h4 className="font-dela-gothic text-2xl md:text-3xl lg:text-4xl leading-tight">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-cyan-200">
            What to wear today?
          </span>
        </h4>
        <p className="bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-cyan-200">
          Get personalized outfit suggestions based on today&apos;s weather
        </p>
      </div>

      {/* Weather Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h4 className="font-bricolage font-bold text-xl md:text-2xl lg:text-3xl leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
              Today&apos;s weather
            </span>
          </h4>

          {/* Weather Tabs */}
          <Radio.Group
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            buttonStyle="solid"
            size="large"
            className="glass-radio-group"
          >
            <Radio.Button value="my-location" className="glass-radio-button">
              <div className="flex items-center gap-2">
                <span>My Location</span>
              </div>
            </Radio.Button>
            <Radio.Button
              value="selected-location"
              disabled={!customWeather}
              className="glass-radio-button"
            >
              <div className="flex items-center gap-2">
                <span>Selected Location</span>
              </div>
            </Radio.Button>
          </Radio.Group>

          <div className="glass-button-hover">
            <GlassButton
              variant="custom"
              borderRadius="14px"
              blur="8px"
              brightness={1.12}
              glowColor="rgba(59,130,246,0.45)"
              glowIntensity={6}
              borderColor="rgba(255,255,255,0.28)"
              borderWidth="1px"
              textColor="#ffffffff"
              className="px-4 h-12 font-semibold"
              displacementScale={5}
              onClick={() => setIsLocationModalOpen(true)}
            >
              <span className="hidden sm:inline">Choose Another Location</span>
              <span className="sm:hidden">Change</span>
            </GlassButton>
          </div>
        </div>

        {/* Loading State */}
        {(isLoadingWeather || isLoadingCustomWeather) && (
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
        {weatherError && !isLoadingWeather && !isLoadingCustomWeather && !customWeather && (
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
        {!isLoadingWeather && !isLoadingCustomWeather && (
          <>
            {activeTab === "my-location" && todayForecast && (
              <WeatherCard
                forecast={todayForecast}
                cityName={cityName}
              />
            )}
            {activeTab === "selected-location" && customWeather && (
              <WeatherCard
                forecast={customWeather.forecast}
                cityName={customWeather.cityName}
              />
            )}
          </>
        )}
      </div>

      {/* Suggest Outfit Button with Occasion Selector */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
        <Select
          value={selectedOccasionId}
          onChange={setSelectedOccasionId}
          placeholder="Select occasion"
          allowClear
          loading={isLoadingOccasions}
          size="large"
          style={{ width: 256 }}
          listHeight={256}
        >
          {occasions.map((occasion) => (
            <Select.Option key={occasion.id} value={occasion.id}>
              {occasion.name}
            </Select.Option>
          ))}
        </Select>

        <Select
          value={totalOutfit}
          onChange={setTotalOutfit}
          size="large"
          style={{ width: 192 }}
        >
          <Select.Option value={1}>1 Outfit</Select.Option>
          <Select.Option value={2}>2 Outfits</Select.Option>
          <Select.Option value={3}>3 Outfits</Select.Option>
          <Select.Option value={4}>4 Outfits</Select.Option>
        </Select>

        <GlassButton
          onClick={handleSuggestOutfit}
          disabled={isSuggestingOutfit}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-6 text-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSuggestingOutfit ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
              Generating Suggestions...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2 inline" />
              Suggest Today Outfit
            </>
          )}
        </GlassButton>
      </div>

      {/* Suggestion Results */}
      {suggestionResults.length > 0 && (
        <div id="suggestion-results" className="mt-8 pb-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bricolage font-bold text-xl md:text-2xl lg:text-3xl leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                  Your Suggested Outfits
                </span>
              </h4>
              <p className="text-white/70 mt-2">
                AI-generated outfit suggestions based on today&apos;s weather
              </p>
            </div>

            {/* Mass Add Controls */}
            {suggestionResults.length > 1 && (
              <div className="flex flex-wrap items-center gap-3">
                <Checkbox
                  checked={selectedOutfitIndexes.length === suggestionResults.length}
                  indeterminate={selectedOutfitIndexes.length > 0 && selectedOutfitIndexes.length < suggestionResults.length}
                  onChange={handleSelectAll}
                  className="text-white"
                >
                  <span className="text-white/80">Select All</span>
                </Checkbox>

                <GlassButton
                  onClick={handleAddSelectedOutfits}
                  disabled={selectedOutfitIndexes.length === 0 || isAddingMultiple}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-4 py-2 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingMultiple ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2 inline" />
                      Add Selected ({selectedOutfitIndexes.length})
                    </>
                  )}
                </GlassButton>
              </div>
            )}
          </div>
          <div className="space-y-8">
            {suggestionResults.map((suggestion, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center gap-3">
                  {suggestionResults.length > 1 && (
                    <Checkbox
                      checked={selectedOutfitIndexes.includes(index)}
                      onChange={() => handleToggleOutfitSelection(index)}
                      className="scale-125"
                    />
                  )}
                  <h5 className="font-bricolage font-semibold text-lg md:text-xl leading-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-pink-200">
                      Outfit Option {index + 1}
                    </span>
                  </h5>
                  {selectedOutfitIndexes.includes(index) && (
                    <Check className="w-5 h-5 text-green-400" />
                  )}
                </div>
                <SuggestionResultView
                  items={suggestion.suggestedItems}
                  reason={suggestion.reason}
                  onClose={handleCloseResults}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render Future Occasion tab content
  const renderFutureOccasionContent = () => (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h4 className="font-dela-gothic text-2xl md:text-3xl lg:text-4xl leading-tight">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-cyan-200">
            Dress to Impress
          </span>
        </h4>
        <p className="bg-clip-text text-transparent bg-linear-to-r from-white via-blue-100 to-cyan-200">
          Plan your perfect outfit for any upcoming occasion
        </p>
      </div>

      {/* 16-Day Weather Forecast Carousel */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h4 className="font-bricolage font-bold text-xl md:text-2xl lg:text-3xl leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
              Choose Your Day
            </span>
          </h4>

          {/* Location Tabs */}
          <Radio.Group
            value={occasionLocationTab}
            onChange={(e) => {
              setOccasionLocationTab(e.target.value);
              setSelectedForecastDay(null);
            }}
            buttonStyle="solid"
            size="large"
            className="glass-radio-group"
          >
            <Radio.Button value="my-location" className="glass-radio-button">
              <div className="flex items-center gap-2">
                <span>My Location</span>
              </div>
            </Radio.Button>
            <Radio.Button
              value="selected-location"
              disabled={!occasionLocation}
              className="glass-radio-button"
            >
              <div className="flex items-center gap-2">
                <span>Selected Location</span>
              </div>
            </Radio.Button>
          </Radio.Group>

          <div className="glass-button-hover">
            <GlassButton
              variant="custom"
              borderRadius="14px"
              blur="8px"
              brightness={1.12}
              glowColor="rgba(59,130,246,0.45)"
              glowIntensity={6}
              borderColor="rgba(255,255,255,0.28)"
              borderWidth="1px"
              textColor="#ffffffff"
              className="px-4 h-12 font-semibold"
              displacementScale={5}
              onClick={() => setIsOccasionLocationModalOpen(true)}
            >
              <span className="hidden sm:inline">Choose Another Location</span>
              <span className="sm:hidden">Change</span>
            </GlassButton>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingExtendedForecast && (
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
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
                <p className="text-white/70 text-sm">Loading 16-day forecast...</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Weather Carousel */}
        {!isLoadingExtendedForecast && extendedForecast.length > 0 && (
          <div
            className="weather-carousel-container relative overflow-hidden w-full"
            onMouseEnter={() => {
              document.body.style.overflow = "hidden";
            }}
            onMouseLeave={() => {
              document.body.style.overflow = "";
            }}
            onWheel={(e) => {
              e.stopPropagation();
              if (e.deltaY > 0 || e.deltaX > 0) {
                carouselRef.current?.next();
              } else {
                carouselRef.current?.prev();
              }
            }}
          >
            {/* Left Arrow - Circular Glass Button (Center of Card) */}
            <button
              onClick={() => scrollCarousel("left")}
              className="carousel-nav-btn absolute left-2 w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center z-20"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white/90" />
            </button>

            {/* Right Arrow - Circular Glass Button (Center of Card) */}
            <button
              onClick={() => scrollCarousel("right")}
              className="carousel-nav-btn absolute right-2 w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center z-20"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white/90" />
            </button>
            <Carousel
              ref={carouselRef}
              dots={false}
              infinite={false}
              slidesToShow={7}
              slidesToScroll={3}
              swipeToSlide
              draggable
              speed={400}
              cssEase="cubic-bezier(0.4, 0, 0.2, 1)"
              responsive={[
                {
                  breakpoint: 1280,
                  settings: {
                    slidesToShow: 6,
                    slidesToScroll: 3,
                  },
                },
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 5,
                    slidesToScroll: 3,
                  },
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 4,
                    slidesToScroll: 2,
                  },
                },
                {
                  breakpoint: 640,
                  settings: {
                    slidesToShow: 3,
                    slidesToScroll: 2,
                  },
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                  },
                },
              ]}
            >
              {extendedForecast.filter((forecast) => {
                const today = new Date();
                const forecastDate = new Date(forecast.date);
                return forecastDate.toDateString() !== today.toDateString();
              }).map((forecast, index) => {
                const dateInfo = formatCarouselDate(forecast.date);
                const isSelected = selectedForecastDay?.date === forecast.date;

                return (
                  <div key={index} className="px-3 py-2">
                    <button
                      onClick={() => setSelectedForecastDay(isSelected ? null : forecast)}
                      className={`w-full p-4 rounded-2xl transition-all duration-300 border-2 ${
                        isSelected
                          ? "bg-gradient-to-br from-cyan-500/40 via-blue-500/30 to-indigo-500/40 border-cyan-400/60 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/40"
                          : "bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      {/* Day of Week */}
                      <p className={`text-xs font-semibold mb-1 ${isSelected ? "text-cyan-200" : "text-white/60"}`}>
                        {dateInfo.day}
                      </p>

                      {/* Date Number */}
                      <p className={`text-2xl font-bold ${isSelected ? "text-white" : "text-white/90"}`}>
                        {dateInfo.date}
                      </p>

                      {/* Month */}
                      <p className={`text-xs font-medium mb-2 ${isSelected ? "text-cyan-200" : "text-white/50"}`}>
                        {dateInfo.month}
                      </p>

                      {/* Weather Icon */}
                      <div className="flex justify-center mb-2">
                        {getWeatherIcon(forecast.description, 36)}
                      </div>

                      {/* Temperature */}
                      <p className={`text-lg font-bold ${isSelected ? "text-white" : "text-white/90"}`}>
                        {Math.round(forecast.temperature)}°C
                      </p>

                      {/* High/Low */}
                      <p className={`text-xs ${isSelected ? "text-cyan-200" : "text-white/50"}`}>
                        {Math.round(forecast.maxTemperature)}° / {Math.round(forecast.minTemperature)}°
                      </p>
                    </button>
                  </div>
                );
              })}
            </Carousel>
          </div>
        )}

        {/* No Forecast Available */}
        {!isLoadingExtendedForecast && extendedForecast.length === 0 && (
          <GlassCard
            padding="24px"
            borderRadius="24px"
            blur="10px"
            brightness={1.02}
            glowColor="rgba(239, 68, 68, 0.2)"
            borderColor="rgba(248, 113, 113, 0.3)"
            borderWidth="2px"
            className="bg-gradient-to-br from-orange-300/20 via-amber-200/10 to-orange-300/20"
          >
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-orange-300 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Unable to Load Forecast
                </h3>
                <p className="text-white/70 text-sm">
                  Please allow location access to see the 16-day weather forecast for planning your outfits.
                </p>
              </div>
            </div>
          </GlassCard>
        )}

      </div>

      {/* Selected Day Weather Card - Outside the carousel container */}
      {selectedForecastDay && (
        <div className="mt-2">
          <WeatherCard
            forecast={selectedForecastDay}
            cityName={occasionLocationTab === "selected-location" && occasionLocation ? occasionLocation.cityName : (cityName || "Your Location")}
          />
        </div>
      )}

      {/* Occasion Selector for Future */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <Select
          value={selectedOccasionId}
          onChange={setSelectedOccasionId}
          placeholder="Select your occasion"
          allowClear
          loading={isLoadingOccasions}
          size="large"
          style={{ width: 300 }}
          listHeight={256}
        >
          {occasions.map((occasion) => (
            <Select.Option key={occasion.id} value={occasion.id}>
              {occasion.name}
            </Select.Option>
          ))}
        </Select>

        <Select
          value={totalOutfit}
          onChange={setTotalOutfit}
          size="large"
          style={{ width: 192 }}
        >
          <Select.Option value={1}>1 Outfit</Select.Option>
          <Select.Option value={2}>2 Outfits</Select.Option>
          <Select.Option value={3}>3 Outfits</Select.Option>
          <Select.Option value={4}>4 Outfits</Select.Option>
        </Select>

        <GlassButton
          onClick={handleSuggestOutfit}
          disabled={isSuggestingOutfit}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-6 text-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSuggestingOutfit ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
              Generating Suggestions...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2 inline" />
              Suggest Outfit
            </>
          )}
        </GlassButton>
      </div>

      {/* Suggestion Results */}
      {suggestionResults.length > 0 && (
        <div id="suggestion-results" className="mt-8 pb-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bricolage font-bold text-xl md:text-2xl lg:text-3xl leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-pink-200">
                  Your Suggested Outfits
                </span>
              </h4>
              <p className="text-white/70 mt-2">
                AI-generated outfit suggestions for your upcoming occasion
              </p>
            </div>

            {/* Mass Add Controls */}
            {suggestionResults.length > 1 && (
              <div className="flex flex-wrap items-center gap-3">
                <Checkbox
                  checked={selectedOutfitIndexes.length === suggestionResults.length}
                  indeterminate={selectedOutfitIndexes.length > 0 && selectedOutfitIndexes.length < suggestionResults.length}
                  onChange={handleSelectAll}
                  className="text-white"
                >
                  <span className="text-white/80">Select All</span>
                </Checkbox>

                <GlassButton
                  onClick={handleAddSelectedOutfits}
                  disabled={selectedOutfitIndexes.length === 0 || isAddingMultiple}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-4 py-2 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingMultiple ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2 inline" />
                      Add Selected ({selectedOutfitIndexes.length})
                    </>
                  )}
                </GlassButton>
              </div>
            )}
          </div>
          <div className="space-y-8">
            {suggestionResults.map((suggestion, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center gap-3">
                  {suggestionResults.length > 1 && (
                    <Checkbox
                      checked={selectedOutfitIndexes.includes(index)}
                      onChange={() => handleToggleOutfitSelection(index)}
                      className="scale-125"
                    />
                  )}
                  <h5 className="font-bricolage font-semibold text-lg md:text-xl leading-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-pink-200">
                      Outfit Option {index + 1}
                    </span>
                  </h5>
                  {selectedOutfitIndexes.includes(index) && (
                    <Check className="w-5 h-5 text-green-400" />
                  )}
                </div>
                <SuggestionResultView
                  items={suggestion.suggestedItems}
                  reason={suggestion.reason}
                  onClose={handleCloseResults}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-32">
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-8">
        <style jsx global>{`
          .glass-button-hover {
            transition: transform 0.2s ease;
          }
          .glass-button-hover:hover {
            transform: scale(1.04);
          }
          .glass-button-hover:active {
            transform: scale(0.98);
          }

          /* Glassmorphism Tab Card Styling */
          .suggest-tabs.ant-tabs-card > .ant-tabs-nav::before {
            border-bottom: none !important;
          }
          .suggest-tabs.ant-tabs-card > .ant-tabs-nav .ant-tabs-nav-wrap {
            border-bottom: none !important;
          }
          .suggest-tabs.ant-tabs-card > .ant-tabs-nav {
            margin-bottom: 24px !important;
          }
          .suggest-tabs.ant-tabs-card > .ant-tabs-nav .ant-tabs-nav-list {
            background: rgba(15, 23, 42, 0.4) !important;
            backdrop-filter: blur(12px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(12px) saturate(180%) !important;
            padding: 6px !important;
            border-radius: 16px !important;
            border: 1px solid rgba(148, 163, 184, 0.2) !important;
            box-shadow:
              inset 2px 2px 0px -2px rgba(255, 255, 255, 0.3),
              0 4px 16px rgba(0, 0, 0, 0.2),
              0 0 24px rgba(6, 182, 212, 0.1) !important;
          }
          .suggest-tabs.ant-tabs-card .ant-tabs-tab {
            background: transparent !important;
            border: none !important;
            border-radius: 12px !important;
            margin: 0 !important;
            padding: 12px 28px !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          .suggest-tabs.ant-tabs-card .ant-tabs-tab:hover:not(.ant-tabs-tab-active) {
            background: rgba(255, 255, 255, 0.08) !important;
          }
          .suggest-tabs.ant-tabs-card .ant-tabs-tab .ant-tabs-tab-btn {
            color: rgba(255, 255, 255, 0.65) !important;
            transition: color 0.3s ease !important;
          }
          .suggest-tabs.ant-tabs-card .ant-tabs-tab:hover .ant-tabs-tab-btn {
            color: rgba(255, 255, 255, 0.9) !important;
          }
          .suggest-tabs.ant-tabs-card .ant-tabs-tab-active {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.35), rgba(6, 182, 212, 0.35)) !important;
            border: 1px solid rgba(34, 211, 238, 0.4) !important;
            box-shadow:
              inset 2px 2px 0px -2px rgba(255, 255, 255, 0.4),
              0 4px 12px rgba(6, 182, 212, 0.3),
              0 0 20px rgba(6, 182, 212, 0.2) !important;
          }
          .suggest-tabs.ant-tabs-card .ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #ffffff !important;
            text-shadow: 0 0 12px rgba(34, 211, 238, 0.5) !important;
          }
          .suggest-tabs .ant-tabs-ink-bar {
            display: none !important;
          }
          .suggest-tabs .ant-tabs-content-holder {
            padding-top: 8px !important;
            overflow: visible !important;
          }
          .suggest-tabs .ant-tabs-content {
            overflow: visible !important;
          }
          .suggest-tabs .ant-tabs-tabpane {
            overflow: visible !important;
          }

          /* Hide scrollbar for carousel */
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          /* Weather Carousel Glassmorphism Styling */
          .weather-carousel-container {
            width: 100%;
            max-width: 100%;
            position: relative;
          }
          .weather-carousel-container .slick-slider {
            width: 100%;
            position: static !important;
          }
          .weather-carousel-container .slick-list {
            overflow: hidden !important;
            margin: 0 40px;
            padding: 4px 0;
          }
          .weather-carousel-container .slick-track {
            display: flex !important;
            gap: 0;
          }
          .weather-carousel-container .slick-slide {
            height: auto;
          }
          .weather-carousel-container .slick-slide > div {
            height: 100%;
          }
          .weather-carousel-container .slick-arrow {
            display: none !important;
          }
          /* Smooth transition for slides */
          .weather-carousel-container .slick-track {
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }

          /* Circular Glass Navigation Button */
          .carousel-nav-btn {
            background: linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.15) 0%,
              rgba(255, 255, 255, 0.05) 50%,
              rgba(255, 255, 255, 0.02) 100%
            );
            backdrop-filter: blur(12px) saturate(180%);
            -webkit-backdrop-filter: blur(12px) saturate(180%);
            border: 1.5px solid rgba(255, 255, 255, 0.25);
            box-shadow:
              inset 0 1px 2px rgba(255, 255, 255, 0.3),
              inset 0 -1px 2px rgba(0, 0, 0, 0.1),
              0 4px 16px rgba(0, 0, 0, 0.2),
              0 0 20px rgba(59, 130, 246, 0.15);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            top: 50% !important;
            transform: translateY(-50%) !important;
          }
          .carousel-nav-btn::before {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            right: 2px;
            bottom: 2px;
            border-radius: 50%;
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.1) 0%,
              transparent 60%
            );
            pointer-events: none;
          }
          .carousel-nav-btn::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 50%;
            border-radius: 50% 50% 0 0;
            background: linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.15) 0%,
              transparent 100%
            );
            pointer-events: none;
          }
          .carousel-nav-btn:hover {
            background: linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.22) 0%,
              rgba(255, 255, 255, 0.1) 50%,
              rgba(255, 255, 255, 0.05) 100%
            );
            border-color: rgba(255, 255, 255, 0.35);
            box-shadow:
              inset 0 1px 3px rgba(255, 255, 255, 0.4),
              inset 0 -1px 2px rgba(0, 0, 0, 0.1),
              0 6px 20px rgba(0, 0, 0, 0.25),
              0 0 30px rgba(59, 130, 246, 0.25);
            transform: translateY(-50%) scale(1.08) !important;
          }
          .carousel-nav-btn:active {
            transform: translateY(-50%) scale(0.95) !important;
            box-shadow:
              inset 0 2px 4px rgba(0, 0, 0, 0.2),
              inset 0 -1px 2px rgba(255, 255, 255, 0.1),
              0 2px 8px rgba(0, 0, 0, 0.2);
          }
        `}</style>

        {/* Tabs Section - Centered Card Style */}
        <Tabs
          defaultActiveKey="today"
          type="card"
          size="large"
          className="suggest-tabs w-full"
          centered
          onChange={() => {
            setSuggestionResults([]);
            setSelectedOutfitIndexes([]);
          }}
          items={[
            {
              key: "today",
              label: (
                <span className="font-semibold text-base px-4">
                  Today&apos;s Outfit
                </span>
              ),
              children: renderTodayOutfitContent(),
            },
            {
              key: "future",
              label: (
                <span className="font-semibold text-base px-4">
                  Outfit for Your Occasion
                </span>
              ),
              children: renderFutureOccasionContent(),
            },
          ]}
        />

        {/* Location Map Modal for Today's Outfit */}
        <LocationMapModal
          open={isLocationModalOpen}
          onOpenChange={setIsLocationModalOpen}
          initialLocation={customWeather ? {
            lat: customWeather.lat,
            lng: customWeather.lng,
            address: customWeather.cityName,
          } : undefined}
          onLocationSelect={async (lat, lng, address) => {
            setIsLocationModalOpen(false);

            // Fetch weather for selected location
            setIsLoadingCustomWeather(true);
            const loadingToast = toast.loading("Loading weather for selected location...");

            try {
              const response = await weatherAPI.getWeatherByCoordinates(lat, lng, 1);

              if (response.statusCode === 200 && response.data.dailyForecasts.length > 0) {
                setCustomWeather({
                  forecast: response.data.dailyForecasts[0],
                  cityName: address,
                  lat,
                  lng,
                });
                setActiveTab("selected-location");
                toast.success("Weather updated!", { id: loadingToast });
              } else {
                throw new Error("Failed to fetch weather data");
              }
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Failed to load weather for selected location",
                { id: loadingToast }
              );
            } finally {
              setIsLoadingCustomWeather(false);
            }
          }}
        />

        {/* Location Map Modal for Occasion Section */}
        <LocationMapModal
          open={isOccasionLocationModalOpen}
          onOpenChange={setIsOccasionLocationModalOpen}
          initialLocation={occasionLocation ? {
            lat: occasionLocation.lat,
            lng: occasionLocation.lng,
            address: occasionLocation.cityName,
          } : undefined}
          onLocationSelect={(lat, lng, address) => {
            setIsOccasionLocationModalOpen(false);
            setOccasionLocation({
              lat,
              lng,
              cityName: address,
            });
            // Switch to selected location tab and clear selected forecast day
            setOccasionLocationTab("selected-location");
            setSelectedForecastDay(null);
            toast.success(`Location updated to ${address}`);
          }}
        />
      </div>
    </div>
  );
}
