"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "ADMIN" || user.role === "SuperAdmin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/wardrobe");
      }
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    
    html.style.overflow = "hidden";
    html.style.height = "100vh";
    body.style.overflow = "hidden";
    body.style.height = "100vh";
    
    return () => {
      html.style.overflow = "";
      html.style.height = "";
      body.style.overflow = "";
      body.style.height = "";
    };
  }, []);

  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {children}
    </div>
  );
}

