"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useIsClient } from "@/hooks/useIsClient";

export function NavbarAuthSection() {
  const router = useRouter();
  const { user, logout, isInitialized } = useAuthStore();
  const isClient = useIsClient();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Show skeleton during SSR or while auth initializing
  if (!isClient || !isInitialized) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  // Show user menu if logged in
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
            <Avatar className="h-8 w-8  text-black text-sm">
              <AvatarImage src={user?.avatar} alt={user?.displayName} />
              <AvatarFallback>
                {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-46" align="center">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {user?.displayName && (
                <p className="font-medium">{user.displayName}</p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Show login/register buttons if not logged in
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/login")}
        className="font-medium hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
      >
        Log in
      </Button>
      <Button
        size="sm"
        onClick={() => router.push("/register")}
        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
      >
        Register
      </Button>
    </div>
  );
}
