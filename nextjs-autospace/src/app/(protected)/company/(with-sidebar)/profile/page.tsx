"use client";

import { Header } from "@/components/company/Header";
import { UserProfile } from "@/components/profile/UserProfile";
import { CompanyInfo } from "@/components/company/CompanyInfo";

export default function CompanyProfilePage() {
  return (
    <>
      <Header title="Company & Profile Settings" />

      <div className="flex flex-col xl:flex-row gap-6 items-start w-full mt-6">
        <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <UserProfile />
        </div>
        <div className="flex-1 w-full">
          <CompanyInfo />
        </div>
      </div>
    </>
  );
}
