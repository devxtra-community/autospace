"use client";

import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";
import { getCompanyAdmin } from "@/services/admin.service";

/* ================= TYPES ================= */

export type CompanyStatus = "pending" | "active" | "rejected";

export interface CompanyData {
  companyId: string;
  companyCode: string;
  companyName: string;
  ownerName?: string;
  contactEmail: string;
  contactPhone: string;
  businessLocation: string;
  garagesCount: number;
  status: CompanyStatus;
  createdAt: string;
}

interface CompanyApiResponse {
  companyId: string;
  companyCode: string;
  companyName: string;
  ownerName?: string;
  contactEmail: string;
  contactPhone: string;
  businessLocation: string;
  garagesCount?: number;
  status: string;
  createdAt: string;
}

interface Props {
  onSelectCompany: (company: CompanyData) => void;
  selectedCompanyId?: string;
  search?: string;
}

/* ================= STATUS STYLES ================= */

const statusStyles: Record<CompanyStatus, string> = {
  active: "bg-[#E7F7EF] text-[#0D9488]",
  pending: "bg-[#FEF3C7] text-[#D97706]",
  rejected: "bg-[#FEE2E2] text-[#EF4444]",
};

/* ================= COMPONENT ================= */

export function CompanyTable({
  onSelectCompany,
  selectedCompanyId,
  search,
}: Props) {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  /* ================= FETCH ================= */

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getCompanyAdmin();

      if (res?.success) {
        const safeData: CompanyData[] = (res.data || []).map(
          (c: CompanyApiResponse): CompanyData => ({
            companyId: c.companyId,
            companyCode: c.companyCode,
            companyName: c.companyName,
            ownerName: c.ownerName,
            contactEmail: c.contactEmail,
            contactPhone: c.contactPhone,
            businessLocation: c.businessLocation,
            garagesCount: c.garagesCount ?? 0,
            status: (c.status || "pending").toLowerCase() as CompanyStatus,
            createdAt: c.createdAt,
          }),
        );

        setCompanies(safeData);
        setTotalPages(res.meta?.totalPages || 1);
        setTotal(res.meta?.total || safeData.length);
      }
    } catch (err) {
      console.error("Fetch companies failed", err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= UI ================= */

  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">
                Company Code
              </th>

              <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">
                Company Name
              </th>

              <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {loading && (
              <tr>
                <td colSpan={3} className="py-12 text-center">
                  Loading companies...
                </td>
              </tr>
            )}

            {!loading &&
              companies.map((company) => (
                <tr
                  key={company.companyId}
                  onClick={() => onSelectCompany(company)}
                  className={cn(
                    "cursor-pointer hover:bg-muted transition",
                    selectedCompanyId === company.companyId && "bg-muted",
                  )}
                >
                  {/* CODE */}
                  <td className="px-6 py-4 font-mono">
                    #{company.companyCode}
                  </td>

                  {/* NAME */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                        <Building2 size={18} />
                      </div>

                      <span className="font-semibold">
                        {company.companyName}
                      </span>
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-3 py-1 text-xs rounded-full font-bold capitalize",
                        statusStyles[company.status],
                      )}
                    >
                      {company.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}

      <div className="flex justify-between items-center px-6 py-4 border-t border-border">
        <span className="text-sm text-muted-foreground">
          Showing {companies.length} of {total}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border rounded-lg disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="px-3 text-sm font-semibold">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 border rounded-lg disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
