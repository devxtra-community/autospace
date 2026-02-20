"use client";

import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { useEffect, useState, useCallback } from "react";

import { getGarageAdmin } from "@/services/admin.service";

export type GarageStatus = "pending" | "active" | "rejected";

export interface GarageData {
  garageId: string;

  garageCode: string;

  name: string;

  managerName: string;

  contactEmail: string;

  contactPhone: string;

  locationName: string;

  capacity: number;

  floorCount: string;

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

const statusStyles: Record<string, string> = {
  active: "bg-[#E7F7EF] text-[#0D9488]",

  pending: "bg-[#FEF3C7] text-[#D97706]",

  rejected: "bg-[#FEE2E2] text-[#EF4444]",
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getGarageAdmin();

      if (res?.success) {
        setGarages(res.data);

        setTotalPages(res.meta.totalPages);

        setTotal(res.meta.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
      <table className="w-full">
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

        <tbody>
          {loading && (
            <tr>
              <td colSpan={3} className="py-12 text-center">
                Loading garages...
              </td>
            </tr>
          )}

          {garages.map((garage) => (
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
                    "px-3 py-1 rounded-full text-xs font-bold",
                    statusStyles[garage.status],
                  )}
                >
                  {garage.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* pagination */}

      <div className="px-6 py-4 border-t border-border flex justify-between">
        <span className="text-sm text-muted-foreground">
          Showing {garages.length} of {total}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-2 border rounded-lg"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="p-2 border rounded-lg"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
