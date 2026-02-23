"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Garage = {
  id: string;
  garageCode: string;
  name: string;
  locationName: string;
  capacity: number;
  status: "ACTIVE" | "PENDING" | "REJECTED";
};

export function GaragesTable() {
  // replace with real API
  const [garages] = useState<Garage[]>([
    {
      id: "1",
      garageCode: "GRG‑001",
      name: "Downtown Garage",
      locationName: "New York",
      capacity: 120,
      status: "ACTIVE",
    },
  ]);

  const [page, setPage] = useState(1);
  const totalPages = 1;

  const statusStyle = {
    ACTIVE: "text-green-600",
    PENDING: "text-yellow-600",
    REJECTED: "text-red-600",
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* HEADER */}

          <thead className="bg-muted border-b border-border">
            <tr className="text-left">
              <th className="px-4 py-3 text-xs font-bold uppercase">Code</th>

              <th className="px-4 py-3 text-xs font-bold uppercase">Garage</th>

              <th className="px-4 py-3 text-xs font-bold uppercase">
                Location
              </th>

              <th className="px-4 py-3 text-xs font-bold uppercase">
                Capacity
              </th>

              <th className="px-4 py-3 text-xs font-bold uppercase">Status</th>
            </tr>
          </thead>

          {/* BODY */}

          <tbody className="divide-y divide-border">
            {garages.map((garage) => (
              <tr
                key={garage.id}
                className="hover:bg-muted cursor-pointer transition"
              >
                <td className="px-4 py-3 font-mono">{garage.garageCode}</td>

                <td className="px-4 py-3 flex items-center gap-3">
                  <Building2 size={18} />

                  {garage.name}
                </td>

                <td className="px-4 py-3 text-muted-foreground">
                  {garage.locationName}
                </td>

                <td className="px-4 py-3">{garage.capacity}</td>

                <td
                  className={cn(
                    "px-4 py-3 font-semibold",
                    statusStyle[garage.status],
                  )}
                >
                  {garage.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}

      <div className="flex justify-between items-center p-4">
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
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
