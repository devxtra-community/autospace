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

type Floor = {
  id: string;
  floorNumber: number;
};

type BackendSlot = {
  slotNumber: string;
  status: string;
  slotSize: "STANDARD" | "LARGE";
};

type UISlot = {
  id: string;
  label: string; // for display (e.g. A1)
  status: SlotStatus;
  slotSize: "STANDARD" | "LARGE";
};

type SlotInput = {
  slotNumber: string;
  slotSize: "STANDARD" | "LARGE";
};

function mapSlotStatus(status: string): SlotStatus {
  switch (status) {
    case "AVAILABLE":
      return "available";
    case "OCCUPIED":
      return "occupied";
    case "OUT":
      return "out";
    default:
      return "available";
  }
}

export function GarageFloors() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [slotsByFloor, setSlotsByFloor] = useState<Record<string, UISlot[]>>(
    {},
  );
  const [newFloorNumber, setNewFloorNumber] = useState<number | "">("");
  const [slotInputs, setSlotInputs] = useState<Record<string, SlotInput>>({});

  useEffect(() => {
    getMyGarageFloors().then(setFloors);
  }, []);

  const handleCreateFloor = async () => {
    if (!newFloorNumber) return;

    await createGarageFloor({ floorNumber: Number(newFloorNumber) });
    setNewFloorNumber("");
    setFloors(await getMyGarageFloors());
  };

  const loadSlots = async (floorId: string) => {
    const backendSlots: BackendSlot[] = await getSlotsByFloor(floorId);

    const uiSlots = backendSlots
      .filter(() => true)
      .map((s) => ({
        id: `${floorId}-${s.slotNumber}`,
        label: s.slotNumber,
        status: mapSlotStatus(s.status),
        slotSize: s.slotSize,
      }));

    setSlotsByFloor({
      [floorId]: uiSlots,
    });
  };

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
      console.error(err);
    }
  };

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
            onChange={(e) => setNewFloorNumber(Number(e.target.value))}
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
      {floors.map((floor) => {
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

                  // allow only A1–A5 typing
                  if (/^[A-Z]?[1-5]?$/.test(value)) {
                    setSlotInputs((prev) => ({
                      ...prev,
                      [floor.id]: {
                        ...prev[floor.id],
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
                      ...prev[floor.id],
                      slotSize: e.target.value as "STANDARD" | "LARGE",
                      slotNumber: prev[floor.id]?.slotNumber ?? "",
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
                Load slots
              </button>
            </div>

            {slots.length > 0 && <SlotsGrid key={floor.id} slots={slots} />}
          </div>
        );
      })}
    </div>
  );
}
