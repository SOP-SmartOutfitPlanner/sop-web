"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, AlertCircle, Sparkles, Loader2, Check, Plus } from "lucide-react";
import { Radio, Select, Checkbox, Tabs } from "antd";
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
      <div className="text-center py-8">
        <h4 className="font-bricolage font-bold text-xl md:text-2xl leading-tight mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-pink-200">
            Plan Your Perfect Look
          </span>
        </h4>
        <p className="text-white/70 max-w-2xl mx-auto">
          Get outfit suggestions for upcoming events and special occasions. Select an occasion and let AI help you prepare the perfect outfit in advance.
        </p>
      </div>

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
          disabled={isSuggestingOutfit || !selectedOccasionId}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSuggestingOutfit ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
              Generating Suggestions...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2 inline" />
              Suggest Outfit for Occasion
            </>
          )}
        </GlassButton>
      </div>

      {!selectedOccasionId && (
        <p className="text-center text-white/50 text-sm">
          Please select an occasion to get personalized outfit suggestions
        </p>
      )}

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
      </div>
    </div>
  );
}
