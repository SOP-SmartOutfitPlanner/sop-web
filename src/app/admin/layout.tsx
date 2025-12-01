"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  // Skip auth check for login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Skip auth check for login page
    if (isLoginPage) return;

    // Check if user is authenticated and has admin role
    if (!isAuthenticated || !user) {
      router.push("/admin/login");
      return;
    }

    if (user.role !== "ADMIN" && user.role !== "SuperAdmin") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, user, router, isLoginPage]);

  // For login page, just render children without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading while checking auth for protected pages
  if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SuperAdmin")) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/90 font-medium">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/4 w-[700px] h-[700px] bg-gradient-to-tl from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-teal-500/15 to-blue-500/15 rounded-full blur-3xl" />
      </div>
      <AdminSidebar />
      <div className="ml-64">
        <AdminHeader />
        <main className="pt-24 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

