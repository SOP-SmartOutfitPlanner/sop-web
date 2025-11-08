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
      {/* Background layers */}
      <div className="fixed inset-0 -z-10">
        {/* base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50" />
        {/* radial accents */}
        <div className="pointer-events-none absolute -top-40 -left-20 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_60%)]" />
        <div className="pointer-events-none absolute -bottom-40 -right-24 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.10),transparent_60%)]" />
      </div>

      <ConditionalNavbar />
      <main className="relative">
        {children}
      </main>
    </>
  );
}

