import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon" | "rectangle";
  className?: string;
  width?: number;
  height?: number;
  showGlow?: boolean;
}

/**
 * Logo component for SOP (Smart Outfit Planner)
 *
 * @param variant - "full" for logo with text, "icon" for round logo, "rectangle" for horizontal logo
 * @param className - Additional CSS classes
 * @param width - Custom width (optional)
 * @param height - Custom height (optional)
 * @param showGlow - Show glow effect (optional)
 */
export function Logo({
  variant = "icon",
  className,
  width,
  height,
  showGlow = false,
}: LogoProps) {
  if (variant === "full") {
    return (
      <div
        className={cn(
          "relative inline-flex flex-col items-center gap-6",
          className
        )}
        suppressHydrationWarning
      >
        {/* Logo with glow */}
        <div className="relative inline-block" suppressHydrationWarning>
          {showGlow && (
            <div className="absolute inset-0 blur-2xl opacity-30 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-full animate-pulse" />
          )}
          <div className="relative z-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 p-2 shadow-2xl">
            <Image
              src="/sop-logo.png"
              alt="SOP"
              width={width || 300}
              height={height || 300}
              className={cn(
                "object-contain rounded-full",
                "transition-all duration-500 ease-out"
              )}
              priority
            />
          </div>
        </div>

        {/* Text */}
        <div className="text-center px-4" suppressHydrationWarning>
          <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[0.15em] leading-tight uppercase">
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent drop-shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              Smart Outfit Planner
            </span>
          </h1>
          <div className="mt-3 h-1 w-40 mx-auto bg-gradient-to-r from-transparent via-cyan-500 to-transparent rounded-full animate-in fade-in duration-1000 delay-500 shadow-lg shadow-cyan-500/50" />
        </div>
      </div>
    );
  }

  // Rectangle variant - for header/navbar
  if (variant === "rectangle") {
    return (
      <div
        className={cn(
          "relative inline-flex items-center justify-center",
          className
        )}
        suppressHydrationWarning
      >
        {showGlow && (
          <div
            className="absolute inset-0 blur-xl opacity-40 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg scale-110"
            suppressHydrationWarning
          />
        )}
        <div className="relative z-10" suppressHydrationWarning>
          <Image
            src="/SOP-logo (2).png"
            alt="Smart Outfit Planner"
            width={width || 145}
            height={height || 48}
            className={cn(
              "object-contain rounded-3xl",
              "transition-all duration-300"
            )}
            priority
          />
        </div>
      </div>
    );
  }

  // Icon variant - round logo for login/auth
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
      suppressHydrationWarning
    >
      {showGlow && (
        <div className="absolute inset-0 blur-xl opacity-40 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full scale-110" />
      )}
      <div className="relative z-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 p-1 shadow-lg shadow-cyan-500/50">
        <Image
          src="/sop-logo.png"
          alt="SOP"
          width={width || 50}
          height={height || 50}
          className={cn(
            "object-contain rounded-full",
            "transition-all duration-300"
          )}
          priority
        />
      </div>
    </div>
  );
}
