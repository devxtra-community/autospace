"use client";

import { UserProfile } from "@/components/profile/UserProfile";

export default function AdminProfilePage() {
  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Section */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Admin Profile
          </h1>
          <div className="h-px bg-gray-200 w-full mb-8 mt-5"></div>
        </div>

        {/* Profile Content */}
        <div className="flex justify-center w-full mt-6">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <UserProfile />
          </div>
        </div>
      </div>
    </div>
  );
}
