"use client";

import { SlotCard, SlotStatus, SlotSize } from "./SlotCard";

type Slot = {
  id: string;
  status: SlotStatus;
  slotSize: SlotSize;
};

const SLOTS_PER_ROW = 5;

export function SlotsGrid({ slots }: { slots: Slot[] }) {
  /**
   * Group slots by row letter
   * A1–A5 => A
   * B1–B5 => B
   */
  const grouped: Record<string, Slot[]> = {};

  slots.forEach((slot) => {
    const rowLetter = slot.id.charAt(0).toUpperCase();

    if (!grouped[rowLetter]) {
      grouped[rowLetter] = [];
    }

    grouped[rowLetter].push(slot);
  });

  const sortedRows = Object.keys(grouped).sort();

  return (
    <div className="border rounded-lg p-4 bg-muted space-y-4">
      {sortedRows.map((row) => {
        const rowSlots = grouped[row]
          .sort((a, b) => a.id.localeCompare(b.id))
          .slice(0, SLOTS_PER_ROW);

        return (
          <div key={row} className="flex items-center gap-4">
            {/* ROW LABEL */}
            <div className="w-6 text-center text-xs font-semibold text-gray-500">
              {row}
            </div>

            {/* SLOTS */}
            <div className="grid grid-cols-5 gap-2 flex-1">
              {rowSlots.map((slot) => (
                <SlotCard key={slot.id} {...slot} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
