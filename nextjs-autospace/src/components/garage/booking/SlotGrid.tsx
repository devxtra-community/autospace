"use client";

import React from "react";

export type SlotStatus = "available" | "booked" | "selected" | "disabled";

interface SlotGridProps {
  slots: { id: string; slotNumber: string; status: SlotStatus }[];
  selectedSlotId: string | null;
  onSlotClick: (slotId: string) => void;
}

export const SlotGrid: React.FC<SlotGridProps> = ({
  slots,
  selectedSlotId,
  onSlotClick,
}) => {
  // console.log("slots in grid",slots);

  const getSlotColor = (status: SlotStatus, id: string) => {
    if (id === selectedSlotId)
      return "bg-yellow-400 text-black border-yellow-500 shadow-[0_0_10px_rgba(250,204,21,0.5)]";
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:border-green-300 cursor-pointer";
      case "booked":
        return "bg-red-100 text-red-700 border-red-200 cursor-not-allowed opacity-80";
      case "selected":
        return "bg-yellow-400 text-black border-yellow-500 shadow-[0_0_10px_rgba(250,204,21,0.5)]";
      case "disabled":
        return "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";
      default:
        return "bg-gray-100 text-gray-400 border-gray-200";
    }
  };

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 p-4">
      {slots.map((slot) => (
        <div
          key={slot.id}
          onClick={() => slot.status === "available" && onSlotClick(slot.id)}
          className={`
            w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center 
            rounded-lg border-2 text-xs font-bold transition-all duration-200
            ${getSlotColor(slot.status, slot.id)}
            ${slot.status === "available" ? "active:scale-90" : ""}
          `}
        >
          {slot.slotNumber}
        </div>
      ))}
    </div>
  );
};
