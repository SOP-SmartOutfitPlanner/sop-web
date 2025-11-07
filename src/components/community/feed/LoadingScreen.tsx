"use client";

interface LoadingScreenProps {
  message?: string;
}

/**
 * Full-screen loading component
 * Used while authentication is initializing
 */
export function LoadingScreen({ message = "Initializing..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
