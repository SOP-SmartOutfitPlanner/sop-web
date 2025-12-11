"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarClock,
  Clock,
  ChevronRight,
  Coffee,
  Plus,
} from "lucide-react";
import { UserOccasion } from "@/types/userOccasion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import GlassCard from "@/components/ui/glass-card";
import { UserOccasionFormModal } from "@/components/calendar/UserOccasionFormModal";
import { format } from "date-fns";

interface TodayOccasionCardProps {
  occasions: UserOccasion[];
  isLoading: boolean;
}

function formatTime(timeString: string) {
  if (!timeString) return "";
  try {
    // Extract time from "2025-12-09T09:00:00" format
    const match = timeString.match(/T(\d{2}):(\d{2})/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = match[2];
      const ampm = hours >= 12 ? "PM" : "AM";
      const hour12 = hours % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }
    return timeString;
  } catch {
    return timeString;
  }
}

export function TodayOccasionCard({
  occasions,
  isLoading,
}: TodayOccasionCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d");

  if (isLoading) {
    return (
      <GlassCard
        padding="1.5rem"
        blur="12px"
        brightness={1.1}
        glowColor="rgba(59, 130, 246, 0.2)"
        glowIntensity={6}
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius="1.5rem"
        className="bg-white/5"
      >
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-xl bg-white/10" />
              <div>
                <Skeleton className="h-6 w-32 bg-white/10 mb-2" />
                <Skeleton className="h-4 w-48 bg-white/10" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl bg-white/10" />
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassCard
        padding="1.5rem"
        blur="12px"
        brightness={1.1}
        glowColor="rgba(59, 130, 246, 0.2)"
        glowIntensity={6}
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius="1.5rem"
        className="bg-white/5"
      >
        <div className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30">
                <CalendarClock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Today&apos;s Schedule
                  {occasions.length > 0 && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/30 text-xs font-semibold text-blue-300">
                      {occasions.length}
                    </span>
                  )}
                </h2>
                <p className="text-sm text-white/50">{formattedDate}</p>
              </div>
            </div>
            <Link href="/calendar">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
              >
                View Calendar
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Occasions List */}
          {occasions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 mb-4">
                <Coffee className="h-8 w-8 text-white/30" />
              </div>
              <h3 className="text-lg font-semibold text-white/70 mb-2">
                No Events Today
              </h3>
              <p className="text-sm text-white/40 max-w-xs">
                Enjoy your free day! You can add new occasions from the calendar.
              </p>
              <Button
                size="sm"
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Plan Something
              </Button>
            </motion.div>
          ) : (
            <div
              data-lenis-prevent
              className="space-y-3 max-h-[350px] overflow-y-auto pr-2 overscroll-contain
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-white/5
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-white/20
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:hover:bg-white/30"
            >
              {occasions.map((occasion, index) => (
                <motion.div
                  key={occasion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 hover:from-white/15 hover:to-white/10 transition-all shadow-lg"
                >
                  {/* Header: Time + Type */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-300">
                        {formatTime(occasion.startTime)} - {formatTime(occasion.endTime)}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-medium text-white/70">
                      {occasion.occasionName}
                    </span>
                  </div>

                  {/* Event Name */}
                  <h3 className="text-lg font-bold text-white mb-2">
                    {occasion.name}
                  </h3>

                  {/* Description */}
                  {occasion.description && (
                    <p className="text-sm text-white/60 leading-relaxed">
                      {occasion.description}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Create Occasion Modal */}
      <UserOccasionFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedDate={today}
      />
    </motion.div>
  );
}
