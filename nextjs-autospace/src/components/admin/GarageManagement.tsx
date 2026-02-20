"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { GarageTable } from "./GarageTable";

import { GarageProfilePanel } from "./GarageProfilePanel";
import { GarageData } from "./GarageTable";

export function GarageManagement() {
  const [selectedGarage, setSelectedGarage] = useState<GarageData | null>(null);

  const [search, setSearch] = useState("");

  const handleSelectGarage = (garage: GarageData) => {
    setSelectedGarage(garage);
  };

  const handleClosePanel = () => {
    setSelectedGarage(null);
  };

  return (
    <main className="relative p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Garages</h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage and approve registered garages
          </p>
        </div>

        <div className="relative w-80">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            placeholder="Search garages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>
      </div>

      {/* TABLE */}
      <GarageTable
        search={search}
        onSelectGarage={handleSelectGarage}
        selectedGarageId={selectedGarage?.garageId}
      />

      {/* PROFILE PANEL */}
      <GarageProfilePanel garage={selectedGarage} onClose={handleClosePanel} />
    </main>
  );
}
