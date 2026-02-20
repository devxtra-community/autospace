export function SlotsLegend() {
  return (
    <div className="flex flex-wrap gap-4 items-center text-sm">
      <LegendItem color="bg-green-500" label="Available" />
      <LegendItem color="bg-yellow-500" label="Reserved" />
      <LegendItem color="bg-red-500" label="Occupied" />
      <LegendItem color="bg-gray-300" label="Out of Service" />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-4 h-4 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}
