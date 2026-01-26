import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function GaragesHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold">Garages Overview</h1>
        <p className="text-muted-foreground text-sm">
          Assign owners and manage garage status
        </p>
      </div>

      <div className="flex gap-3 w-full md:w-auto">
        <Input placeholder="Search garages..." className="md:w-64" />
        <Button className="bg-black text-white hover:bg-secondary hover:text-black">
          + Add Garage
        </Button>
      </div>
    </div>
  );
}
