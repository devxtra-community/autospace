"use client";

import { ValetsGrid } from "@/components/garage/valets/ValetsGrid";

export default function GarageValetsPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Garage Valets</h1>
        <p className="text-muted-foreground">
          Manage valet availability for today
        </p>
      </div>

      <ValetsGrid />
    </>
  );
}
