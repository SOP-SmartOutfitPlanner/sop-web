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
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
        <AvatarUpload />
      </Card>

      {/* Basic Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Display Name</label>
            <Input
              {...register("displayName", {
                required: "Display name is required",
              })}
              placeholder="Your name"
              disabled
            />
            {errors.displayName && (
              <p className="text-sm text-destructive mt-1">
                {errors.displayName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="flex items-center gap-2">
              <Input
                {...register("email")}
                placeholder="your@email.com"
                disabled
                className="flex-1"
              />
              <span className="px-3 py-2 rounded bg-green-100 text-green-700 text-sm font-medium">
                ✓ Verified
              </span>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <Textarea
              {...register("bio")}
              placeholder="Tell us about yourself..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">Max 500 characters</p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <Input
              {...register("location")}
              placeholder="City, Country"
            />
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium mb-2">Date of Birth</label>
            <Input
              {...register("dob")}
              type="date"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <select
              {...register("gender")}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="Unknown">Prefer not to say</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Job Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Occupation</h2>
        <div>
          <label className="block text-sm font-medium mb-2">Job</label>
          <select
            {...register("jobId", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value={2}>Student</option>
            <option value={1}>Professional</option>
            <option value={3}>Freelancer</option>
            <option value={4}>Business Owner</option>
            <option value={5}>Other</option>
          </select>
          <p className="text-xs text-muted-foreground mt-2">
            Tell others what you do to help them understand your style interests
          </p>
        </div>
      </Card>

      {/* Color Preferences */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Color Preferences</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Help us personalize recommendations by selecting colors you prefer and avoid
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preferred Colors */}
          <div>
            <label className="block text-sm font-medium mb-2">Preferred Colors</label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {["Yellow", "Maroon", "Red", "Blue", "Green"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="px-3 py-1 rounded-full border-2 border-input hover:border-primary transition-colors text-sm"
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Avoided Colors */}
          <div>
            <label className="block text-sm font-medium mb-2">Avoided Colors</label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {["Blue", "White", "Gray", "Black", "Brown"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="px-3 py-1 rounded-full border-2 border-input hover:border-destructive transition-colors text-sm"
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Style Preferences */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">My Styles</h2>
        <p className="text-sm text-muted-foreground mb-4">
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
          ].map((style) => (
            <button
              key={style}
              type="button"
              className="px-4 py-2 rounded-lg border-2 border-input hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium"
            >
              {style}
            </button>
          ))}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 md:flex-none"
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
        <Button type="button" variant="outline" className="flex-1 md:flex-none">
          Cancel
        </Button>
      </div>
    </form>
  );
}

