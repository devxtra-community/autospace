"use client";

import { Header } from "@/components//Header";
import { GarageStatCard } from "@/components/garage/GarageStatCard";
import { GarageInfo } from "@/components/garage/GarageInfo";
import { SlotsOverview } from "@/components/garage/SlotsOverview";

export default function GarageDashboardPage() {
  return (
    <>
      <Header title="Garage Dashboard" subtitle="Your garage at a glance" />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <GarageStatCard label="Total Slots" value={50} sub="10 available" />
        <GarageStatCard label="Occupied" value={40} sub="80% usage" />
        <GarageStatCard label="Today’s Bookings" value={27} sub="+12% today" />
        <GarageStatCard label="Revenue Today" value="₹8,450" sub="+5.4%" />
      </div>

      <GarageInfo />
      <SlotsOverview />
    </>
  );
}
