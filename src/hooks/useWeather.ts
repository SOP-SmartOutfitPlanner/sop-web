import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { weatherAPI } from "@/lib/api/weather-api";
import { userAPI } from "@/lib/api/user-api";
import { useAuthStore } from "@/store/auth-store";
import { Coordinates, DailyForecast } from "@/types/weather";

interface UseWeatherOptions {
  cnt?: number;
  enabled?: boolean;
}

export const useWeather = (options: UseWeatherOptions = {}) => {
  const { cnt = 1, enabled = true } = options;
  const { user } = useAuthStore();
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  console.log("🌤️ useWeather hook initialized", { enabled, user: user?.email || "no user" });

  // Parse user location to get coordinates
  const getUserCoordinatesFromProfile = async (): Promise<Coordinates | null> => {
    console.log("getUserCoordinatesFromProfile called");
    console.log("User from auth store:", user);
    console.log("user.location value:", user?.location);

    if (!user?.location) {
      console.log("❌ No user or location in profile - user exists:", !!user, "location:", user?.location);
      return null;
    }

    const location = user.location.trim();
    if (!location) {
      console.log("Location is empty after trim");
      return null;
    }

    console.log("User location from profile:", location);

    // Parse location formats:
    // - "ward, district, city, province" (e.g., "Phường 1, Quận 1, Hồ Chí Minh")
    // - "district, city, province" (e.g., "Quận 1, Hồ Chí Minh")
    // - "city, province" (e.g., "Hồ Chí Minh, Việt Nam")
    // - "city" (e.g., "Hồ Chí Minh" or "Hanoi")

    const parts = location.split(',').map(part => part.trim()).filter(Boolean);

    // Try different search strategies in order of specificity
    const searchTerms: string[] = [];

    if (parts.length >= 3) {
      // "ward, district, city" or "district, city, province"
      // Try last 2 parts (city, province or city)
      searchTerms.push(parts.slice(-2).join(', '));
      searchTerms.push(parts.slice(-1)[0]); // Just the last part (city/province)
    } else if (parts.length === 2) {
      // "city, province" - try both combinations
      searchTerms.push(parts.join(', ')); // Full "city, province"
      searchTerms.push(parts[0]); // Just city name
      searchTerms.push(parts[1]); // Just province name
    } else if (parts.length === 1) {
      // Just "city"
      searchTerms.push(parts[0]);
    }

    // Also add the full location string as a fallback
    if (!searchTerms.includes(location)) {
      searchTerms.push(location);
    }

    // Try each search term until we find a match
    for (const searchTerm of searchTerms) {
      try {
        console.log(`Searching for city: "${searchTerm}"`);
        const response = await weatherAPI.searchCities(searchTerm, 5);

        if (response.data?.cities && response.data.cities.length > 0) {
          const city = response.data.cities[0];
          console.log(`Found city: ${city.name} (${city.localName})`);

          return {
            latitude: city.latitude,
            longitude: city.longitude,
          };
        }
      } catch (error) {
        console.error(`Failed to search for "${searchTerm}":`, error);
        // Continue to next search term
      }
    }

    console.error("No matching city found for location:", location);
    return null;
  };

  // Request browser geolocation
  const requestLocation = async () => {
    setIsRequestingLocation(true);
    setLocationError(null);

    try {
      const coords = await weatherAPI.getCurrentLocation();
      setCoordinates(coords);
      setLocationError(null);
    } catch (error) {
      console.error("Geolocation error:", error);
      setLocationError(
        error instanceof Error
          ? error.message
          : "Failed to get your location. Using profile location instead."
      );

      // Fallback to user profile location
      const profileCoords = await getUserCoordinatesFromProfile();
      if (profileCoords) {
        setCoordinates(profileCoords);
      }
    } finally {
      setIsRequestingLocation(false);
    }
  };

  // Initialize coordinates
  useEffect(() => {
    console.log("🔄 useEffect triggered!");

    const initializeLocation = async () => {
      console.log("=== Initializing location ===");
      console.log("Current coordinates:", coordinates);
      console.log("User from auth store:", user);

      if (coordinates) {
        console.log("Already have coordinates, skipping initialization");
        return; // Already have coordinates
      }

      setIsRequestingLocation(true);
      setLocationError(null);

      // First, try profile location as a fallback in case browser location fails
      console.log("Step 1: Fetching profile location as fallback...");
      let fallbackCoords: Coordinates | null = null;
      try {
        fallbackCoords = await getUserCoordinatesFromProfile();
        console.log("Fallback coords from profile:", fallbackCoords);
      } catch (error) {
        console.log("Profile location error:", error);
      }

      // Priority: Try to get user's browser location
      console.log("Step 2: Trying browser geolocation...");
      if (navigator.geolocation) {
        try {
          const coords = await weatherAPI.getCurrentLocation();
          console.log("✅ Browser location success:", coords);
          setCoordinates(coords);
          setLocationError(null);
          setIsRequestingLocation(false);
          return;
        } catch (geoError) {
          console.log("❌ Browser geolocation denied or unavailable:", geoError);
          // Browser location failed, use profile location if available
          if (fallbackCoords) {
            console.log("✅ Using fallback coords from profile:", fallbackCoords);
            setCoordinates(fallbackCoords);
            setLocationError(null);
            setIsRequestingLocation(false);
            return;
          } else {
            console.log("❌ No fallback coords available");
          }
        }
      } else {
        console.log("⚠️ Browser does not support geolocation");
        // No geolocation support, use profile location
        if (fallbackCoords) {
          console.log("✅ Using fallback coords from profile:", fallbackCoords);
          setCoordinates(fallbackCoords);
          setLocationError(null);
          setIsRequestingLocation(false);
          return;
        }
      }

      // No location available at all
      setLocationError(
        "Unable to determine location. Please share your location or update your profile with a city name."
      );
      setIsRequestingLocation(false);
    };

    console.log("useEffect check:", {
      enabled,
      hasCoordinates: !!coordinates,
      hasUser: !!user,
      userLocation: user?.location
    });

    // Only run if we don't have coordinates AND user is loaded
    // (user can be loaded without location, that's ok - we'll try browser location)
    if (enabled && !coordinates && user !== null) {
      console.log("✅ Conditions met, calling initializeLocation");
      initializeLocation();
    } else {
      console.log("❌ Skipping initializeLocation", {
        enabled,
        hasCoordinates: !!coordinates,
        userLoaded: user !== null
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, user?.location, user]);

  // Fetch weather data
  const {
    data: weatherData,
    isLoading: isLoadingWeather,
    error: weatherError,
    refetch,
  } = useQuery({
    queryKey: ["weather", coordinates?.latitude, coordinates?.longitude, cnt],
    queryFn: async () => {
      if (!coordinates) {
        throw new Error("No coordinates available");
      }

      const response = await weatherAPI.getWeatherByCoordinates(
        coordinates.latitude,
        coordinates.longitude,
        cnt
      );

      return response.data;
    },
    enabled: enabled && !!coordinates,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });

  const todayForecast: DailyForecast | null =
    weatherData?.dailyForecasts?.[0] || null;

  return {
    // Weather data
    weatherData,
    todayForecast,
    cityName: weatherData?.cityName,

    // Location
    coordinates,
    requestLocation,
    isRequestingLocation,
    locationError,

    // Loading & error states
    isLoading: isLoadingWeather || isRequestingLocation,
    error: weatherError || locationError,

    // Actions
    refetch,
  };
};
