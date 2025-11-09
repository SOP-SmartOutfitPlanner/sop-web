"use client";

import { ProfileEditForm } from "@/components/settings/ProfileEditForm";
import { useAuthStore } from "@/store/auth-store";
import { Loader2 } from "lucide-react";

export default function ProfileSettingsPage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground">Manage your profile information</p>
      </div>

      <ProfileEditForm />
    </div>
  );
}

