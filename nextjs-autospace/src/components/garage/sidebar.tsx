"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  { label: "Dashboard", href: "/garage/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/garage/bookings", icon: Car },
  { label: "Valets", href: "/garage/valets", icon: Users },
  { label: "Slots", href: "/garage/slots", icon: Warehouse },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* ===== Mobile Top Bar ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-white">
        <span className="text-lg font-bold text-gray-900">AUTOSPACE</span>
        <button onClick={() => setOpen(true)}>
          <Menu size={24} className="text-gray-900" />
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
          "fixed top-0 left-0 h-full w-64 bg-white shadow-xl rounded-lg z-50 transform transition-transform duration-300 flex flex-col",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="p-6 text-2xl tracking-tight font-bold text-gray-900 flex justify-between items-center">
          AUTOSPACE
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X
              size={22}
              className="text-gray-900 hover:text-black transition-colors"
            />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-2 mt-6">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive =
              pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-900 hover:bg-black/5",
                )}
              >
                <Icon
                  size={20}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-white" : "text-gray-900",
                  )}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 mt-auto">
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-900 hover:bg-red-500/5 transition-all duration-200 w-full"
            onClick={() => logoutUser()}
          >
            <LogOut size={20} className="text-gray-900" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
