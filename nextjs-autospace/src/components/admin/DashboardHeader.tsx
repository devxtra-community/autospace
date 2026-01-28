import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const DashboardHeader = ({
  searchTerm,
  onSearchChange,
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Admin <span className="text-secondary">Overview</span>
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage incoming registrations and approvals.
        </p>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search companies or garages..."
          className="pl-10 h-10 bg-card border-border focus:ring-secondary focus:border-secondary rounded-xl"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};
