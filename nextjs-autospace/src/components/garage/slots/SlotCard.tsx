"use client";

export type SlotStatus = "available" | "occupied" | "out";
export type SlotSize = "STANDARD" | "LARGE";

const statusStyles: Record<SlotStatus, string> = {
  available: "bg-green-500",
  occupied: "bg-red-500",
  out: "bg-gray-300",
};

export function SlotCard({
  label,
  status,
  slotSize,
}: {
  label: string;
  status: SlotStatus;
  slotSize: SlotSize;
}) {
  return (
    <div
      className={`
        h-16 w-full rounded border
        flex flex-col items-center justify-center
        text-[11px] font-semibold
        ${statusStyles[status]}
        text-black
      `}
    >
      <span>{label}</span>
      <span className="text-[9px] opacity-80">
        {slotSize === "LARGE" ? "SUV" : "STD"}
      </span>
    </div>
  );
}
