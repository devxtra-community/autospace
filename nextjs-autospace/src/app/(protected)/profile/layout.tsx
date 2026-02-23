"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Lock, LogOut, Edit2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileContext } from "@/components/profile/profileContext";

const sidebarItems = [
  {
    name: "Personal Information",
    href: "/profile",
    icon: User,
  },
  {
    name: "Login & Password",
    href: "/profile/security",
    icon: Lock,
  },
  {
    name: "Log Out",
    href: "/logout",
    icon: LogOut,
  },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [userName, setUsername] = useState("user name");

  return (
    <ProfileContext.Provider value={{ userName, setUsername }}>
      <div className="min-h-screen bg-[#FDFDFD] pt-24 pb-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black transition-colors"
            >
              <ChevronLeft size={18} />
              Back to Home
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Sidebar */}
            <aside className="w-full md:w-64 lg:w-80 flex-shrink-0 sticky top-24 self-start bg-white rounded-3xl p-8 shadow-sm border border-gray-50">
              <div className="flex flex-col items-center mb-10">
                <div className="relative mb-4">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-[#F4DA71]/20 flex items-center justify-center ring-4 ring-white shadow-md">
                    <span className="text-3xl font-bold text-[#F4DA71]">
                      {userName.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <button className="absolute bottom-1 right-1 bg-[#F4DA71] p-1.5 rounded-full text-black border-2 border-white hover:bg-[#eac855] transition-colors shadow-sm">
                    <Edit2 size={14} />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{userName}</h2>
                {/* <p className="text-sm text-gray-500 font-medium">user role</p> */}
              </div>

              <nav className="space-y-3">
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[15px] transition-all duration-200 group",
                        isActive
                          ? "bg-[#FFFAE8] text-black font-bold"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                      )}
                    >
                      <item.icon
                        size={20}
                        className={cn(
                          "transition-colors",
                          isActive
                            ? "text-black"
                            : "text-gray-400 group-hover:text-gray-900",
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-50">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProfileContext.Provider>
  );
}
