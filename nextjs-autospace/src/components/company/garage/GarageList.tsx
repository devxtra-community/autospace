"use client";

import { useState } from "react";
import { GarageCard } from "./GarageCard";
import { GarageDetailsModal } from "./GarageDetailsModal";
import { GarageEditModal } from "./GarageEditModal";

// Match the Garage shape used in GarageDetailsModal / GarageEditModal
interface Garage {
  id: string;
  name: string;
  location: string;
  status: "pending" | "active" | "rejected";
  capacity: number;
  valetAvailable: boolean; // required, not optional
  contactEmail?: string;
  contactPhone?: string;
  managerName?: string | null;
}

export function GarageList({ garages }: { garages: Garage[] }) {
  const [selectedGarageId, setSelectedGarageId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedGarage, setSelectedGarage] = useState<Garage | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {garages.map((g) => (
          <GarageCard
            key={g.id}
            id={g.id}
            name={g.name}
            location={g.location}
            status={g.status}
            capacity={g.capacity}
            managerName={g.managerName ?? null}
            onOpenDetails={(id) => setSelectedGarageId(id)}
            onAssignManager={(id) => console.log("Assign manager:", id)}
            onEdit={(id) => {
              const garage = garages.find((x) => x.id === id);
              if (!garage) return;

              setSelectedGarage(garage);
              setEditOpen(true);
            }}
          />
        ))}
      </div>

      <GarageDetailsModal
        open={!!selectedGarageId}
        garageId={selectedGarageId}
        onClose={() => setSelectedGarageId(null)}
      />

      <GarageEditModal
        open={editOpen}
        garage={selectedGarage}
        onClose={() => {
          setEditOpen(false);
          setSelectedGarage(null);
        }}
        onUpdated={() => window.location.reload()}
      />
    </>
  );
}
