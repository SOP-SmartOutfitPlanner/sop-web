/**
 * WeatherSeasonSection Component
 * Season selection with Weather and Condition input fields
 */

import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FORM_ANIMATIONS, SEASONS } from "../form-config";

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
            <Label htmlFor="weatherSuitable" className="text-sm font-semibold text-white/90 mb-2">
              Weather Type
            </Label>
            <Input
              id="weatherSuitable"
              type="text"
              value={weatherSuitable}
              onChange={(e) => onWeatherChange(e.target.value)}
              placeholder="e.g., Mild, Hot, Cold, Rainy..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-400/50 focus:ring-blue-400/20"
            />
          </div>

          {/* Condition */}
          <div>
            <Label htmlFor="condition" className="text-sm font-semibold text-white/90 mb-2">
              Condition
            </Label>
            <Input
              id="condition"
              type="text"
              value={condition}
              onChange={(e) => onConditionChange(e.target.value)}
              placeholder="e.g., New, Like New, Good, Fair..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-400/50 focus:ring-blue-400/20"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
