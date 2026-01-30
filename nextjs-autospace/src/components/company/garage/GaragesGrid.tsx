"use client";

import { useEffect, useState } from "react";
import { GarageCard, GarageStatus } from "./GarageCard";
import { getMyGarages } from "@/services/garage.service";
import { getMyCompany } from "@/services/company.service";
import { GarageDetailsModal } from "./GarageDetailsModal";

interface GarageAPI {
  id: string;
  name: string;
  locationName: string;
  status: GarageStatus;
  capacity: number;
  manager?: {
    fullname?: string;
  } | null;
}

export function GaragesGrid() {
  const [garages, setGarages] = useState<GarageAPI[]>([]);
  const [selectedGarageId, setSelectedGarageId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGarages = async () => {
      const company = await getMyCompany();
      const data = await getMyGarages(company.id);
      setGarages(data);
    };

    fetchGarages();
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {garages.map((garage) => (
          <GarageCard
            key={garage.id}
            id={garage.id}
            name={garage.name}
            location={garage.locationName}
            status={garage.status}
            capacity={garage.capacity}
            managerName={garage.manager?.fullname ?? null}
            // ✅ THIS WAS MISSING
            onOpenDetails={(id: string) => setSelectedGarageId(id)}
            onAssignManager={(id: string) => console.log("Assign manager:", id)}
            onEdit={(id: string) => console.log("Edit garage:", id)}
          />
        ))}
      </div>

      {/* Details modal */}
      <GarageDetailsModal
        open={!!selectedGarageId}
        garageId={selectedGarageId}
        onClose={() => setSelectedGarageId(null)}
      />
    </>
  );
}
