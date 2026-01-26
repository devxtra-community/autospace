"use client";

import { useEffect, useState } from "react";
import { getMyGarages } from "@/services/garage.service";
import { getMyCompany } from "@/services/company.service";
import { GarageCard, GarageStatus } from "./GarageCard";

interface GarageAPI {
  id: string;
  name: string;
  locationName: string;
  status: GarageStatus;
  capacity: number;
  managerId?: string | null;
}

export function GaragesGrid() {
  const [garages, setGarages] = useState<GarageAPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGarages = async () => {
      try {
        const company = await getMyCompany();
        const data = await getMyGarages(company.id);
        setGarages(data);
      } catch (err) {
        console.error("Failed to fetch garages", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGarages();
  }, []);

  if (loading) {
    return <div className="text-muted-foreground">Loading garages...</div>;
  }

  if (!garages.length) {
    return <div className="text-muted-foreground">No garages found.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {garages.map((garage) => (
        <GarageCard
          key={garage.id}
          name={garage.name}
          location={garage.locationName} // ✅ correct
          status={garage.status}
          slots={0} // ⚠️ temporary until slots implemented
          total={garage.capacity} // ✅ capacity is total slots
          manager={garage.managerId || undefined}
        />
      ))}
    </div>
  );
}
