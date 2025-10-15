"use client";

import { useEffect } from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    // Disable scroll on mount
    const html = document.documentElement;
    const body = document.body;
    
    html.style.overflow = "hidden";
    html.style.height = "100vh";
    body.style.overflow = "hidden";
    body.style.height = "100vh";
    
    // Re-enable on unmount
    return () => {
      html.style.overflow = "";
      html.style.height = "";
      body.style.overflow = "";
      body.style.height = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {children}
    </div>
  );
}

