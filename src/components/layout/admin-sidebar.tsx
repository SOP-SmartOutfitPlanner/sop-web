"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Shirt,
  Tags,
  Shield,
  Flag,
  Bot
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },
  {
    title: "Quản lý Users",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Quản lý Items",
    icon: Shirt,
    href: "/admin/items",
  },
  {
    title: "Categories",
    icon: Tags,
    href: "/admin/categories",
  },
  {
    title: "Occasions",
    icon: Tags,
    href: "/admin/occasion",
  },
  {
    title: "Seasons",
    icon: Tags,
    href: "/admin/seasons",
  },
  {
    title: "Styles",
    icon: Tags,
    href: "/admin/styles",
  },
  {
    title: "Reports",
    icon: Flag,
    href: "/admin/reports",
  },
  {
    title: "AI Settings",
    icon: Bot,
    href: "/admin/ai-settings",
  }
  // {
  //   title: "Thống kê",
  //   icon: BarChart3,
  //   href: "/admin/analytics",
  // },
  // {
  //   title: "Cài đặt",
  //   icon: Settings,
  //   href: "/admin/settings",
  // },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-2">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <Logo variant="rectangle" width={100} height={30} className="brightness-0 invert" />
            <p className="text-xs text-slate-400 mt-0.5">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                "text-sm font-medium",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-500 text-center">
          SOP Admin v1.0
        </div>
      </div>
    </aside>
  );
}

