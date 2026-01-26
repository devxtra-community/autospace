"use client";

import { SlotsHeader } from "@/components/garage/slots/SlotsHeader";
import { SlotsLegend } from "@/components/garage/slots/SlotsLegend";
import { SlotsGrid } from "@/components/garage/slots/SlotsGrid";

export default function GarageSlotsPage() {
  return (
    <div className="space-y-6">
      <SlotsHeader />
      <SlotsLegend />
      <SlotsGrid />
    </div>
  );
}
