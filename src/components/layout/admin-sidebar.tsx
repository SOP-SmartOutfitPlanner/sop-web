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
  Bot,
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
    title: "Manage Users",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Manage Items",
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
  },
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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900/40 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl shadow-black/20">
      {/* Logo */}
      <div className="p-6 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl p-2.5 shadow-lg shadow-cyan-500/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <Logo
              variant="rectangle"
              width={100}
              height={30}
              className="brightness-0 invert"
            />
            <p className="text-xs text-cyan-300/70 mt-0.5">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                "text-sm font-medium group",
                isActive
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/40"
                  : "text-white/70 hover:bg-white/10 hover:text-white hover:shadow-md"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-transform duration-200",
                isActive ? "" : "group-hover:scale-110"
              )} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="text-xs text-white/50 text-center font-medium">SOP Admin v1.0</div>
      </div>
    </aside>
  );
}
