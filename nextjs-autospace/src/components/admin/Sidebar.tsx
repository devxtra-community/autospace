"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/lib/auth.api";
import {
  LayoutDashboard,
  Building2,
  Warehouse,
  Users,
  UserRound,
  BarChart3,
  // LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Companies", href: "/admin/companies", icon: Building2 },
  { label: "Garages", href: "/admin/garages", icon: Warehouse },
  { label: "Valets", href: "/admin/valets", icon: Users },
  { label: "Users", href: "/admin/users", icon: UserRound },
  { label: "Overview", href: "/admin/overview", icon: BarChart3 },
];

export function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <>
      {/* ===== Mobile Top Bar ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 border-b bg-sidebar-primary">
        <span className="text-lg font-bold text-sidebar-primary-foreground">
          AUTOSPACE
        </span>
        <button onClick={() => setOpen(true)}>
          <Menu size={24} className="text-sidebar-primary-foreground" />
        </button>
      </div>

      {/* ===== Overlay ===== */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-[#111111] z-50 transform transition-transform duration-300 flex flex-col",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="p-6 pb-2 text-xl font-black text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="tracking-widest uppercase">AUTOSPACE</span>
          </div>
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X size={22} className="text-white/70" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-1 mt-8">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-200",
                  isActive
                    ? "bg-[#F4DA71] text-black"
                    : "text-white/60 hover:text-white hover:bg-white/5",
                )}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-black" : "text-white/40"}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={() => handleLogout()}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-[14px] font-semibold text-white/50 hover:text-white w-full transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/70">
              N
            </div>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
