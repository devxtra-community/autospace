"use client";

import { useEffect, useState } from "react";
import { GarageCard, GarageStatus } from "./GarageCard";
import { getMyGarages } from "@/services/garage.service";
import { getMyCompany } from "@/services/company.service";
import { GarageDetailsModal } from "./GarageDetailsModal";
import { GarageEditModal } from "./GarageEditModal";
import { AssignManagerModal } from "./AssignManagerModal";

interface GarageAPI {
  id: string;
  garageRegistrationNumber: string;
  name: string;
  locationName: string;
  status: GarageStatus;
  capacity: number;
  valetAvailable: boolean; // required, not optional
  contactEmail?: string;
  contactPhone?: string;
  manager?: {
    fullname?: string;
  } | null;
}

export function GaragesGrid() {
  const [garages, setGarages] = useState<GarageAPI[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const [selectedGarageId, setSelectedGarageId] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [selectedGarage, setSelectedGarage] = useState<GarageAPI | null>(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignGarageCode, setAssignGarageCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const company = await getMyCompany();
      setCompanyId(company.id);

      const data = await getMyGarages(company.id);
      setGarages(data);
    };

    fetchData();
  }, []);

  return (
    <>
      {/* GARAGE GRID */}
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
            onOpenDetails={(id) => setSelectedGarageId(id)}
            onEdit={(id) => {
              const g = garages.find((x) => x.id === id);
              if (!g) return;

              setSelectedGarage(g);
              setEditOpen(true);
            }}
            onAssignManager={() => {
              setAssignGarageCode(garage.garageRegistrationNumber);
              setAssignOpen(true);
            }}
          />
        ))}
      </div>

      {/* DETAILS MODAL */}
      <GarageDetailsModal
        open={!!selectedGarageId}
        garageId={selectedGarageId}
        onClose={() => setSelectedGarageId(null)}
      />

      {/* EDIT MODAL */}
      <GarageEditModal
        open={editOpen}
        garage={selectedGarage}
        onClose={() => {
          setEditOpen(false);
          setSelectedGarage(null);
        }}
        onUpdated={() => window.location.reload()}
      />

      {/* ASSIGN MANAGER MODAL */}
      {companyId && assignGarageCode && (
        <AssignManagerModal
          open={assignOpen}
          garageCode={assignGarageCode}
          companyId={companyId}
          onClose={() => {
            setAssignOpen(false);
            setAssignGarageCode(null);
          }}
          onAssigned={() => window.location.reload()}
        />
      )}
    </>
  );
}
