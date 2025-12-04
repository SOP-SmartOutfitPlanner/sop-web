"use client";

import { motion } from "framer-motion";

interface FeedLoadingProps {
  children: React.ReactNode;
}

export function FeedLoading({ children }: FeedLoadingProps) {
  return <div className="space-y-6">{children}</div>;
}

interface FeedErrorProps {
  message?: string;
}

export function FeedError({ message }: FeedErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-red-500 mb-4">
        <svg
          className="w-16 h-16 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bricolage font-bold mb-2">Failed to load feed</h3>
      <p className="text-muted-foreground">{message || "Something went wrong"}</p>
    </div>
  );
}

interface FeedEmptyProps {
  searchQuery?: string;
}

export function FeedEmpty({ searchQuery }: FeedEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8 text-white/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
      
      {/* Description */}
      <p className="text-sm text-white/50">
        {searchQuery ? "Try adjusting your filters" : "Be the first to share something!"}
      </p>
    </div>
  );
}

export function FeedEndIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-8 text-muted-foreground"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50">
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span className="font-medium">You&apos;re all caught up!</span>
      </div>
    </motion.div>
  );
}

export function FeedLoadingMore() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center py-8"
    >
      <svg
        className="w-8 h-8 animate-spin text-primary"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="ml-3 text-muted-foreground">Loading more posts...</span>
    </motion.div>
  );
}

