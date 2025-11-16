"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { CollectionDetail } from "@/components/collections/CollectionDetail";

export default function CollectionDetailPage() {
  const params = useParams();
  const collectionId = useMemo(() => {
    const value = params?.collectionId;
    if (!value) return null;
    const parsed = Array.isArray(value) ? value[0] : value;
    const numeric = Number(parsed);
    return Number.isFinite(numeric) ? numeric : null;
  }, [params]);

  return (
    <>
      <AnimatedBackground />
      {collectionId ? (
        <CollectionDetail collectionId={collectionId} />
      ) : (
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <p className="rounded-3xl border border-slate-700/40 bg-slate-900/60 px-6 py-4 text-sm text-slate-300">
            Invalid collection identifier.
          </p>
        </div>
      )}
    </>
  );
}






