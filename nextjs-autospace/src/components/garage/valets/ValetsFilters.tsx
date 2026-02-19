export function ValetsFilters() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between bg-card border border-border rounded-xl p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Filters</h2>

      <div className="flex gap-3">
        <select className="border border-border rounded-md px-3 py-2 text-sm bg-background">
          <option>Status</option>
          <option>Available</option>
          <option>Busy</option>
          <option>Off Duty</option>
          <option>Offline</option>
        </select>
      </div>
    </div>
  );
}
