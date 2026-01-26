import { SlotCard, SlotStatus } from "./SlotCard";

const slots: { id: string; status: SlotStatus }[] = [
  { id: "A1", status: "available" },
  { id: "A2", status: "available" },
  { id: "A3", status: "occupied" },
  { id: "A4", status: "available" },
  { id: "A5", status: "out" },
  { id: "B1", status: "occupied" },
  { id: "B2", status: "out" },
  { id: "B3", status: "available" },
  { id: "B4", status: "available" },
  { id: "B5", status: "available" },
];

export function SlotsGrid() {
  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
      {/* Top row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {slots.slice(0, 5).map((slot) => (
          <SlotCard key={slot.id} {...slot} />
        ))}
      </div>

      {/* Driving lane */}
      <div className="text-center font-semibold tracking-wide text-muted-foreground">
        — DRIVING LANE —
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {slots.slice(5).map((slot) => (
          <SlotCard key={slot.id} {...slot} />
        ))}
      </div>
    </div>
  );
}
