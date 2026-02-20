"use client";

import { useEffect, useState } from "react";
import { ValetCard } from "./ValetCard";

import {
  getGarageValets,
  getPendingValets,
  approveValet,
  rejectValet,
  GarageValet,
} from "@/services/garageValets.service";

import { getMyManagerGarage } from "@/services/garage.service";

export function ValetsGrid() {
  const [garageId, setGarageId] = useState<string | null>(null);
  const [activeValets, setActiveValets] = useState<GarageValet[]>([]);
  const [pendingValets, setPendingValets] = useState<GarageValet[]>([]);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const garage = await getMyManagerGarage();
      if (!garage?.id) return;

      setGarageId(garage.id);
      await loadValets(garage.id);
    } catch (err) {
      console.error("Init error:", err);
    }
  };

  const loadValets = async (garageId: string) => {
    try {
      const active = await getGarageValets(garageId, "ACTIVE");
      const pending = await getPendingValets(garageId);

      setActiveValets(active);
      setPendingValets(pending);
    } catch (err) {
      console.error("Load valets error:", err);
    }
  };

  const handleApprove = async (valetId: string) => {
    await approveValet(valetId);
    if (garageId) await loadValets(garageId);
  };

  const handleReject = async (valetId: string) => {
    await rejectValet(valetId);
    if (garageId) await loadValets(garageId);
  };

  return (
    <div className="space-y-8">
      {/* Pending Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Pending Approval</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {pendingValets.map((valet) => (
            <ValetCard
              key={valet.id}
              name={valet.name}
              email={valet.email}
              phone={valet.phone}
              status={valet.employmentStatus}
              showActions
              onApprove={() => handleApprove(valet.id)}
              onReject={() => handleReject(valet.id)}
            />
          ))}
        </div>
      </div>

      {/* Active Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Approved Valets</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeValets.map((valet) => (
            <ValetCard
              key={valet.id}
              name={valet.name}
              email={valet.email}
              phone={valet.phone}
              status={valet.availabilityStatus}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
