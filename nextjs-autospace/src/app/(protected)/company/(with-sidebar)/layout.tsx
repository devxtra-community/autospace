"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/company/Sidebar";
import { getMyCompany } from "@/services/company.service";

export default function CompanyWithSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const validateCompanyAccess = async () => {
      try {
        const company = await getMyCompany();

        if (!company) {
          router.replace("/company/create");
        } else if (company.status === "pending") {
          router.replace("/company/status");
        } else if (company.status === "rejected") {
          router.replace("/company/rejected");
        }
        // ACTIVE → allowed
      } catch {
        router.replace("/company/create");
      }
    };

    validateCompanyAccess();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar only for ACTIVE companies */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 md:ml-64 p-6">{children}</div>
    </div>
  );
}
