"use client";

import { useParams } from "next/navigation";
import { UserProfile } from "@/components/community/profile/UserProfile";

/**
 * User Profile Page - Show user info and their posts
 * Similar to Facebook profile page
 */
export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;

  return <UserProfile userId={userId} />;
}
