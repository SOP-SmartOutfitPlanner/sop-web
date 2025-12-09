"use client";

import { useAuthStore } from "@/store/auth-store";
import { Spin } from "antd";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { StylistVerificationForm } from "@/components/settings/StylistVerificationForm";

export default function StylistVerificationPage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32">
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Link
              href="/settings/profile"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors text-gray-200 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>

            {/* Title */}
            <h1 className="font-dela-gothic text-2xl md:text-3xl lg:text-4xl leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400">
                Become a Stylist
              </span>
            </h1>
          </div>
        </div>

        {/* Verification Form */}
        <StylistVerificationForm />
      </div>
    </div>
  );
}
