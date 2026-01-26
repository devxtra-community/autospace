import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function BookingFilters() {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div className="flex gap-3 flex-wrap">
        <Input type="date" className="w-[160px]" />
        <Input placeholder="Garage" className="w-[160px]" />
      </div>

      <Button className="bg-black text-white hover:bg-black/90">
        Apply Filters
      </Button>
    </div>
  );
}
