import { Card } from "@/components/ui/card";

export function SlotsOverview() {
  return (
    <Card className="p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">Slot Overview</h3>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Available</span>
          <span>10</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-secondary h-2 rounded-full w-[20%]" />
        </div>

        <div className="flex justify-between text-sm mt-4">
          <span>Occupied</span>
          <span>40</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-black h-2 rounded-full w-[80%]" />
        </div>
      </div>
    </Card>
  );
}
