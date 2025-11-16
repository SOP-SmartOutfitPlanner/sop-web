"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { UserCollectionsScreen } from "@/components/collections/UserCollectionsScreen";

export default function UserCollectionsPage() {
  const params = useParams();
  const userId = useMemo(() => {
    const value = params?.userId;
    if (!value) return null;
    const parsed = Array.isArray(value) ? value[0] : value;
    const numeric = Number(parsed);
    return Number.isFinite(numeric) ? numeric : null;
  }, [params]);

  return (
    <>
      <AnimatedBackground />
      {userId ? (
        <div className="min-h-screen relative z-0 pt-32">
          <div className="max-w-6xl mx-auto">
            <UserCollectionsScreen userId={userId} />
          </div>
        </div>
      ) : (
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <p className="rounded-3xl border border-slate-700/40 bg-slate-900/60 px-6 py-4 text-sm text-slate-300">
            Invalid user identifier.
          </p>
        </div>
      )}
    </>
  );
}

