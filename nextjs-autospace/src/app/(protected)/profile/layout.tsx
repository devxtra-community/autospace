"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  // Link as LinkIcon,
  CalendarDays,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    name: "Personal Info",
    href: "/profile",
    icon: User,
  },
  {
    name: "My Booking",
    href: "/profile/bookings",
    icon: CalendarDays,
  },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar */}
        <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 sticky top-24 self-start">
          <div className="mb-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              <ChevronLeft size={16} />
              Back to Home
            </Link>
          </div>

          <div className="bg-gray-50 border border-black rounded-sm p-4">
            <h2 className="text-xl font-bold mb-6 px-2">
              User profile management
            </h2>
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-sm text-sm font-medium transition-all group",
                      isActive
                        ? "bg-[var(--primary)] text-black border border-black"
                        : "text-gray-600 hover:bg-white hover:text-black",
                    )}
                  >
                    <item.icon
                      size={18}
                      className={cn(
                        isActive
                          ? "text-black"
                          : "text-gray-400 group-hover:text-black",
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white border border-black rounded-sm p-6 md:p-10 min-h-[600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
