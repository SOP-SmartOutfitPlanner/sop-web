"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

export function PageLoadingProvider() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    // Hide loading when route changes complete
    setIsLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept all link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link && link.href) {
        // Skip external links and anchor links
        if (link.target === "_blank" || link.href.startsWith("#")) {
          return;
        }

        try {
          const url = new URL(link.href);
          const currentUrl = new URL(window.location.href);

          // Only show loading for same-origin navigation to different pages
          if (
            url.origin === currentUrl.origin &&
            url.pathname !== currentUrl.pathname
          ) {
            setIsLoading(true);

            // Safety timeout - hide loading after 5 seconds max
            loadingTimeoutRef.current = setTimeout(() => {
              setIsLoading(false);
            }, 5000);
          }
        } catch (error) {
          // Invalid URL, ignore
          console.error("Invalid URL:", error);
        }
      }
    };

    // Listen for all clicks
    document.addEventListener("click", handleClick, true);

    // Also listen for browser back/forward buttons
    const handlePopState = () => {
      setIsLoading(true);
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 5000);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-slate-900/95 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6">
        <Image
          src="/loading.gif"
          alt="Loading"
          width={150}
          height={150}
          className="object-contain"
          unoptimized
          priority
        />
        <p className="font-bricolage text-xl text-white font-semibold animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
