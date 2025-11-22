export interface WindSpeed {
  value: number;
  unit: string;
  name: string;
}

export interface WindDirection {
  value: number;
  code: string;
  name: string;
}

export interface Wind {
  speed: WindSpeed;
  direction: WindDirection;
}

export interface DailyForecast {
  date: string;
  temperature: number;
  minTemperature: number;
  maxTemperature: number;
  feelsLike: number;
  pressure: number;
  humidity: number;
  description: string;
  wind: Wind;
  cloudCoverage: number;
  rain: number;
}

export interface WeatherData {
  cityName: string;
  dailyForecasts: DailyForecast[];
}

export interface WeatherResponse {
  statusCode: number;
  message: string;
  data: WeatherData;
}

export interface City {
  name: string;
  localName: string;
  latitude: number;
  longitude: number;
  country: string;
  state: string | null;
}

export interface SearchCitiesResponse {
  statusCode: number;
  message: string;
  data: {
    cities: City[];
  };
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
