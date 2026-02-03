"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Car,
  Users,
  Warehouse,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/lib/auth.api";

const navItems = [
  { label: "Dashboard", href: "/company/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/company/bookings", icon: Car },
  { label: "Valets", href: "/company/valets", icon: Users },
  { label: "Garages", href: "/company/garages", icon: Warehouse },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <>
      {/* ===== Mobile Top Bar ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 border-b bg-sidebar-primary">
        <span className="text-lg font-bold text-muted">AUTOSPACE</span>
        <button onClick={() => setOpen(true)}>
          <Menu size={24} className="text-muted" />
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
        <div className="p-4 text-xl font-bold text-muted flex justify-between items-center border-b">
          AUTOSPACE
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X size={22} className="text-muted" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-1 mt-2">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 rounded-sm text-md font-medium text-muted hover:bg-secondary transition"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={() => handleLogout()}
            className="flex items-center gap-2 px-4 py-2 rounded-sm text-md text-muted hover:bg-secondary hover:text-foreground w-full"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
