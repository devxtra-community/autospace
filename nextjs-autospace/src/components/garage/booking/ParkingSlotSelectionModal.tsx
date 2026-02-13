"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { SlotGrid, SlotStatus } from "./SlotGrid";
import apiClient from "@/lib/apiClient";

interface ParkingSlotSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  garageName: string;
  garageId: string;
  startTime: string;
  endTime: string;
  onConfirm: (data: { floor: number; slotId: string }) => void;
}

export const ParkingSlotSelectionModal = ({
  isOpen,
  onClose,
  garageName,
  garageId,
  startTime,
  endTime,
  onConfirm,
}: ParkingSlotSelectionModalProps) => {
  const [currentFloor, setCurrentFloor] = useState(1);

  const [selectedSlot, setSelectedSlot] = useState<{
    id: string;
    slotNumber: string;
  } | null>(null);

  const [floorData, setFloorData] = useState<
    Record<number, { id: string; slotNumber: string; status: SlotStatus }[]>
  >({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !garageId) return;

    const fetchSlots = async () => {
      try {
        setLoading(true);

        const response = await apiClient.get(`/api/garages/${garageId}/slots`, {
          params: { startTime, endTime },
        });

        // console.log("slots from backend", response.data);

        const grouped: Record<
          number,
          { id: string; slotNumber: string; status: SlotStatus }[]
        > = {};

        for (const slot of response.data.data || response.data) {
          if (!grouped[slot.floor]) grouped[slot.floor] = [];

          grouped[slot.floor].push({
            id: slot.id,
            slotNumber: slot.slotNumber,
            status: slot.status as SlotStatus,
          });
        }

        setFloorData(grouped);

        // reset floor if current not exist
        const floors = Object.keys(grouped).map(Number);
        if (floors.length > 0) setCurrentFloor(floors[0]);

        setSelectedSlot(null);
      } catch (err) {
        console.error("Failed to fetch slots", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [isOpen, garageId, startTime, endTime]);

  if (!isOpen) return null;

  const floors = Object.keys(floorData)
    .map(Number)
    .sort((a, b) => a - b);
  // const totalFloors = floors.length || 1;
  const currentSlots = floorData[currentFloor] || [];

  const handleConfirm = () => {
    if (!selectedSlot) return;
    onConfirm({ floor: currentFloor, slotId: selectedSlot.id });
    onClose();
  };

  const changeFloor = (floor: number) => {
    setCurrentFloor(floor);
    setSelectedSlot(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Select Parking Slot
            </h2>
            <p className="text-sm text-gray-500 font-medium">{garageName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Floor Navigation */}
        <div className="flex items-center justify-center gap-8 py-4 bg-white border-b border-gray-100">
          <button
            disabled={currentFloor === floors[0]}
            onClick={() =>
              changeFloor(floors[floors.indexOf(currentFloor) - 1])
            }
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Current
            </span>
            <span className="text-lg font-black text-gray-900">
              Floor {currentFloor}
            </span>
          </div>

          <button
            disabled={currentFloor === floors[floors.length - 1]}
            onClick={() =>
              changeFloor(floors[floors.indexOf(currentFloor) + 1])
            }
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Slot Grid */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-50/30">
          {loading ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              Loading available slots...
            </div>
          ) : (
            <SlotGrid
              slots={currentSlots}
              selectedSlotId={selectedSlot?.id || null}
              onSlotClick={(id) => {
                const slot = currentSlots.find((s) => s.id === id);
                if (slot) {
                  setSelectedSlot({
                    id: slot.id,
                    slotNumber: slot.slotNumber,
                  });
                }
              }}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 p-6 border-t border-gray-100 bg-white">
          <Legend color="green" text="Available" />
          <Legend color="red" text="Booked" />
          <Legend color="yellow" text="Selected" />
          <Legend color="gray" text="Disabled" />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Selection
            </p>
            <p className="text-sm font-black text-gray-900">
              {selectedSlot
                ? `Slot ${selectedSlot.slotNumber} (Floor ${currentFloor})`
                : "No slot selected"}
            </p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-8 py-3 bg-white border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
            >
              Cancel
            </button>

            <button
              disabled={!selectedSlot}
              onClick={handleConfirm}
              className="flex-1 sm:flex-none px-8 py-3 bg-primary text-gray-900 text-sm font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 disabled:opacity-50 transition-all uppercase tracking-wider"
            >
              Confirm Slot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Small legend component (no style change)
const Legend = ({ color, text }: { color: string; text: string }) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-4 h-4 rounded border-2 ${
        color === "green"
          ? "bg-green-100 border-green-200"
          : color === "red"
            ? "bg-red-100 border-red-200"
            : color === "yellow"
              ? "bg-yellow-400 border-yellow-500"
              : "bg-gray-100 border-gray-200"
      }`}
    />
    <span className="text-xs font-bold text-gray-600">{text}</span>
  </div>
);
