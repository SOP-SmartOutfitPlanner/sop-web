import { apiClient } from "./client";
import {
  WeatherResponse,
  SearchCitiesResponse,
  Coordinates,
} from "@/types/weather";

class WeatherAPI {
  /**
   * Get weather forecast by coordinates
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @param cnt - Number of days to forecast (default: 1)
   */
  async getWeatherByCoordinates(
    latitude: number,
    longitude: number,
    cnt: number = 1
  ): Promise<WeatherResponse> {
    try {
      const response = await apiClient.get<WeatherResponse>(
        `/weathers/by-coordinates`,
        {
          params: {
            latitude,
            longitude,
            cnt,
          },
        }
      );

      return response;
    } catch (error) {
      console.error("Failed to fetch weather by coordinates:", error);
      throw error;
    }
  }

  /**
   * Search cities in Vietnam
   * @param cityName - Name of the city to search
   * @param limit - Maximum number of results (optional)
   */
  async searchCities(
    cityName: string,
    limit?: number
  ): Promise<SearchCitiesResponse> {
    try {
      const response = await apiClient.get<SearchCitiesResponse>(
        `/weathers/search-cities`,
        {
          params: {
            cityName,
            ...(limit && { limit }),
          },
        }
      );

      return response;
    } catch (error) {
      console.error("Failed to search cities:", error);
      throw error;
    }
  }

  /**
   * Get user's current location using browser geolocation API
   */
  async getCurrentLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    });
  }
}

export const weatherAPI = new WeatherAPI();
