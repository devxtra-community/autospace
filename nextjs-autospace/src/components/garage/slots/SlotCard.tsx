export type SlotStatus = "available" | "occupied" | "out";

const statusStyles: Record<SlotStatus, string> = {
  available: "bg-green-500 text-black",
  occupied: "bg-red-500 text-white",
  out: "bg-gray-300 text-black",
};

export function SlotCard({ id, status }: { id: string; status: SlotStatus }) {
  return (
    <div
      className={`rounded-lg h-24 flex items-center justify-center font-semibold shadow-sm transition hover:scale-105 cursor-pointer ${statusStyles[status]}`}
    >
      {id}
    </div>
  );
}
