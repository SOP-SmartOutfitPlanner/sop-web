"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { Spin } from "antd";
import {
  Sparkles,
  Shield,
  CheckCircle2,
  AlertCircle,
  Camera,
  CreditCard,
  UserCheck,
  ArrowRight,
  Info,
} from "lucide-react";
import { FaShieldAlt } from "react-icons/fa";
import GlassButton from "@/components/ui/glass-button";
import { userAPI } from "@/lib/api/user-api";
import type { UserProfileResponse } from "@/types/user";

const VERIFICATION_STEPS = [
  {
    icon: CreditCard,
    title: "Scan ID Card",
    description: "Take a photo of your national ID card (front and back)",
  },
  {
    icon: Camera,
    title: "Face Verification",
    description: "Take a selfie to verify your identity",
  },
  {
    icon: UserCheck,
    title: "Become a Stylist",
    description: "Once verified, you'll be registered as a certified stylist",
  },
];

const BENEFITS = [
  "Get a verified stylist badge on your profile",
  "Help others with personalized fashion advice",
  "Build your reputation in the fashion community",
  "Access exclusive stylist features",
];

export function StylistVerificationForm() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserProfileResponse | null>(null);
  const [isStartingVerification, setIsStartingVerification] = useState(false);

  // Load user profile to check if already a stylist
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await userAPI.getUserProfile();
        setUserData(response.data);

        // If already a stylist, redirect back
        if (response.data.isStylist) {
          toast.info("You are already a verified stylist!");
          router.push("/settings/profile");
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.id, router]);

  const handleStartVerification = () => {
    setIsStartingVerification(true);
    // This will be replaced with actual eKYC SDK integration
    // For now, we'll redirect to the eKYC page
    router.push("/settings/stylist-verification/ekyc");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <p className="text-gray-200 text-lg font-medium font-bricolage">Loading...</p>
      </div>
    );
  }

  // Already a stylist view
  if (userData?.isStylist) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">You&apos;re a Verified Stylist!</h2>
          <p className="text-gray-300">
            Your identity has been verified and you have stylist privileges.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-400/30 rounded-full">
          <FaShieldAlt className="w-4 h-4 text-purple-400" />
          <span className="text-purple-300 font-semibold">Verified Stylist</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Information */}
      <div className="space-y-6">
        {/* Main Card */}
        <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-bricolage">Identity Verification</h2>
              <p className="text-sm text-gray-300">Verify your identity to become a stylist</p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-6">
            {VERIFICATION_STEPS.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-400/30 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Step {index + 1}: {step.title}
                  </h3>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Info Notice */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-200">
                This process uses VNPT eKYC to securely verify your identity. Your data is encrypted
                and handled according to privacy regulations.
              </p>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Requirements</h3>
          </div>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Valid Vietnamese ID card (CCCD/CMND)
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Good lighting for photos
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Camera-enabled device
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Stable internet connection
            </li>
          </ul>
        </div>
      </div>

      {/* Right Column - Benefits & Action */}
      <div className="space-y-6">
        {/* Benefits Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-400/30 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Stylist Benefits</h3>
          </div>
          <ul className="space-y-3">
            {BENEFITS.map((benefit, index) => (
              <li key={index} className="flex items-center gap-3 text-sm text-gray-200">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Card */}
        <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg">
              <UserCheck className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Ready to get verified?</h3>
            <p className="text-sm text-gray-300">
              The verification process takes about 2-3 minutes.
            </p>
          </div>

          <GlassButton
            onClick={handleStartVerification}
            disabled={isStartingVerification}
            variant="custom"
            backgroundColor="rgba(168, 85, 247, 0.6)"
            borderColor="rgba(168, 85, 247, 0.8)"
            textColor="white"
            size="lg"
            className="w-full"
          >
            {isStartingVerification ? (
              <>
                <Spin size="small" />
                Starting...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Start Verification
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </GlassButton>

          {/* Warning */}
          <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200">
              Make sure you have your ID card ready and are in a well-lit environment before
              starting the verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
