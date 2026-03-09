"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/* ✅ FIXED TYPE */
export type ManagerFilter = "" | "assigned" | "unassigned";

interface Props {
  search: string;
  setSearch: (v: string) => void;

  status: string;
  setStatus: (v: string) => void;

  managerFilter: ManagerFilter;
  setManagerFilter: (v: ManagerFilter) => void;
}

export function GaragesHeader({
  search,
  setSearch,
  status,
  setStatus,
  managerFilter,
  setManagerFilter,
}: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold">Garages Overview</h1>
        <p className="text-muted-foreground text-sm">
          Manage garages and assign managers
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search garages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[220px]"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={managerFilter}
          onChange={(e) => setManagerFilter(e.target.value as ManagerFilter)}
          className="border rounded-md px-3 py-2"
        >
          <option value="">All Managers</option>
          <option value="assigned">Assigned</option>
          <option value="unassigned">Unassigned</option>
        </select>

        <Link href="/company/garages/create">
          <Button className="bg-black hover:bg-gray-700">Add Garage + </Button>
        </Link>
      </div>
    </div>
  );
}
