/**
 * WeatherSeasonSection Component
 * Season and Weather selection with Condition
 */

import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { FORM_ANIMATIONS, SEASONS, WEATHER_TYPES, CONDITIONS } from "../form-config";

interface WeatherSeasonSectionProps {
  seasons: string[];
  weatherSuitable: string;
  condition: string;
  errors: Record<string, string>;
  onToggleSeason: (season: string) => void;
  onWeatherChange: (weather: string) => void;
  onConditionChange: (condition: string) => void;
}

export function WeatherSeasonSection({
  seasons,
  weatherSuitable,
  condition,
  errors,
  onToggleSeason,
  onWeatherChange,
  onConditionChange,
}: WeatherSeasonSectionProps) {
  return (
    <motion.div variants={FORM_ANIMATIONS.item}>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-white mb-4">
          Season & Condition
        </h3>

        <div className="space-y-5">
          {/* Seasons */}
          <div>
            <Label className="text-sm font-semibold text-white/90 mb-2">
              Seasons *
            </Label>
            <div className="flex flex-wrap gap-2">
              {SEASONS.map((season) => (
                <motion.button
                  key={season}
                  type="button"
                  onClick={() => onToggleSeason(season)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 ${
                    seasons?.includes(season)
                      ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 border border-blue-400/50"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20"
                  }`}
                  aria-pressed={seasons?.includes(season)}
                >
                  {season}
                </motion.button>
              ))}
            </div>
            {errors.seasons && (
              <p className="mt-1.5 text-xs text-red-400 font-medium">
                {errors.seasons}
              </p>
            )}
          </div>

          {/* Weather Suitable */}
          <div>
            <Label className="text-sm font-semibold text-white/90 mb-2">
              Weather Type
            </Label>
            <div className="flex flex-wrap gap-2">
              {WEATHER_TYPES.map((weather) => (
                <motion.button
                  key={weather}
                  type="button"
                  onClick={() => onWeatherChange(weather)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    weatherSuitable === weather
                      ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 border border-blue-400/50"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20"
                  }`}
                >
                  {weather}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div>
            <Label
              htmlFor="condition"
              className="text-sm font-semibold text-white/90 mb-2"
            >
              Condition
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CONDITIONS.map((cond) => (
                <motion.button
                  key={cond}
                  type="button"
                  onClick={() => onConditionChange(cond)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    condition === cond
                      ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 border border-blue-400/50"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20"
                  }`}
                >
                  {cond}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
