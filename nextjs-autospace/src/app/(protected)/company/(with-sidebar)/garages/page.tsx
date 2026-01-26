import { GaragesHeader } from "@/components/company/garage/GaragesHeader";
import { GaragesGrid } from "@/components/company/garage/GaragesGrid";
import { Pagination } from "@/components/company/garage/Pagination";

export default function GaragesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <GaragesHeader />
      <GaragesGrid />
      <Pagination />
    </div>
  );
}
