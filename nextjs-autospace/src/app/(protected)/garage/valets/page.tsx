"use client";

import { ValetsGrid } from "@/components/garage/valets/ValetsGrid";
import { ValetsFilters } from "@/components/garage/valets/ValetsFilters";

export default function GarageValetsPage() {
  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Garage Valets</h1>
        <p className="text-muted-foreground">
          Manage valet availability for today
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ValetsFilters />
      </div>

      {/* Valets Grid */}
      <ValetsGrid />
    </>
  );
}
