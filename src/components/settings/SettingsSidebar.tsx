"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Lock, Bell, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const settingsMenu = [
  { href: "/settings/profile", label: "Profile", icon: User },
  { href: "/settings/privacy", label: "Privacy", icon: Lock },
  { href: "/settings/notifications", label: "Notifications", icon: Bell },
  { href: "/settings/security", label: "Security", icon: Shield },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <div className="md:col-span-1">
      <div className="backdrop-blur-md bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border-2 border-cyan-400/25 rounded-2xl p-4 space-y-2 top-66 shadow-lg shadow-cyan-500/10">
        {settingsMenu.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                    : "text-cyan-200 hover:bg-cyan-400/10 hover:text-cyan-100"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
