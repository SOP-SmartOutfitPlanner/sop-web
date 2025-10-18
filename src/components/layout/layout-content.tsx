"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";

interface LayoutContentProps {
  children: React.ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    // Landing page: no navbar, no container, no background gradient
    return <>{children}</>;
  }

  // Other pages: with navbar, container, and background gradient
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
