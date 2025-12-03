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

  // Parse user location to get coordinates
  const getUserCoordinatesFromProfile = async (): Promise<Coordinates | null> => {
    if (!user?.location) {
      return null;
    }

    const location = user.location.trim();
    if (!location) {
      return null;
    }

    // Parse location formats:
    // - "province, city, ward" (e.g., "Hồ Chí Minh, Quận 1, Phường 1")
    // - "province, city" (e.g., "Hồ Chí Minh, Quận 1")
    // - "city, province" (e.g., "Hồ Chí Minh, Việt Nam")
    // - "city" (e.g., "Hồ Chí Minh" or "Hanoi")

    const parts = location.split(',').map(part => part.trim()).filter(Boolean);

    // Try different search strategies in order of specificity
    const searchTerms: string[] = [];

    if (parts.length >= 3) {
      // "province, city, ward" format
      // Try first 2 parts (province, city) - most likely to work
      searchTerms.push(parts.slice(0, 2).join(', '));
      // Try just major parts like provinces/cities
      searchTerms.push(parts[0]);
      if (parts[1]) searchTerms.push(parts[1]);
    } else if (parts.length === 2) {
      // "province, city" or "city, province" - try both combinations
      searchTerms.push(parts.join(', ')); 
      searchTerms.push(parts[0]);
      searchTerms.push(parts[1]);
    } else if (parts.length === 1) {
      searchTerms.push(parts[0]);
    }

    // Also add simplified versions (remove special chars/diacritics if needed)
    // Add major Vietnamese cities as fallback if parsing fails
    const majorCities = ['Ho Chi Minh', 'Hanoi', 'Da Nang', 'Can Tho', 'Hai Phong'];
    for (const city of majorCities) {
      if (location.toLowerCase().includes(city.toLowerCase()) && !searchTerms.some(term => term.toLowerCase().includes(city.toLowerCase()))) {
        searchTerms.push(city);
      }
    }

    // Try each search term until we find a match
    for (const searchTerm of searchTerms) {
      try {
        const response = await weatherAPI.searchCities(searchTerm, 5);

        if (response.data?.cities && response.data.cities.length > 0) {
          const city = response.data.cities[0];
          console.log(`✅ Found city for "${searchTerm}":`, city.name);
          return {
            latitude: city.latitude,
            longitude: city.longitude,
          };
        }
      } catch (error) {
        console.warn(`Failed to search for "${searchTerm}":`, error);
        // Continue to next search term
      }
    }

    console.warn("❌ No matching city found for location:", location);
    console.warn("Tried search terms:", searchTerms);
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
    const initializeLocation = async () => {
      if (coordinates) {
        return; // Already have coordinates
      }

      setIsRequestingLocation(true);
      setLocationError(null);

      // Strategy 1: Try profile location FIRST
      console.log("📍 Trying profile location:", user?.location);
      try {
        const profileCoords = await getUserCoordinatesFromProfile();
        if (profileCoords) {
          console.log("✅ Profile location found:", profileCoords);
          setCoordinates(profileCoords);
          setLocationError(null);
          setIsRequestingLocation(false);
          return;
        } else {
          console.warn("⚠️ Profile location not found or invalid, trying browser location...");
        }
      } catch (profileError) {
        console.error("❌ Profile location error:", profileError);
      }

      // Strategy 2: Request browser geolocation
      if (navigator.geolocation) {
        try {
          console.log("🌍 Requesting browser location permission...");
          const coords = await weatherAPI.getCurrentLocation();
          console.log("✅ Browser location acquired:", coords);
          setCoordinates(coords);
          setLocationError(null);
          setIsRequestingLocation(false);
          return;
        } catch (geoError) {
          console.warn("⚠️ Browser location denied or failed:", geoError);
        }
      }

      // Strategy 3: Fallback to Ho Chi Minh City hardcoded
      console.log("🏛️ Using default location: Ho Chi Minh City");
      const hoChiMinhCoords: Coordinates = {
        latitude: 10.8231,
        longitude: 106.6297,
      };
      setCoordinates(hoChiMinhCoords);
      setLocationError(null);
      setIsRequestingLocation(false);
    };

    // Only run if we don't have coordinates AND user is loaded
    if (enabled && !coordinates && user !== null) {
      initializeLocation();
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
