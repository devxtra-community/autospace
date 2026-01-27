"use client";

import { UserManagement } from "@/components/admin/UserManagement";

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen p-8 md:p-12 font-sans bg-[#FFFAE8]">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <h1 className="text-3xl font-black tracking-tight text-[#1A1C1E]">
            User <span className="text-[#e3be07]">Management</span>
          </h1>
          <p className="mt-2 text-gray-500 font-medium">
            View and manage all registered users on the platform.
          </p>
        </header>

        <UserManagement />
      </div>
    </div>
  );
}
