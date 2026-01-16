"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMyCompany } from "@/services/company.service";

export default function CompanyDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const checkCompany = async () => {
      try {
        const company = await getMyCompany();

        if (!company) {
          router.replace("/company/create");
          return;
        }

        if (company.status === "pending") {
          router.replace("/company/status");
          return;
        }

        if (company.status === "rejected") {
          router.replace("/company/rejected");
          return;
        }

        // ACTIVE → stay here
      } catch {
        // fallback safety
        router.replace("/login");
      }
    };

    checkCompany();
  }, [router]);

  return (
    <div>
      <h1>Company Dashboard</h1>
      <p>Your company is active.</p>
    </div>
  );
}
