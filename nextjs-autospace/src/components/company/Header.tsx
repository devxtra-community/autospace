"use client";

import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold">Company Dashboard</h1>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-secondary"
        >
          <User size={20} />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-44 bg-card border rounded-md shadow-lg z-50">
            <button
              onClick={() => router.push("/profile")}
              className="w-full px-4 py-2 text-left hover:bg-muted"
            >
              My Profile
            </button>
            <button
              onClick={() => router.push("/company/profile")}
              className="w-full px-4 py-2 text-left hover:bg-muted"
            >
              Company Profile
            </button>
            <button
              onClick={() => router.push("/logout")}
              className="w-full px-4 py-2 text-left text-red-500 hover:bg-muted"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
