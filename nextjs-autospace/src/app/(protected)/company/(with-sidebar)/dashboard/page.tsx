"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMyCompany } from "@/services/company.service";

import { Header } from "@/components/company/Header";
import { StatCard } from "@/components/company/StatCard";
import { CompanyInfo } from "@/components/company/CompanyInfo";
import { UserProfile } from "@/components/profile/UserProfile";

export default function CompanyDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const checkCompany = async () => {
      try {
        const company = await getMyCompany();
        if (!company) router.replace("/company/create");
        else if (company.status === "pending")
          router.replace("/company/status");
        else if (company.status === "rejected")
          router.replace("/company/rejected");
      } catch (err) {
        console.error("Failed to check company", err);
      }
    };

    checkCompany();
  }, [router]);

  return (
    <>
      <Header />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Valets" value={12} sub="+2 from yesterday" />
        <StatCard
          label="Today's Bookings"
          value={87}
          sub="+15% from last week"
        />
        <StatCard label="Total Garages" value={5} sub="3 active" />
        <StatCard
          label="Monthly Revenue"
          value="$24,580"
          sub="+8.2% from last month"
        />
      </div>

      <UserProfile />
      <CompanyInfo />
    </>
  );
}
