"use client";

import { useEffect, useState } from "react";
import { getMe, logoutUser } from "@/lib/auth.api";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getMe();
        if (res.data.success) {
          setIsLoggedIn(true);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out flex justify-center ${
        isScrolled ? "pt-0" : "pt-6"
      }`}
    >
      <nav
        className={`flex items-center justify-between transition-all duration-500 ease-in-out ${
          isScrolled
            ? "w-full bg-white/90 backdrop-blur-md px-8 py-4 shadow-sm border-b border-gray-100"
            : "w-[800px] max-w-[95%] bg-[#2a2a2a]/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white/10"
        }`}
      >
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <span
              className={`text-xl font-zalando font-extrabold tracking-tight transition-colors ${isScrolled ? "text-gray-900" : "text-white"}`}
            >
              Autospace
            </span>
          </Link>
        </div>

        {/* Center Links */}
        <div
          className={`hidden md:flex items-center gap-8 text-sm transition-colors ${isScrolled ? "text-gray-600" : "text-gray-100"}`}
        >
          {
            isLoggedIn ? (
              <>
                <Link
                  href="/bookings"
                  className="flex items-center gap-1.5 hover:text-gray-600 transition-colors"
                >
                  Bookings
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 hover:text-gray-600 transition-colors"
                >
                  Profile
                </Link>
              </>
            ) : null // Empty center if not logged in based on your request
          }
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/login"
            className="px-5 py-2 bg-[#F4DA71] text-black text-sm font-medium rounded-full hover:bg-[#eac855] transition-colors shadow-sm"
          >
            Mangement
          </Link>

          {!isLoggedIn ? (
            <Link
              href="/login"
              className={`text-sm font-medium transition-colors ${isScrolled ? "text-gray-600 hover:text-black" : "text-gray-300 hover:text-white"}`}
            >
              Log In
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-full border ${isScrolled ? "border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-gray-700" : "border-white/20 text-white hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50"}`}
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
