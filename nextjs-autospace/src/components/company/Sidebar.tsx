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
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/lib/auth.api";

const navItems = [
  { label: "Dashboard", href: "/company/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/company/bookings", icon: Car },
  { label: "Employees", href: "/company/employees", icon: Users },
  { label: "Garages", href: "/company/garages", icon: Warehouse },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <>
      {/* ===== Mobile Top Bar ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 border-b bg-white border-gray-200">
        <span className="text-lg font-bold text-black">AUTOSPACE</span>
        <button onClick={() => setOpen(true)}>
          <Menu size={24} className="text-black" />
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
          "fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 flex flex-col shadow-sm overflow-y-auto",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="p-6 pb-2 text-xl font-black text-black flex justify-between items-center border-b border-gray-100 mb-2">
          <span className="tracking-widest uppercase">AUTOSPACE</span>
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X size={22} className="text-gray-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-1.5 mt-4">
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
                    ? "bg-[#050505] text-white shadow-sm"
                    : "text-gray-500 hover:text-black hover:bg-gray-100",
                )}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-white" : "text-gray-400"}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Profile Link */}
        <div className="px-4 mt-auto pt-4 border-t border-gray-100 pb-2">
          <Link
            href="/company/profile"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-200",
              pathname === "/company/profile"
                ? "bg-[#050505] text-white shadow-sm"
                : "text-gray-500 hover:text-black hover:bg-gray-100",
            )}
          >
            <User
              size={18}
              className={
                pathname === "/company/profile" ? "text-white" : "text-gray-400"
              }
            />
            Profile & Company
          </Link>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => handleLogout()}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-[14px] font-semibold text-gray-500 hover:text-red-500 hover:bg-red-50 w-full transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-red-100 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:text-red-500 transition-colors">
              <LogOut size={16} strokeWidth={2.5} />
            </div>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
