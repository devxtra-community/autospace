"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getMe, logoutUser } from "@/lib/auth.api";
import { User, LogOut, Settings } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="flex items-center border border-black bg-white/60 fixed top-0 left-0 right-0 z-50 backdrop-blur-sm w-full justify-between px-18 py-6 max-w-full mx-auto">
      <div className="flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/auto2.png"
            alt="Autospace logo"
            width={40}
            height={40}
            priority
            className="scale-150"
          />
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <button className="px-6 py-2 bg-[var(--secondary-button)] text-black font-medium border border-black rounded-sm hover:bg-[#eac855] transition-colors  active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
          Rent Plot
        </button>
        {isLoggedIn ? (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-center w-10 h-10 bg-white border border-black rounded-full hover:bg-gray-50 transition-colors active:translate-y-[1px]"
            >
              <User size={20} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-black rounded-sm overflow-hidden z-20">
                <div className="p-3 border-b border-black bg-[var(--background)]">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    User Account
                  </p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-[var(--primary)] transition-colors border border-black"
                >
                  <Settings size={18} />
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="px-6 py-2 bg-white text-black font-medium border border-black rounded-lg hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
          >
            Signup
          </Link>
        )}
      </div>
    </nav>
  );
}
