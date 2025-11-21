"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const LazyLenisProvider = dynamic(
  () =>
    import("./lenis-provider").then((mod) => ({
      default: mod.LenisProvider,
    })),
  { ssr: false }
);

export function LenisProviderBoundary({ children }: { children: ReactNode }) {
  return <LazyLenisProvider>{children}</LazyLenisProvider>;
}


