"use client";

import { Header } from "@/components/company/Header";
import { UserProfile } from "@/components/profile/UserProfile";
import { CompanyInfo } from "@/components/company/CompanyInfo";

export default function CompanyProfilePage() {
  return (
    <>
      <Header title="Company & Profile Settings" />

      <div className="max-w-4xl space-y-6">
        <UserProfile />
        <CompanyInfo />
      </div>
    </>
  );
}
