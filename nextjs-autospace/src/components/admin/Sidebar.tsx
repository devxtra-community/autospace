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
  LogOut,
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

      {/* ===== Sidebar ===== */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-sidebar-primary border-r z-50 transform transition-transform duration-300 flex flex-col",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="p-4 text-xl font-bold text-sidebar-primary-foreground flex justify-between items-center border-b border-sidebar-border/20">
          AUTOSPACE
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X size={22} className="text-sidebar-primary-foreground" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-1 mt-4">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-primary text-secondary-foreground"
                    : "text-sidebar-primary-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon
                  size={20}
                  className={cn(
                    "transition-colors",
                    isActive
                      ? "text-secondary-foreground"
                      : "text-sidebar-primary-foreground/50 group-hover:text-sidebar-accent-foreground",
                  )}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border/20">
          <button
            onClick={() => handleLogout()}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sidebar-primary-foreground/70 hover:bg-destructive/10 hover:text-destructive w-full transition-all group"
          >
            <LogOut
              size={20}
              className="text-sidebar-primary-foreground/50 group-hover:text-destructive"
            />{" "}
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
