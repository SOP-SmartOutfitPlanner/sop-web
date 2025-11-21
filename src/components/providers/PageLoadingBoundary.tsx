"use client";

import dynamic from "next/dynamic";

const LazyPageLoadingProvider = dynamic(
  () =>
    import("./page-loading-provider").then((mod) => ({
      default: mod.PageLoadingProvider,
    })),
  { ssr: false }
);

export function PageLoadingBoundary() {
  return <LazyPageLoadingProvider />;
}


