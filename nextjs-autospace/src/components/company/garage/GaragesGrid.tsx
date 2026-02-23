"use client";

import { useState } from "react";
import { GarageCard, GarageStatus } from "./GarageCard";
import { GarageDetailsModal } from "./GarageDetailsModal";
import { GarageEditModal } from "./GarageEditModal";
import { AssignManagerModal } from "./AssignManagerModal";

export interface Garage {
  id: string;
  name: string;
  locationName?: string | null;
  status?: GarageStatus | null;
  capacity?: number | null;
  garageRegistrationNumber?: string | null;
  valetAvailable?: boolean | null;
  manager?: {
    id: string;
    fullname: string;
  } | null;
}

interface Props {
  garages: Garage[];
  companyId: string;
}

export function GaragesGrid({ garages, companyId }: Props) {
  const [selectedGarageId, setSelectedGarageId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedGarage, setSelectedGarage] = useState<Garage | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignGarageCode, setAssignGarageCode] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    const garage = garages.find((g) => g.id === id) ?? null;
    setSelectedGarage(garage);
    setEditOpen(true);
  };

  const handleAssignManager = (garage: Garage) => {
    if (!garage.garageRegistrationNumber) return;
    setAssignGarageCode(garage.garageRegistrationNumber);
    setAssignOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {garages.map((garage) => (
          <GarageCard
            key={garage.id}
            id={garage.id}
            name={garage.name}
            location={garage.locationName ?? ""}
            status={garage.status ?? "active"}
            capacity={garage.capacity ?? 0}
            managerName={garage.manager?.fullname ?? null}
            onOpenDetails={setSelectedGarageId}
            onEdit={handleEdit}
            onAssignManager={() => handleAssignManager(garage)}
          />
        ))}
      </div>

      {selectedGarageId && (
        <GarageDetailsModal
          open={true}
          garageId={selectedGarageId}
          onClose={() => setSelectedGarageId(null)}
        />
      )}

      {selectedGarage && (
        <GarageEditModal
          open={editOpen}
          garage={{
            id: selectedGarage.id,
            name: selectedGarage.name,
            locationName: selectedGarage.locationName ?? "",
            status: selectedGarage.status ?? "active",
            capacity: selectedGarage.capacity ?? 0,
            garageRegistrationNumber:
              selectedGarage.garageRegistrationNumber ?? "",
            valetAvailable: selectedGarage.valetAvailable ?? false,
            manager: selectedGarage.manager ?? null,
          }}
          onClose={() => setEditOpen(false)}
          onUpdated={() => window.location.reload()}
        />
      )}

      {assignGarageCode && (
        <AssignManagerModal
          open={assignOpen}
          garageCode={assignGarageCode}
          companyId={companyId}
          onClose={() => setAssignOpen(false)}
          onAssigned={() => window.location.reload()}
        />
      )}
    </>
  );
}
