"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { getMyCompany } from "@/services/company.service";
import { getMyGarages } from "@/services/garage.service";

import {
  GaragesGrid,
  Garage, //  IMPORTANT FIX
} from "@/components/company/garage/GaragesGrid";

import { GaragesHeader } from "@/components/company/garage/GaragesHeader";

/* ================= TYPES ================= */

type ManagerFilter = "" | "assigned" | "unassigned";

interface GarageResponse {
  data: Garage[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* ================= COMPONENT ================= */

export default function GaragesPage() {
  const [companyId, setCompanyId] = useState<string>("");

  const [garages, setGarages] = useState<Garage[]>([]);

  const [page, setPage] = useState<number>(1);

  const [totalPages, setTotalPages] = useState<number>(1);

  const [search, setSearch] = useState<string>("");

  const [status, setStatus] = useState<string>("");

  const [managerFilter, setManagerFilter] = useState<ManagerFilter>("");

  const [loading, setLoading] = useState<boolean>(false);

  /* ================= FETCH ================= */

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const company = await getMyCompany();

        setCompanyId(company.id);

        const res: GarageResponse = await getMyGarages(
          company.id,
          page,
          6,
          search || undefined,
          status || undefined,
          managerFilter || undefined,
        );

        setGarages(res.data ?? []);

        setTotalPages(res.meta?.totalPages ?? 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, search, status, managerFilter]);

  /* ================= UI ================= */

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <GaragesHeader
        search={search}
        setSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        status={status}
        setStatus={(v) => {
          setStatus(v);
          setPage(1);
        }}
        managerFilter={managerFilter}
        setManagerFilter={(v) => {
          setManagerFilter(v);
          setPage(1);
        }}
      />

      <GaragesGrid garages={garages} companyId={companyId} />

      {/* PAGINATION */}

      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-black">
          Page {page} of {totalPages}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border rounded-lg disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 border rounded-lg disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading && <div>Loading...</div>}
    </div>
  );
}
