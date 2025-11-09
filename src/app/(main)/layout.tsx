"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ConditionalNavbar } from "@/components/layout/conditional-navbar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <ConditionalNavbar />
      <main className="relative">
        {children}
      </main>
    </>
  );
}

