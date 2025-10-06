/**
 * Optimized Image Component
 * Uses Next.js Image with progressive loading and fallbacks
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallbackSrc = "/placeholder-image.svg",
  width = 400,
  height = 300,
  priority = false,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false); // Reset error state for fallback
    } else {
      setHasError(true);
    }
    onError?.();
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <Skeleton 
          className="absolute inset-0 rounded-lg"
          style={{ width, height }}
        />
      )}
      
      {/* Next.js optimized image */}
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={cn(
          "transition-opacity duration-300 object-cover",
          isLoading ? "opacity-0" : "opacity-100",
          hasError ? "opacity-75 grayscale" : "",
        )}
        onLoad={handleLoad}
        onError={handleError}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />

      {/* Error state overlay */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-xs text-gray-500">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Avatar component with optimized image loading
 */
interface OptimizedAvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallback?: string;
}

export function OptimizedAvatar({
  src,
  alt,
  size = "md",
  fallback,
}: OptimizedAvatarProps) {
  const sizeConfig = {
    sm: { class: "w-8 h-8", size: 32 },
    md: { class: "w-10 h-10", size: 40 }, 
    lg: { class: "w-16 h-16", size: 64 },
    xl: { class: "w-24 h-24", size: 96 },
  };

  const config = sizeConfig[size];
  const fallbackInitial = fallback || alt.charAt(0).toUpperCase();

  if (!src) {
    return (
      <div className={cn(
        "rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium",
        config.class
      )}>
        {fallbackInitial}
      </div>
    );
  }

  return (
    <div className={cn("rounded-full overflow-hidden", config.class)}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={config.size}
        height={config.size}
        className="rounded-full"
        fallbackSrc="/placeholder-avatar.svg"
      />
    </div>
  );
}