"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { Radio } from "antd";
import { useAuthStore } from "@/store/auth-store";
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";
import { useWeather } from "@/hooks/useWeather";
import { WeatherCard } from "@/components/suggest/WeatherCard";
import { SuggestionResultView } from "@/components/suggest/SuggestionResultView";
import LocationMapModal from "@/components/suggest/LocationMapModal";
import { weatherAPI } from "@/lib/api/weather-api";
import { outfitAPI } from "@/lib/api/outfit-api";
import { DailyForecast } from "@/types/weather";
import { SuggestedItem } from "@/types/outfit";
import { toast } from "sonner";

type WeatherTab = "my-location" | "selected-location";

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
  const [suggestionResult, setSuggestionResult] = useState<{
    items: SuggestedItem[];
    reason: string;
  } | null>(null);
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

  // Handler to suggest outfit based on current weather
  const handleSuggestOutfit = async () => {
    // Determine which weather to use
    const activeWeather = activeTab === "selected-location" && customWeather
      ? customWeather.forecast
      : todayForecast;

    if (!activeWeather) {
      toast.error("Weather data not available. Please ensure location is enabled.");
      return;
    }

    setIsSuggestingOutfit(true);
    const loadingToast = toast.loading("AI is analyzing weather and creating outfit suggestions...");

    try {
      const userId = parseInt(user?.id || "0");

      const weatherString = `${activeWeather.description}, Temperature: ${activeWeather.temperature}°C, Feels like: ${activeWeather.feelsLike}°C`;

      const response = await outfitAPI.getSuggestion(
        weatherString,
        userId
      );

      setSuggestionResult({
        items: response.data.suggestedItems,
        reason: response.data.reason,
      });

      toast.success("Outfit suggestion generated!", { id: loadingToast });

      // Scroll to results
      setTimeout(() => {
        document.getElementById("suggestion-results")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 100);
    } catch (error) {
      console.error("Failed to get outfit suggestion:", error);
      toast.error("Failed to generate outfit suggestion", { id: loadingToast });
    } finally {
      setIsSuggestingOutfit(false);
    }
  };

  const handleRechooseLocation = () => {
    setSuggestionResult(null);
  };

  const handleCloseResults = () => {
    setSuggestionResult(null);
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

          <style jsx>{`
            .glass-button-hover {
              transition: transform 0.2s ease;
            }
            .glass-button-hover:hover {
              transform: scale(1.04);
            }
            .glass-button-hover:active {
              transform: scale(0.98);
            }
          `}</style>

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

        {/* Suggest Outfit Button*/}
        <div className="flex justify-center mt-12">
          <GlassButton
            onClick={handleSuggestOutfit}
            disabled={isSuggestingOutfit || (!todayForecast && !customWeather)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-6 text-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSuggestingOutfit ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                Generating Suggestions...
              </>
            ) : (
              <>
                Suggest Today Outfit
              </>
            )}
          </GlassButton>
        </div>

        {/* Suggestion Results */}
        {suggestionResult && (
          <div id="suggestion-results" className="mt-12 pb-8">
            <div className="mb-6">
              <h4 className="font-bricolage font-bold text-xl md:text-2xl lg:text-3xl leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                  Your Suggested Outfit
                </span>
              </h4>
              <p className="text-white/70 mt-2">
                AI-generated outfit suggestions based on today&apos;s weather
              </p>
            </div>
            <SuggestionResultView
              items={suggestionResult.items}
              reason={suggestionResult.reason}
              onRechooseLocation={handleRechooseLocation}
              onClose={handleCloseResults}
            />
          </div>
        )}

        {/* Location Map Modal */}
        <LocationMapModal
          open={isLocationModalOpen}
          onOpenChange={setIsLocationModalOpen}
          initialLocation={customWeather ? {
            lat: customWeather.lat,
            lng: customWeather.lng,
            address: customWeather.cityName,
          } : undefined}
          onLocationSelect={async (lat, lng, address) => {
            console.log("Selected location:", { lat, lng, address });
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
              console.error("Error fetching weather:", error);
              toast.error(
                error instanceof Error ? error.message : "Failed to load weather for selected location",
                { id: loadingToast }
              );
            } finally {
              setIsLoadingCustomWeather(false);
            }
          }}
        />
      </div>
    </div>
  );
}
