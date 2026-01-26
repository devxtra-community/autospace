export function ValetsFilters() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between bg-card border border-border rounded-xl p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Filters</h2>

      <div className="flex gap-3">
        <select className="border border-border rounded-md px-3 py-2 text-sm bg-background">
          <option>Status</option>
          <option>On Duty</option>
          <option>On Break</option>
          <option>Off Duty</option>
        </select>

        <select className="border border-border rounded-md px-3 py-2 text-sm bg-background">
          <option>Shift</option>
          <option>Morning</option>
          <option>Afternoon</option>
          <option>Evening</option>
        </select>
      </div>
    </div>
  );
}
