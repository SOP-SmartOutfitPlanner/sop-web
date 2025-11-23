import { Navigation, ArrowUp, ArrowDown, Wind, Droplets, Cloud, CloudRain } from "lucide-react";
import Image from "next/image";
import GlassCard from "@/components/ui/glass-card";
import { DailyForecast } from "@/types/weather";

interface WeatherCardProps {
  forecast: DailyForecast;
  cityName?: string;
}

export const WeatherCard = ({ forecast, cityName }: WeatherCardProps) => {
  // Get weather icon based on description - 7 weather states
  const getWeatherIcon = (description: string, sizeClass: string = "w-12 h-12") => {
    const desc = description.toLowerCase();
    const sizeMap: { [key: string]: number } = {
      "w-12 h-12": 48,
      "w-14 h-14": 56,
      "w-12 h-12 md:w-14 md:h-14": 56,
    };
    const size = sizeMap[sizeClass] || 48;

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="h-[33vh] min-h-[400px] max-h-[500px]">
      <div className="grid grid-flow-col auto-cols-fr grid-rows-2 gap-4 h-full">
        {/* Main Weather Card */}
        <GlassCard
          padding="24px"
          borderRadius="28px"
          blur="12px"
          brightness={1.05}
          glowColor="rgba(59, 130, 246, 0.3)"
          borderColor="rgba(255, 255, 255, 0.25)"
          borderWidth="2px"
          className="bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-purple-500/30 relative overflow-hidden row-span-2"
        >
          {/* Background decoration */}

          <div className="h-full flex flex-col justify-between relative z-10">
            {/* Location & Date */}
            <div className="space-y-1">
              <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">
                {cityName || "Your Location"}
              </h3>
              <p className="text-white/60 text-sm font-medium">
                {formatDate(forecast.date)}
              </p>
            </div>

            {/* Main Weather Display */}
            <div className="flex items-end justify-between my-4">
              <div className="space-y-1">
                <div className="text-6xl md:text-7xl font-bold text-white tracking-tighter leading-none">
                  {Math.round(forecast.temperature)}°C
                </div>
                <p className="text-white/90 text-lg capitalize font-semibold tracking-wide">
                  {forecast.description}
                </p>
              </div>
              <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl ring-4 ring-white/10 transform hover:scale-105 transition-transform duration-300"
              >
                {getWeatherIcon(forecast.description, "w-12 h-12 md:w-14 md:h-14")}
              </div>
            </div>

            {/* Feels Like & High/Low */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Feels</p>
                <p className="text-white text-lg md:text-xl font-bold">{Math.round(forecast.feelsLike)}°C</p>
              </div>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" /> High
                </p>
                <p className="text-white text-lg md:text-xl font-bold">{Math.round(forecast.maxTemperature)}°C</p>
              </div>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ArrowDown className="w-3 h-3" /> Low
                </p>
                <p className="text-white text-lg md:text-xl font-bold">{Math.round(forecast.minTemperature)}°C</p>
              </div>
            </div>
          </div>
        </GlassCard>
        {/* Wind Conditions Card */}
        <GlassCard
          padding="16px"
          borderRadius="20px"
          blur="12px"
          brightness={1.05}
          glowColor="rgba(34, 197, 94, 0.25)"
          borderColor="rgba(255, 255, 255, 0.25)"
          borderWidth="2px"
          className="bg-gradient-to-br from-emerald-400/25 via-green-400/15 to-teal-500/25 relative overflow-hidden hover:scale-[1.02] transition-transform duration-300"
        >

          <div className="h-full flex flex-col justify-between relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg">
                <Image src="/icon/wind-50.png" alt="Wind" width={20} height={20} />
              </div>
              <div>
                <h4 className="text-white text-sm font-bold">Wind</h4>
                <p className="text-white/60 text-xs">Speed & Direction</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl p-2">
                <Wind className="w-5 h-5 text-white" />
                <span className="text-white/60 text-xs mb-1">Speed</span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-white">{forecast.wind.speed.value}</span>
                  <span className="text-xs text-white/70 ml-1">{forecast.wind.speed.unit}</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl p-2">
                <Navigation className="w-4 h-4 text-white/70 mb-1" style={{ transform: `rotate(${forecast.wind.direction.value}deg)` }} />
                <span className="text-white/60 text-xs mb-1">Direction</span>
                <span className="text-2xl font-bold text-white">{forecast.wind.direction.code}</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Atmospheric Conditions Card */}
        <GlassCard
          padding="16px"
          borderRadius="20px"
          blur="12px"
          brightness={1.05}
          glowColor="rgba(96, 165, 250, 0.25)"
          borderColor="rgba(255, 255, 255, 0.25)"
          borderWidth="2px"
          className="bg-gradient-to-br from-blue-400/25 via-cyan-400/15 to-sky-500/25 relative overflow-hidden hover:scale-[1.02] transition-transform duration-300"
        >

          <div className="h-full flex flex-col justify-between relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg">
                <Image src="/icon/wet-50.png" alt="Humidity" width={20} height={20} />
              </div>
              <div>
                <h4 className="text-white text-sm font-bold">Atmosphere</h4>
                <p className="text-white/60 text-xs">Humidity & Pressure</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl p-2">
                <Droplets className="w-4 h-4 text-white/70 mb-1" />
                <span className="text-white/60 text-xs mb-1">Humidity</span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-white">{forecast.humidity}<span className="text-lg font-bold text-white/70 ml-1">%</span></span>

                </div>
              </div>

              <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl p-2">
                <Droplets className="w-4 h-4 text-white/70 mb-1" />
                <span className="text-white/60 text-xs mb-1">Pressure</span>
                <span className="text-2xl font-bold text-white">{forecast.pressure}<span className="text-white/50 text-xs"> hPa</span></span>

              </div>
            </div>
          </div>
        </GlassCard>

        {/* Temperature Range Card */}
        <GlassCard
          padding="16px"
          borderRadius="20px"
          blur="12px"
          brightness={1.05}
          glowColor="rgba(251, 146, 60, 0.25)"
          borderColor="rgba(255, 255, 255, 0.25)"
          borderWidth="2px"
          className="bg-gradient-to-br from-orange-400/25 via-amber-400/15 to-red-500/25 relative overflow-hidden hover:scale-[1.02] transition-transform duration-300"
        >

          <div className="h-full flex flex-col justify-between relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg">
                <Image src="/icon/thermometer-50.png" alt="Temperature" width={20} height={20} />
              </div>
              <div>
                <h4 className="text-white text-sm font-bold">Temperature</h4>
                <p className="text-white/60 text-xs">High & Low</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl p-2">
                <ArrowUp className="w-4 h-4 text-white/70 mb-1" />
                <span className="text-white/60 text-xs mb-1">High</span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-white">{Math.round(forecast.maxTemperature)} <span className="text-lg font-bold text-white/70 ml-1">°C</span></span>

                </div>
              </div>

              <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl p-2">
                <ArrowDown className="w-4 h-4 text-white/70 mb-1" />
                <span className="text-white/60 text-xs mb-1">Low</span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-white">{Math.round(forecast.minTemperature)} <span className="text-lg font-bold text-white/70 ml-1">°C</span></span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Sky Conditions Card */}
        <GlassCard
          padding="16px"
          borderRadius="20px"
          blur="12px"
          brightness={1.05}
          glowColor="rgba(148, 163, 184, 0.25)"
          borderColor="rgba(255, 255, 255, 0.25)"
          borderWidth="2px"
          className="bg-gradient-to-br from-slate-400/25 via-gray-400/15 to-slate-500/25 relative overflow-hidden hover:scale-[1.02] transition-transform duration-300"
        >

          <div className="h-full flex flex-col justify-between relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg">
                <Image src="/icon/clouds-50.png" alt="Sky" width={20} height={20} />
              </div>
              <div>
                <h4 className="text-white text-sm font-bold">Sky Conditions</h4>
                <p className="text-white/60 text-xs">Cloud & Rain</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl p-2">
                <Cloud className="w-4 h-4 text-white/70 mb-1" />
                <span className="text-white/60 text-xs mb-1">Clouds</span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-white">{forecast.cloudCoverage}<span className="text-lg font-bold text-white/70 ml-1">%</span></span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl p-2">
                <CloudRain className="w-4 h-4 text-white/70 mb-1" />
                <span className="text-white/60 text-xs mb-1">Rain</span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-white">{forecast.rain || 0}<span className="text-xs text-white/70 ml-1">mm</span></span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
