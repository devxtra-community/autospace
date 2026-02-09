"use client";

import { GarageFloors } from "@/components/garage/GarageFloors";
import { SlotsHeader } from "@/components/garage/slots/SlotsHeader";
import { SlotsLegend } from "@/components/garage/slots/SlotsLegend";

export default function GarageSlotsPage() {
  return (
    <div className="space-y-6">
      <SlotsHeader />
      <SlotsLegend />
      <GarageFloors />
    </div>
  );
}
