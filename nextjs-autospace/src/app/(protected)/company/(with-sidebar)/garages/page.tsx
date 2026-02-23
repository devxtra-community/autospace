"use client";

import { useEffect, useState } from "react";

import { getMyCompany } from "@/services/company.service";
import { getMyGarages } from "@/services/garage.service";

import {
  GaragesGrid,
  Garage, // ✅ IMPORTANT FIX
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

      <div className="flex justify-center gap-4">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {loading && <div>Loading...</div>}
    </div>
  );
}
