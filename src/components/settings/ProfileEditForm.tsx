"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AvatarUpload } from "./AvatarUpload";
import { cn } from "@/lib/utils";
import type { UserProfileResponse, Job, StyleOption } from "@/types/user";

interface ProfileFormData {
  displayName: string;
  email: string;
  bio: string;
  location: string;
  dob?: string;
  gender?: string | number;
  jobId?: number;
}

export function ProfileEditForm() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [selectedAvoidedColors, setSelectedAvoidedColors] = useState<
    Set<string>
  >(new Set());
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set());
  const [userData, setUserData] = useState<UserProfileResponse | null>(null);

  // Available options from API
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [availableStyles, setAvailableStyles] = useState<StyleOption[]>([]);
  const [availableColors] = useState<string[]>([
    "Yellow",
    "Maroon",
    "Red",
    "Blue",
    "Green",
    "Purple",
    "Black",
    "White",
    "Gray",
    "Brown",
    "Pink",
    "Orange",
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      displayName: "",
      email: "",
      bio: "",
      location: "",
      dob: "",
      gender: "Unknown",
    },
  });

  // Load user data and available options from API
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) {
        setIsLoadingData(false);
        return;
      }

      try {
        setIsLoadingData(true);
        const userId =
          typeof user.id === "string" ? parseInt(user.id, 10) : user.id;

        // Fetch user data and available options in parallel
        const [userResponse, jobsResponse, stylesResponse] = await Promise.all([
          userAPI.getUserById(userId),
          userAPI.getJobs({ "take-all": true }),
          userAPI.getStyles({ "take-all": true }),
        ]);

        // Extract user data (apiClient returns { statusCode, message, data: UserProfileResponse })
        const userData = (userResponse as { data: UserProfileResponse }).data;

        // Extract available options from API responses
        // Handle different response structures (direct array, nested data.data, or wrapped in data)
        let jobs: unknown[] = [];
        let styles: unknown[] = [];

        const jobsData = jobsResponse as { data?: { data?: unknown[] } | unknown[] };
        const stylesData = stylesResponse as { data?: { data?: unknown[] } | unknown[] };

        if (Array.isArray(jobsResponse)) {
          jobs = jobsResponse;
        } else if (jobsData.data && typeof jobsData.data === 'object' && 'data' in jobsData.data && Array.isArray(jobsData.data.data)) {
          jobs = jobsData.data.data;
        } else if (Array.isArray(jobsData.data)) {
          jobs = jobsData.data;
        }

        if (Array.isArray(stylesResponse)) {
          styles = stylesResponse;
        } else if (stylesData.data && typeof stylesData.data === 'object' && 'data' in stylesData.data && Array.isArray(stylesData.data.data)) {
          styles = stylesData.data.data;
        } else if (Array.isArray(stylesData.data)) {
          styles = stylesData.data;
        }

        setAvailableJobs(Array.isArray(jobs) ? jobs as Job[] : []);
        setAvailableStyles(Array.isArray(styles) ? styles as StyleOption[] : []);

        setUserData(userData);

        // Initialize form with API data
        reset({
          displayName: userData.displayName || "",
          email: userData.email || "",
          bio: userData.bio || "",
          location: userData.location || "",
          dob: userData.dob || "",
          gender: userData.gender || 0,
          jobId: userData.jobId || 2,
        });

        // Initialize color preferences
        setSelectedColors(new Set(userData.preferedColor || []));
        setSelectedAvoidedColors(new Set(userData.avoidedColor || []));

        // Initialize style preferences
        const styleNames =
          (userData as { userStyles?: Array<{ styleName: string }> }).userStyles?.map((s) => s.styleName) || [];
        setSelectedStyles(new Set(styleNames));
      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadUserData();
  }, [user?.id, reset]);

  const toggleColor = (color: string) => {
    setSelectedColors((prev) => {
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
    setSelectedAvoidedColors((prev) => {
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
    setSelectedStyles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(style)) {
        newSet.delete(style);
      } else {
        newSet.add(style);
      }
      return newSet;
    });
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // TODO: Call API to update profile
      // await userAPI.updateUserProfile({
      //   ...data,
      //   preferedColor: Array.from(selectedColors),
      //   avoidedColor: Array.from(selectedAvoidedColors),
      //   styleIds: Array.from(selectedStyles),
      // });

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-slate-300">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar Section */}
      <div className="backdrop-blur-xl bg-slate-950/40 border border-slate-700/30 rounded-2xl p-6 shadow-lg shadow-slate-900/20 transition-all duration-300 hover:border-slate-700/50 hover:shadow-slate-900/40">
        <h2 className="text-lg font-bold mb-4 text-white">Profile Picture</h2>
        <AvatarUpload />
      </div>

      {/* Basic Information */}
      <div className="backdrop-blur-xl bg-slate-950/40 border border-slate-700/30 rounded-2xl p-6 shadow-lg shadow-slate-900/20 transition-all duration-300 hover:border-slate-700/50 hover:shadow-slate-900/40">
        <h2 className="text-lg font-bold mb-4 text-white">Basic Information</h2>
        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">
              Display Name
            </label>
            <Input
              {...register("displayName", {
                required: "Display name is required",
              })}
              placeholder="Your name"
              disabled
              className="bg-slate-900/50 border border-slate-700/30 text-white placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-cyan-400/30 disabled:opacity-60"
            />
            {errors.displayName && (
              <p className="text-sm text-red-400 mt-1">
                {errors.displayName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">
              Email
            </label>
            <div className="flex items-center gap-2">
              <Input
                {...register("email")}
                placeholder="your@email.com"
                disabled
                className="flex-1 bg-slate-900/50 border border-slate-700/30 text-white placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-cyan-400/30 disabled:opacity-60"
              />
              <span className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-200 text-sm font-semibold border border-emerald-400/30">
                ✓ Verified
              </span>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">
              Bio
            </label>
            <Textarea
              {...register("bio")}
              placeholder="Tell us about yourself..."
              rows={4}
              className="resize-none bg-slate-900/50 border border-slate-700/30 text-white placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-cyan-400/30"
            />
            <p className="text-xs text-slate-400 mt-1">Max 500 characters</p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">
              Location
            </label>
            <Input
              {...register("location")}
              placeholder="City, Country"
              className="bg-slate-900/50 border border-slate-700/30 text-white placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-cyan-400/30"
            />
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="backdrop-blur-xl bg-slate-950/40 border border-slate-700/30 rounded-2xl p-6 shadow-lg shadow-slate-900/20 transition-all duration-300 hover:border-slate-700/50 hover:shadow-slate-900/40">
        <h2 className="text-lg font-bold mb-4 text-white">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">
              Date of Birth
            </label>
            <Input
              {...register("dob")}
              type="date"
              className="bg-slate-900/50 border border-slate-700/30 text-white rounded-lg focus:ring-2 focus:ring-cyan-400/30"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">
              Gender
            </label>
            <select
              {...register("gender")}
              className="w-full px-3 py-2 border border-slate-700/30 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-cyan-400/30"
            >
              <option value="Unknown" className="bg-slate-800">
                Prefer not to say
              </option>
              <option value="Male" className="bg-slate-800">
                Male
              </option>
              <option value="Female" className="bg-slate-800">
                Female
              </option>
              <option value="Other" className="bg-slate-800">
                Other
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Information */}
      <div className="backdrop-blur-xl bg-slate-950/40 border border-slate-700/30 rounded-2xl p-6 shadow-lg shadow-slate-900/20 transition-all duration-300 hover:border-slate-700/50 hover:shadow-slate-900/40">
        <h2 className="text-lg font-bold mb-4 text-white">Occupation</h2>
        <div>
          <label className="block text-sm font-semibold mb-2 text-white">
            Job
          </label>
          <select
            {...register("jobId", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-slate-700/30 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-cyan-400/30"
          >
            <option value="" className="bg-slate-800">
              Select a job...
            </option>
            {availableJobs.map((job) => (
              <option key={job.id} value={job.id} className="bg-slate-800">
                {job.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-2">
            Tell others what you do to help them understand your style interests
          </p>
        </div>
      </div>

      {/* Color Preferences */}
      <div className="backdrop-blur-xl bg-slate-950/40 border border-slate-700/30 rounded-2xl p-6 shadow-lg shadow-slate-900/20 transition-all duration-300 hover:border-slate-700/50 hover:shadow-slate-900/40">
        <h2 className="text-lg font-bold mb-4 text-white">Color Preferences</h2>
        <p className="text-sm text-slate-400 mb-4">
          Help us personalize recommendations by selecting colors you prefer and
          avoid
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preferred Colors */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-white">
              Preferred Colors
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => {
                  const isSelected = selectedColors.has(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleColor(color)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border transition-all text-sm font-medium",
                        isSelected
                          ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-100 shadow-lg shadow-cyan-500/20"
                          : "border-slate-600/40 text-slate-300 hover:border-cyan-400/50 hover:bg-cyan-500/10"
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
            <label className="block text-sm font-semibold mb-3 text-white">
              Avoided Colors
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => {
                  const isSelected = selectedAvoidedColors.has(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleAvoidedColor(color)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border transition-all text-sm font-medium",
                        isSelected
                          ? "border-red-400/60 bg-red-500/20 text-red-100 shadow-lg shadow-red-500/20"
                          : "border-slate-600/40 text-slate-300 hover:border-red-400/50 hover:bg-red-500/10"
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
      <div className="backdrop-blur-xl bg-slate-950/40 border border-slate-700/30 rounded-2xl p-6 shadow-lg shadow-slate-900/20 transition-all duration-300 hover:border-slate-700/50 hover:shadow-slate-900/40">
        <h2 className="text-lg font-bold mb-4 text-white">My Styles</h2>
        <p className="text-sm text-slate-400 mb-4">
          Select styles that match your personal aesthetic
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableStyles.map((style) => {
            const isSelected = selectedStyles.has(style.name);
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => toggleStyle(style.name)}
                className={cn(
                  "px-4 py-2.5 rounded-lg border transition-all text-sm font-semibold",
                  isSelected
                    ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-100 shadow-lg shadow-cyan-500/20"
                    : "border-slate-600/40 text-slate-300 hover:border-cyan-400/50 hover:bg-cyan-500/10"
                )}
                title={style.description}
              >
                {style.name}
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
          className="flex-1 md:flex-none bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-500/20 font-semibold transition-all"
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
        <Button
          type="button"
          variant="outline"
          className="flex-1 md:flex-none bg-transparent border border-white/20 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/40 font-semibold transition-all"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
