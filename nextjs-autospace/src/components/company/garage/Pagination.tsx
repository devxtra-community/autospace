import { Button } from "@/components/ui/button";

export function Pagination() {
  return (
    <div className="flex justify-center mt-10 gap-3">
      <Button variant="outline">Previous</Button>
      <Button className="bg-black text-white hover:bg-secondary hover:text-black">
        Next
      </Button>
    </div>
  );
}
