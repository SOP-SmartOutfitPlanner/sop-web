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
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-2 sticky top-24">
        {settingsMenu.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

