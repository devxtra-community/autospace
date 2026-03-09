"use client";

import Link from "next/link";
import { ShieldX } from "lucide-react";
import { useEffect, useState } from "react";

export default function GarageBlockedPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFAE8] flex items-center justify-center px-4 overflow-hidden relative">
      {/* Decorative background rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[600px] h-[600px] rounded-full border border-[#F4DA71]/30 animate-ping"
          style={{ animationDuration: "3s" }}
        />
        <div
          className="absolute w-[450px] h-[450px] rounded-full border border-[#F4DA71]/20 animate-ping"
          style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full border border-[#F4DA71]/40 animate-ping"
          style={{ animationDuration: "2s", animationDelay: "1s" }}
        />
      </div>

      {/* Card */}
      <div
        className={`relative z-10 bg-white rounded-3xl shadow-lg border border-[#F4DA71]/40 px-10 py-14 max-w-md w-full text-center transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-red-50 flex items-center justify-center">
              <ShieldX
                size={48}
                className="text-red-500 animate-bounce"
                style={{ animationDuration: "2s" }}
              />
            </div>

            {/* Yellow accent dot */}
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#F4DA71] animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Garage Access Blocked
        </h1>

        {/* Divider with yellow accent */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px flex-1 bg-[#F4DA71]/50" />
          <div className="w-2 h-2 rounded-full bg-[#F4DA71]" />
          <div className="h-px flex-1 bg-[#F4DA71]/50" />
        </div>

        {/* Message */}
        <p className="text-gray-500 text-sm leading-relaxed mb-2">
          <span className="font-semibold text-gray-700">Oops!</span> Your garage
          has been{" "}
          <span className="text-red-500 font-medium">blocked by authority</span>
          .
        </p>
        <p className="text-gray-400 text-sm mb-8">
          You cannot access your garage until the administrator lifts the
          restriction. Please contact support for assistance.
        </p>

        {/* Info badge */}
        <div className="inline-flex items-center gap-2 bg-[#FFFAE8] border border-[#F4DA71] text-[#97800c] text-xs font-medium px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e3be07] animate-pulse" />
          Garage status: Blocked
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard/login"
            className="w-full py-3 px-6 rounded-xl bg-[#F4DA71] hover:bg-[#e3be07] text-gray-900 font-semibold text-sm transition-all duration-200 hover:shadow-md active:scale-95"
          >
            Back to Login
          </Link>

          <a
            href="mailto:support@autospace.com"
            className="w-full py-3 px-6 rounded-xl border border-gray-200 text-gray-500 font-medium text-sm hover:border-[#F4DA71] hover:text-gray-700 transition-all duration-200"
          >
            Contact Support
          </a>
        </div>
      </div>

      {/* Bottom label */}
      <p className="absolute bottom-6 text-xs text-gray-400">
        Autospace · Smart Parking. Seamless Experience.
      </p>
    </div>
  );
}
