import { Building2, Warehouse, Calendar, AlertTriangle } from "lucide-react";
import { StatCard } from "./StatCard";

interface StatsSectionProps {
  companiesCount: number;
  garagesCount: number;
}

export const StatsSection = ({
  companiesCount,
  garagesCount,
}: StatsSectionProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Pending Companies"
        value={companiesCount}
        icon={Building2}
        colorClass="bg-indigo-500"
      />
      <StatCard
        title="Pending Garages"
        value={garagesCount}
        icon={Warehouse}
        colorClass="bg-orange-500"
      />
      <StatCard
        title="Today's Requests"
        value={companiesCount + garagesCount}
        icon={Calendar}
        colorClass="bg-secondary"
      />
      <StatCard
        title="Total Actionable"
        value={companiesCount + garagesCount}
        icon={AlertTriangle}
        colorClass="bg-pink-500"
      />
    </div>
  );
};
