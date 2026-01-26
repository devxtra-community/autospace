export function SlotsHeader() {
  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
      <div>
        <h1 className="text-xl font-semibold">Garage Manager – Slots</h1>
        <p className="text-sm text-muted-foreground">
          Live parking layout overview
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Garage</p>
          <p className="font-medium">MetroParking</p>
        </div>
        <div>
          <p className="text-muted-foreground">Location</p>
          <p className="font-medium">Metro City</p>
        </div>
        <div>
          <p className="text-muted-foreground">Slots</p>
          <p className="font-medium">24</p>
        </div>
        <div>
          <p className="text-muted-foreground">Status</p>
          <p className="font-medium text-green-600">Active</p>
        </div>
      </div>
    </div>
  );
}
