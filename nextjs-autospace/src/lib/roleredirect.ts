import { getMyCompany } from "@/services/company.service";
import { getMyValet } from "@/services/valet.service";

export const redirectByRole = async (role: string) => {
  switch (role) {
    case "admin":
      window.location.href = "/admin/dashboard";
      return;

    case "owner": {
      try {
        const company = await getMyCompany();

        if (!company) window.location.href = "/company/create";
        else if (company.status === "pending")
          window.location.href = "/company/status";
        else if (company.status === "rejected")
          window.location.href = "/company/rejected";
        else window.location.href = "/company/dashboard";
      } catch {
        window.location.href = "/company/create";
      }
      return;
    }

    case "manager":
      window.location.href = "/garage/dashboard";
      return;

    case "valet": {
      try {
        const valet = await getMyValet();

        console.log("VALET DATA:", valet);

        if (!valet) {
          window.location.href = "/valet/register";
          return;
        }

        if (valet.employmentStatus === "PENDING") {
          window.location.href = "/valet/status";
          return;
        }

        if (valet.employmentStatus === "REJECTED") {
          window.location.href = "/valet/rejected";
          return;
        }

        if (valet.employmentStatus === "ACTIVE") {
          window.location.href = "/valet/dashboard";
          return;
        }
      } catch {
        window.location.href = "/valet/register";
      }

      return;
    }

    default:
      window.location.href = "/dashboard";
  }
};
