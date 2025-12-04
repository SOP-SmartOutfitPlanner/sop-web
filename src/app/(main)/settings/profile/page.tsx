"use client";

import { ProfileEditForm } from "@/components/settings/ProfileEditForm";
import { useAuthStore } from "@/store/auth-store";
import { LoadingScreen } from "@/components/community";

export default function ProfileSettingsPage() {
  const { user } = useAuthStore();

  if (!user) {
    return <LoadingScreen message="Loading user profile ...." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-dela-gothic text-2xl md:text-3xl lg:text-4xl leading-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
            Edit Profile
          </span>
        </h1>
        <p className="text-lg text-blue-100 mt-2">Manage your profile information</p>
      </div>

      <ProfileEditForm />
    </div>
  );
}

