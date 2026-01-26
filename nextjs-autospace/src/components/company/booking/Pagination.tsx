import { Button } from "@/components/ui/button";

export function Pagination() {
  return (
    <div className="flex justify-center gap-3 mt-4">
      <Button variant="outline">Previous</Button>
      <Button className="bg-black text-white hover:bg-black/90">Next</Button>
    </div>
  );
}
