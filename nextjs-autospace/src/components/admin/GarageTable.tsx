"use client";

import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";
import { getGarageAdmin } from "@/services/admin.service";

export type GarageStatus = "pending" | "active" | "rejected" | "blocked";

export interface GarageData {
  garageId: string;
  garageCode: string;
  name: string;
  managerName: string;
  contactEmail: string;
  contactPhone: string;
  locationName: string;
  capacity: number;
  floorCount: number;
  slotCount: number;
  valetCount: number;
  status: GarageStatus;
  createdAt: string;
}

interface Props {
  search?: string;
  onSelectGarage: (garage: GarageData) => void;
  selectedGarageId?: string;
}

const statusStyles: Record<GarageStatus, string> = {
  active: "bg-[#E7F7EF] text-[#0D9488]",
  pending: "bg-[#FEF3C7] text-[#D97706]",
  rejected: "bg-[#FEE2E2] text-[#EF4444]",
  blocked: "bg-[#FEE2E2] text-[#EF4444]",
};

export function GarageTable({
  search,
  onSelectGarage,
  selectedGarageId,
}: Props) {
  const [garages, setGarages] = useState<GarageData[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<string>("all");

  const limit = 8;

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getGarageAdmin({
        page,
        limit,
        search: search || undefined,
        status: status !== "all" ? status : undefined,
      });

      if (res?.success) {
        interface GarageAdminResponse {
          garageId: string;
          garageCode: string;
          name: string;
          managerName: string;
          contactEmail: string;
          contactPhone: string;
          locationName: string;
          capacity: number;
          floorCount: number;
          slotCount: number;
          valetCount: number;
          status: string;
          createdAt: string;
        }

        const safeData: GarageData[] = (res.data as GarageAdminResponse[]).map(
          (g) => ({
            garageId: g.garageId,
            garageCode: g.garageCode,
            name: g.name,
            managerName: g.managerName,
            contactEmail: g.contactEmail,
            contactPhone: g.contactPhone,
            locationName: g.locationName,
            capacity: g.capacity,
            floorCount: g.floorCount,
            slotCount: g.slotCount,
            valetCount: g.valetCount,
            status: g.status.toLowerCase() as GarageStatus,
            createdAt: g.createdAt,
          }),
        );

        setGarages(safeData);
        setTotalPages(res.meta?.totalPages || 1);
        setTotal(res.meta?.total || 0);
      }
    } catch (err) {
      console.error("Fetch garages failed", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-b border-border">
        <div className="text-sm text-muted-foreground">
          Showing {garages.length} of {total}
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-6 py-5 text-xs font-bold uppercase text-muted-foreground">
                Garage Code
              </th>
              <th className="px-6 py-5 text-xs font-bold uppercase text-muted-foreground">
                Garage Name
              </th>
              <th className="px-6 py-5 text-xs font-bold uppercase text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {loading && (
              <tr>
                <td colSpan={3} className="py-12 text-center">
                  Loading garages...
                </td>
              </tr>
            )}

            {!loading &&
              garages.map((garage) => (
                <tr
                  key={garage.garageId}
                  onClick={() => onSelectGarage(garage)}
                  className={cn(
                    "cursor-pointer hover:bg-muted transition",
                    selectedGarageId === garage.garageId && "bg-muted",
                  )}
                >
                  <td className="px-6 py-4 font-mono">#{garage.garageCode}</td>

                  <td className="px-6 py-4 flex items-center gap-3">
                    <Building2 size={18} />
                    {garage.name}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold capitalize",
                        statusStyles[garage.status],
                      )}
                    >
                      {garage.status}
                    </span>
                  </td>
                </tr>
              ))}

            {!loading && garages.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="py-12 text-center text-muted-foreground"
                >
                  No garages found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="px-6 py-4 border-t border-border flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border rounded-lg disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>

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
