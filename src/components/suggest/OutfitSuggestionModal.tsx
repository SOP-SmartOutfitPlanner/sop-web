"use client";

import { useState } from "react";
import { MapPin, Navigation2, Sparkles, ArrowLeft, Loader2, Cloud, Droplets, Wind, Thermometer } from "lucide-react";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import GlassButton from "@/components/ui/glass-button";
import GlassCard from "@/components/ui/glass-card";
import LocationMapModal from "@/components/suggest/LocationMapModal";
import { SuggestionResultView } from "@/components/suggest/SuggestionResultView";
import { useAuthStore } from "@/store/auth-store";
import { useWeather } from "@/hooks/useWeather";
import { weatherAPI } from "@/lib/api/weather-api";
import { outfitAPI } from "@/lib/api/outfit-api";
import { DailyForecast } from "@/types/weather";
import { SuggestedItem } from "@/types/outfit";
import { toast } from "sonner";

interface OutfitSuggestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "choose-location" | "show-weather" | "show-results";

export function OutfitSuggestionModal({
  open,
  onOpenChange,
}: OutfitSuggestionModalProps) {
  const { user } = useAuthStore();
  const {
    todayForecast: currentLocationForecast,
    cityName: currentCityName,
  } = useWeather();

  const [step, setStep] = useState<Step>("choose-location");
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [customWeather, setCustomWeather] = useState<DailyForecast | null>(null);
  const [customCityName, setCustomCityName] = useState<string | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isSuggestingOutfit, setIsSuggestingOutfit] = useState(false);
  const [suggestionResult, setSuggestionResult] = useState<{
    items: SuggestedItem[];
    reason: string;
  } | null>(null);

  // Determine which weather to use
  const activeWeather = customWeather || currentLocationForecast;
  const activeCityName = customCityName || currentCityName;

  const handleClose = () => {
    // Reset state when closing
    setStep("choose-location");
    setSelectedLocation(null);
    setCustomWeather(null);
    setCustomCityName(null);
    setSuggestionResult(null);
    onOpenChange(false);
  };

  const handleUseCurrentLocation = async () => {
    if (!currentLocationForecast) {
      toast.error("Current location weather not available");
      return;
    }

    setIsSuggestingOutfit(true);
    toast.loading("Generating outfit suggestions...", { id: "suggesting" });
    try {
      const userId = parseInt(user?.id || "0");
      const response = await outfitAPI.getSuggestion(
        currentLocationForecast.description,
        userId
      );

      setSuggestionResult({
        items: response.data.suggestedItems,
        reason: response.data.reason,
      });
      setStep("show-results");
      toast.success("Outfit suggestion generated!", { id: "suggesting" });
    } catch (error) {
      console.error("Failed to get outfit suggestion:", error);
      toast.error("Failed to generate outfit suggestion", { id: "suggesting" });
    } finally {
      setIsSuggestingOutfit(false);
    }
  };

  const handleChooseAnotherLocation = () => {
    setShowMapModal(true);
  };

  const handleLocationSelect = async (lat: number, lng: number, address: string) => {
    console.log("Location selected:", { lat, lng, address });
    setSelectedLocation({ lat, lng, address });
    setShowMapModal(false);

    // Fetch weather for selected location
    setIsLoadingWeather(true);
    toast.loading("Fetching weather data...", { id: "weather" });
    try {
      const response = await weatherAPI.getWeatherByCoordinates(lat, lng, 1);
      
      if (response.data?.dailyForecasts?.[0]) {
        setCustomWeather(response.data.dailyForecasts[0]);
        setCustomCityName(response.data.cityName);
        setStep("show-weather");
        toast.success(`Weather loaded for ${response.data.cityName}`, { id: "weather" });
      }
    } catch (error) {
      console.error("Failed to fetch weather:", error);
      toast.error("Failed to fetch weather for selected location", { id: "weather" });
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const handleSuggestNow = async () => {
    if (!activeWeather) {
      toast.error("Weather data not available");
      return;
    }

    setIsSuggestingOutfit(true);
    toast.loading("AI is analyzing weather and creating outfit suggestions...", { id: "suggesting" });
    try {
      const userId = parseInt(user?.id || "0");
      const response = await outfitAPI.getSuggestion(
        activeWeather.description,
        userId
      );

      setSuggestionResult({
        items: response.data.suggestedItems,
        reason: response.data.reason,
      });
      setStep("show-results");
      toast.success("Outfit suggestion generated!", { id: "suggesting" });
    } catch (error) {
      console.error("Failed to get outfit suggestion:", error);
      toast.error("Failed to generate outfit suggestion", { id: "suggesting" });
    } finally {
      setIsSuggestingOutfit(false);
    }
  };

  const handleBackToLocation = () => {
    setStep("choose-location");
    setCustomWeather(null);
    setCustomCityName(null);
    setSelectedLocation(null);
  };

  const handleRechooseLocation = () => {
    setStep("choose-location");
    setSuggestionResult(null);
  };

  // Step 1: Choose Location
  const renderChooseLocation = () => (
    <div className="space-y-4">
      <p className="text-white/80 text-center mb-6">
        Choose your location to get personalized outfit suggestions based on the weather
      </p>

      <div className="space-y-3">
        {/* Use Current Location */}
        <GlassCard
          padding="20px"
          borderRadius="16px"
          blur="8px"
          brightness={1.05}
          glowColor="rgba(59, 130, 246, 0.3)"
          borderColor="rgba(255, 255, 255, 0.2)"
          className="hover:scale-[1.02] transition-transform cursor-pointer"
          onClick={handleUseCurrentLocation}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              {isSuggestingOutfit ? (
                <Loader2 className="w-6 h-6 text-blue-300 animate-spin" />
              ) : (
                <Navigation2 className="w-6 h-6 text-blue-300" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-lg">
                {isSuggestingOutfit ? "Generating Suggestions..." : "Use Current Location"}
              </h3>
              <p className="text-sm text-white/60">
                {isSuggestingOutfit 
                  ? "AI is analyzing weather..."
                  : currentCityName || "Get suggestions for your current location"}
              </p>
            </div>
            {!isSuggestingOutfit && <Sparkles className="w-5 h-5 text-blue-300" />}
          </div>
        </GlassCard>

        {/* Choose Another Location */}
        <GlassCard
          padding="20px"
          borderRadius="16px"
          blur="8px"
          brightness={1.05}
          glowColor="rgba(34, 197, 94, 0.3)"
          borderColor="rgba(255, 255, 255, 0.2)"
          className="hover:scale-[1.02] transition-transform cursor-pointer"
          onClick={handleChooseAnotherLocation}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              {isLoadingWeather ? (
                <Loader2 className="w-6 h-6 text-green-300 animate-spin" />
              ) : (
                <MapPin className="w-6 h-6 text-green-300" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-lg">
                {isLoadingWeather ? "Loading Weather..." : "Choose Another Location"}
              </h3>
              <p className="text-sm text-white/60">
                {isLoadingWeather
                  ? "Fetching weather data..."
                  : "Select a different location on the map"}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );

  // Step 2: Show Weather & Suggest Button
  const renderShowWeather = () => (
    <div className="space-y-4">
      {/* Back Button */}
      <button
        onClick={handleBackToLocation}
        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to location selection</span>
      </button>

      {isLoadingWeather ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/70">Loading weather...</p>
          </div>
        </div>
      ) : activeWeather ? (
        <>
          <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
            <GlassCard
              padding="1.5rem"
              blur="10px"
              brightness={1.1}
              borderRadius="16px"
              glowColor="rgba(59, 130, 246, 0.3)"
              glowIntensity={8}
            >
              <div className="space-y-4">
                {/* Location Name */}
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <h3 className="text-xl font-bricolage font-semibold text-white">
                    {activeCityName}
                  </h3>
                </div>

                {/* Temperature & Description */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <Thermometer className="w-6 h-6 text-orange-400" />
                    <span className="text-5xl font-bold text-white">
                      {Math.round(activeWeather.temperature)}°C
                    </span>
                  </div>
                  <p className="text-lg text-blue-200 font-medium capitalize">
                    {activeWeather.description}
                  </p>
                </div>

                {/* Weather Details Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  {/* Feels Like */}
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400 font-poppins">Feels Like</p>
                    <p className="text-lg font-semibold text-white">
                      {Math.round(activeWeather.feelsLike)}°C
                    </p>
                  </div>

                  {/* High/Low */}
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400 font-poppins">High / Low</p>
                    <p className="text-lg font-semibold text-white">
                      {Math.round(activeWeather.maxTemperature)}° / {Math.round(activeWeather.minTemperature)}°
                    </p>
                  </div>

                  {/* Humidity */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-400" />
                      <p className="text-sm text-gray-400 font-poppins">Humidity</p>
                    </div>
                    <p className="text-lg font-semibold text-white">{activeWeather.humidity}%</p>
                  </div>

                  {/* Wind Speed */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-cyan-400" />
                      <p className="text-sm text-gray-400 font-poppins">Wind Speed</p>
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {Math.round(activeWeather.wind.speed.value)} {activeWeather.wind.speed.unit}
                    </p>
                  </div>

                  {/* Cloudiness */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-400 font-poppins">Cloudiness</p>
                    </div>
                    <p className="text-lg font-semibold text-white">{activeWeather.cloudCoverage}%</p>
                  </div>

                  {/* Pressure */}
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400 font-poppins">Pressure</p>
                    <p className="text-lg font-semibold text-white">{activeWeather.pressure} hPa</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <GlassButton
              variant="outline"
              size="md"
              onClick={handleRechooseLocation}
              className="flex-1"
            >
              Choose Another Location
            </GlassButton>
            <GlassButton
              variant="custom"
              size="md"
              onClick={handleSuggestNow}
              disabled={isSuggestingOutfit}
              backgroundColor="rgba(59, 130, 246, 0.8)"
              borderColor="rgba(59, 130, 246, 1)"
              className="flex-1"
            >
              {isSuggestingOutfit ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Suggesting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Suggest Outfit Now
                </>
              )}
            </GlassButton>
          </div>
        </>
      ) : (
        <div className="text-center text-white/60 py-8">
          No weather data available
        </div>
      )}
    </div>
  );

  // Step 3: Show Results
  const renderShowResults = () => (
    <div className="space-y-4">
      {suggestionResult && (
        <SuggestionResultView
          items={suggestionResult.items}
          reason={suggestionResult.reason}
          onClose={handleClose}
        />
      )}
    </div>
  );

  const getTitle = () => {
    switch (step) {
      case "choose-location":
        return "Suggest Outfit";
      case "show-weather":
        return "Weather Forecast";
      case "show-results":
        return "Your Suggested Outfit";
      default:
        return "Suggest Outfit";
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case "choose-location":
        return "Choose your location to get started";
      case "show-weather":
        return selectedLocation ? selectedLocation.address : currentCityName;
      case "show-results":
        return "AI-generated outfit suggestions for today";
      default:
        return "";
    }
  };

  return (
    <>
      <ConfirmModal
        open={open}
        onOpenChange={handleClose}
        title={getTitle()}
        subtitle={getSubtitle()}
        showFooter={false}
        maxWidth="800px"
        maxHeight={step === "show-results" ? "90vh" : undefined}
        contentClassName={step === "show-results" ? "overflow-y-auto custom-scrollbar" : ""}
      >
        {step === "choose-location" && renderChooseLocation()}
        {step === "show-weather" && renderShowWeather()}
        {step === "show-results" && renderShowResults()}
      </ConfirmModal>

      {/* Location Map Modal */}
      <LocationMapModal
        open={showMapModal}
        onOpenChange={setShowMapModal}
        onLocationSelect={handleLocationSelect}
      />
    </>
  );
}
