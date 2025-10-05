"use client";
import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Get Google Client ID from environment variable
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.error(
    "Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable. " +
    "Please add it to your .env.local file."
  );
}

export function GoogleAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Don't render provider if client ID is missing
  if (!GOOGLE_CLIENT_ID) {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}


