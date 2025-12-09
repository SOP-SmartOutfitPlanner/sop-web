"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, CalendarPlus } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import { UserOccasionFormModal } from "@/components/calendar/UserOccasionFormModal";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function QuickAddOccasion() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate] = useState(new Date());

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <GlassCard
          padding="1.5rem"
          blur="12px"
          brightness={1.1}
          glowColor="rgba(16, 185, 129, 0.2)"
          glowIntensity={6}
          borderColor="rgba(255, 255, 255, 0.1)"
          borderRadius="1.5rem"
          className="bg-white/5"
        >
          <div className="w-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
                <CalendarPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Quick Actions</h2>
                <p className="text-xs text-white/50">Manage your occasions</p>
              </div>
            </div>

            {/* Main Add Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 mb-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40"
            >
              <Plus className="h-5 w-5" />
              Create New Occasion
            </button>

            {/* View Calendar Link */}
            <Link href="/calendar" className="block">
              <Button
                variant="ghost"
                className="w-full text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
                size="sm"
              >
                View Full Calendar
              </Button>
            </Link>
          </div>
        </GlassCard>
      </motion.div>

      {/* Create Occasion Modal */}
      <UserOccasionFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedDate={selectedDate}
      />
    </>
  );
}
