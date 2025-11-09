"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { userAPI } from "@/lib/api/user-api";
import { Loader2 } from "lucide-react";
import { AvatarUpload } from "./AvatarUpload";
import { cn } from "@/lib/utils";

interface ProfileFormData {
  displayName: string;
  email: string;
  bio: string;
  location: string;
  dob?: string;
  gender?: string;
  jobId?: number;
}

export function ProfileEditForm() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [selectedAvoidedColors, setSelectedAvoidedColors] = useState<Set<string>>(new Set());
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set());

  const toggleColor = (color: string) => {
    setSelectedColors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(color)) {
        newSet.delete(color);
      } else {
        newSet.add(color);
      }
      return newSet;
    });
  };

  const toggleAvoidedColor = (color: string) => {
    setSelectedAvoidedColors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(color)) {
        newSet.delete(color);
      } else {
        newSet.add(color);
      }
      return newSet;
    });
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(style)) {
        newSet.delete(style);
      } else {
        newSet.add(style);
      }
      return newSet;
    });
  };

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      displayName: user?.displayName || "",
      email: user?.email || "",
      bio: "",
      location: "",
      dob: "",
      gender: "Unknown",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      // TODO: Call API to update profile
      // await userAPI.updateUserProfile(data);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar Section */}
      <div className="backdrop-blur-md bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border-2 border-cyan-400/25 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
        <h2 className="text-lg font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-200">Profile Picture</h2>
        <AvatarUpload />
      </div>

      {/* Basic Information */}
      <div className="backdrop-blur-md bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border-2 border-cyan-400/25 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
        <h2 className="text-lg font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-200">Basic Information</h2>
        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Display Name</label>
            <Input
              {...register("displayName", {
                required: "Display name is required",
              })}
              placeholder="Your name"
              disabled
              className="bg-cyan-950/30 border-2 border-cyan-400/20 text-white placeholder:text-cyan-300/50 rounded-lg focus:ring-2 focus:ring-cyan-400/30 disabled:opacity-60"
            />
            {errors.displayName && (
              <p className="text-sm text-red-400 mt-1">
                {errors.displayName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Email</label>
            <div className="flex items-center gap-2">
              <Input
                {...register("email")}
                placeholder="your@email.com"
                disabled
                className="flex-1 bg-cyan-950/30 border-2 border-cyan-400/20 text-white placeholder:text-cyan-300/50 rounded-lg focus:ring-2 focus:ring-cyan-400/30 disabled:opacity-60"
              />
              <span className="px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 text-cyan-200 text-sm font-semibold border border-cyan-400/30">
                ✓ Verified
              </span>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Bio</label>
            <Textarea
              {...register("bio")}
              placeholder="Tell us about yourself..."
              rows={4}
              className="resize-none bg-cyan-950/30 border-2 border-cyan-400/20 text-white placeholder:text-cyan-300/50 rounded-lg focus:ring-2 focus:ring-cyan-400/30"
            />
            <p className="text-xs text-blue-200/60 mt-1">Max 500 characters</p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Location</label>
            <Input
              {...register("location")}
              placeholder="City, Country"
              className="bg-cyan-950/30 border-2 border-cyan-400/20 text-white placeholder:text-cyan-300/50 rounded-lg focus:ring-2 focus:ring-cyan-400/30"
            />
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="backdrop-blur-md bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border-2 border-cyan-400/25 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
        <h2 className="text-lg font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-200">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Date of Birth</label>
            <Input
              {...register("dob")}
              type="date"
              className="bg-cyan-950/30 border-2 border-cyan-400/20 text-white rounded-lg focus:ring-2 focus:ring-cyan-400/30"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Gender</label>
            <select
              {...register("gender")}
              className="w-full px-3 py-2 border-2 border-cyan-400/20 rounded-lg bg-cyan-950/30 text-white focus:ring-2 focus:ring-cyan-400/30"
            >
              <option value="Unknown" className="bg-slate-900">Prefer not to say</option>
              <option value="Male" className="bg-slate-900">Male</option>
              <option value="Female" className="bg-slate-900">Female</option>
              <option value="Other" className="bg-slate-900">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Information */}
      <div className="backdrop-blur-md bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border-2 border-cyan-400/25 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
        <h2 className="text-lg font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-200">Occupation</h2>
        <div>
          <label className="block text-sm font-semibold mb-2 text-white">Job</label>
          <select
            {...register("jobId", { valueAsNumber: true })}
            className="w-full px-3 py-2 border-2 border-cyan-400/20 rounded-lg bg-cyan-950/30 text-white focus:ring-2 focus:ring-cyan-400/30"
          >
            <option value={2} className="bg-slate-900">Student</option>
            <option value={1} className="bg-slate-900">Professional</option>
            <option value={3} className="bg-slate-900">Freelancer</option>
            <option value={4} className="bg-slate-900">Business Owner</option>
            <option value={5} className="bg-slate-900">Other</option>
          </select>
          <p className="text-xs text-blue-200/60 mt-2">
            Tell others what you do to help them understand your style interests
          </p>
        </div>
      </div>

      {/* Color Preferences */}
      <div className="backdrop-blur-md bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border-2 border-cyan-400/25 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
        <h2 className="text-lg font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-200">Color Preferences</h2>
        <p className="text-sm text-blue-200/70 mb-4">
          Help us personalize recommendations by selecting colors you prefer and avoid
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preferred Colors */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-white">Preferred Colors</label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {["Yellow", "Maroon", "Red", "Blue", "Green"].map((color) => {
                  const isSelected = selectedColors.has(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleColor(color)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border-2 transition-all text-sm font-medium",
                        isSelected
                          ? "border-cyan-400/80 bg-cyan-500/30 text-cyan-100 shadow-lg shadow-cyan-500/30"
                          : "border-cyan-400/30 text-cyan-200 hover:border-cyan-400/60 hover:bg-cyan-400/10"
                      )}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Avoided Colors */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-white">Avoided Colors</label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {["Blue", "White", "Gray", "Black", "Brown"].map((color) => {
                  const isSelected = selectedAvoidedColors.has(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleAvoidedColor(color)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border-2 transition-all text-sm font-medium",
                        isSelected
                          ? "border-red-400/80 bg-red-500/30 text-red-100 shadow-lg shadow-red-500/30"
                          : "border-red-400/30 text-red-200 hover:border-red-400/60 hover:bg-red-400/10"
                      )}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Style Preferences */}
      <div className="backdrop-blur-md bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border-2 border-cyan-400/25 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
        <h2 className="text-lg font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-200">My Styles</h2>
        <p className="text-sm text-blue-200/70 mb-4">
          Select styles that match your personal aesthetic
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            "Business Casual",
            "Business Formal",
            "Casual",
            "Preppy",
            "Athleisure",
            "Bohemian",
          ].map((style) => {
            const isSelected = selectedStyles.has(style);
            return (
              <button
                key={style}
                type="button"
                onClick={() => toggleStyle(style)}
                className={cn(
                  "px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-semibold",
                  isSelected
                    ? "border-cyan-400/80 bg-cyan-500/30 text-cyan-100 shadow-lg shadow-cyan-500/30"
                    : "border-cyan-400/30 text-cyan-200 hover:border-cyan-400/60 hover:bg-cyan-400/10"
                )}
              >
                {style}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 md:flex-none bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-500/30 font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button type="button" variant="outline" className="flex-1 md:flex-none border-2 border-cyan-400/30 text-cyan-200 hover:bg-cyan-400/10 hover:border-cyan-400/60 font-semibold">
          Cancel
        </Button>
      </div>
    </form>
  );
}

