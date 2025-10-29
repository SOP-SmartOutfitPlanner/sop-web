"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { Shield, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, user, isAuthenticated } = useAuthStore();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (isAuthenticated && user && (user.role === "ADMIN" || user.role === "SuperAdmin")) {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await login(email, password);
    
    if (success) {
      // Check if user is admin
      const currentUser = useAuthStore.getState().user;
      
      if (currentUser?.role === "ADMIN" || currentUser?.role === "SuperAdmin") {
        toast.success("Đăng nhập thành công!");
        router.push("/admin/dashboard");
      } else {
        // Not an admin - logout and show error
        useAuthStore.getState().logout();
        toast.error(`Only ADMIN accounts can access this portal! Your role: ${currentUser?.role || "USER"}`);
      }
    } else {
      // Check for specific error message
      const { error } = useAuthStore.getState();
      if (error?.includes("admin login portal")) {
        toast.error("This account is not authorized for admin access");
      } else {
        toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="space-y-4 text-center pb-4">
          {/* Admin Badge */}
          <div className="flex justify-center mb-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-4">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          
          {/* Logo */}
          <div className="flex justify-center">
            <Logo variant="rectangle" width={120} height={40} />
          </div>
          
          <CardTitle className="text-2xl font-bold text-gray-900">
            Admin Portal
          </CardTitle>
          <CardDescription className="text-gray-600">
            Đăng nhập để quản lý hệ thống
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@sop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Mật khẩu
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 h-11"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Đăng nhập Admin
                </>
              )}
            </Button>
          </form>

          {/* Back to User Site */}
          <div className="mt-6 text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/login")}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Quay lại trang đăng nhập người dùng
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

