"use client";

import { useEffect, useState } from "react";
import {
  getMyGarageFloors,
  getSlotsByFloor,
  createGarageFloor,
  createGarageSlot,
} from "@/services/garage.service";

import { SlotsGrid } from "./slots/SlotsGrid";
import { SlotStatus } from "./slots/SlotCard";

/* ================= TYPES ================= */

type Floor = {
  id: string;
  floorNumber: number;
};

type BackendSlot = {
  id: string;
  slotNumber: string;
  status: "AVAILABLE" | "RESERVED" | "OCCUPIED" | "OUT";
  slotSize: "STANDARD" | "LARGE";
};

type UISlot = {
  id: string;
  label: string;
  status: SlotStatus;
  slotSize: "STANDARD" | "LARGE";
};

type SlotInput = {
  slotNumber: string;
  slotSize: "STANDARD" | "LARGE";
};

/* ================= STATUS MAPPER ================= */

function mapSlotStatus(status: string): SlotStatus {
  switch (status) {
    case "AVAILABLE":
      return "available";
    case "RESERVED":
      return "reserved";
    case "OCCUPIED":
      return "occupied";
    case "OUT":
      return "out";
    default:
      return "available";
  }
}

/* ================= COMPONENT ================= */

export function GarageFloors() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [slotsByFloor, setSlotsByFloor] = useState<Record<string, UISlot[]>>(
    {},
  );
  const [newFloorNumber, setNewFloorNumber] = useState<number | "">("");
  const [slotInputs, setSlotInputs] = useState<Record<string, SlotInput>>({});

  /* ================= INIT ================= */

  useEffect(() => {
    const init = async () => {
      const floorsData: Floor[] = await getMyGarageFloors();
      setFloors(floorsData);

      await Promise.all(floorsData.map((floor) => loadSlots(floor.id)));
    };

    init();
  }, []);

  /* ================= LOAD SLOTS ================= */

  const loadSlots = async (floorId: string) => {
    const backendSlots: BackendSlot[] = await getSlotsByFloor(floorId);

    const uiSlots: UISlot[] = backendSlots.map((s) => ({
      id: s.id,
      label: s.slotNumber,
      status: mapSlotStatus(s.status),
      slotSize: s.slotSize,
    }));

    setSlotsByFloor((prev) => ({
      ...prev,
      [floorId]: uiSlots,
    }));
  };

  /* ================= CREATE FLOOR ================= */

  const handleCreateFloor = async () => {
    if (!newFloorNumber) return;

    await createGarageFloor({ floorNumber: Number(newFloorNumber) });
    setNewFloorNumber("");

    const updatedFloors = await getMyGarageFloors();
    setFloors(updatedFloors);

    for (const floor of updatedFloors) {
      await loadSlots(floor.id);
    }
  };

  /* ================= CREATE SLOT ================= */

  const handleCreateSlot = async (floor: Floor) => {
    const input = slotInputs[floor.id];
    if (!input?.slotNumber || !input?.slotSize) return;

    try {
      await createGarageSlot({
        floorNumber: floor.floorNumber,
        slotNumber: input.slotNumber,
        slotSize: input.slotSize,
      });

      await loadSlots(floor.id);

      setSlotInputs((prev) => ({
        ...prev,
        [floor.id]: { slotNumber: "", slotSize: "STANDARD" },
      }));
    } catch (err) {
      console.error("Create slot failed", err);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-8">
      {/* ADD FLOOR */}
      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="font-semibold">Add Floor</h3>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Floor number"
            className="border px-3 py-2 rounded w-32"
            value={newFloorNumber}
            onChange={(e) =>
              setNewFloorNumber(e.target.value ? Number(e.target.value) : "")
            }
          />

          <button
            onClick={handleCreateFloor}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Add Floor
          </button>
        </div>
      </div>

      {/* FLOORS */}
      {floors.map((floor: Floor) => {
        const slots = slotsByFloor[floor.id] ?? [];

        return (
          <div key={floor.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold">
                Floor {floor.floorNumber}
              </h2>
              <span className="text-xs text-gray-500">
                {slots.length} slots
              </span>
            </div>

            {/* ADD SLOT */}
            <div className="flex gap-2 items-center">
              <input
                placeholder="A1"
                className="border px-2 py-1 rounded w-24"
                value={slotInputs[floor.id]?.slotNumber ?? ""}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();

                  if (/^[A-Z]?[1-9]?$/.test(value)) {
                    setSlotInputs((prev) => ({
                      ...prev,
                      [floor.id]: {
                        slotNumber: value,
                        slotSize: prev[floor.id]?.slotSize ?? "STANDARD",
                      },
                    }));
                  }
                }}
              />

              <select
                className="border px-2 py-1 rounded"
                value={slotInputs[floor.id]?.slotSize ?? "STANDARD"}
                onChange={(e) =>
                  setSlotInputs((prev) => ({
                    ...prev,
                    [floor.id]: {
                      slotNumber: prev[floor.id]?.slotNumber ?? "",
                      slotSize: e.target.value as "STANDARD" | "LARGE",
                    },
                  }))
                }
              >
                <option value="STANDARD">Standard</option>
                <option value="LARGE">Large</option>
              </select>

              <button
                onClick={() => handleCreateSlot(floor)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Add Slot
              </button>

              <button
                onClick={() => loadSlots(floor.id)}
                className="text-blue-600 underline text-sm"
              >
                Reload
              </button>
            </div>

            {slots.length > 0 && <SlotsGrid slots={slots} />}
          </div>
        );
      })}
    </div>
  );
}
