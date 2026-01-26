import { getMyCompany } from "@/services/company.service";

export const redirectByRole = async (role: string) => {
  switch (role) {
    case "admin":
      window.location.href = "/admin/dashboard";
      return;

    case "owner": {
      try {
        const company = await getMyCompany();

        if (!company) {
          window.location.href = "/company/create";
        } else if (company.status === "pending") {
          window.location.href = "/company/status";
        } else if (company.status === "rejected") {
          window.location.href = "/company/rejected";
        } else {
          window.location.href = "/company/dashboard";
        }
      } catch {
        window.location.href = "/company/create";
      }
      return;
    }

    case "manager":
      window.location.href = "/garage/dashboard";
      return;

    case "valet":
      window.location.href = "/valet/dashboard";
      return;

    default:
      window.location.href = "/customer/dashboard";
  }
};
