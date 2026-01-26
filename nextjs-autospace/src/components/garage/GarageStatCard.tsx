import { Card } from "@/components/ui/card";

interface GarageStatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export function GarageStatCard({ label, value, sub }: GarageStatCardProps) {
  return (
    <Card className="p-5 rounded-xl shadow-sm hover:shadow-md transition bg-card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-green-600 mt-1">{sub}</p>}
    </Card>
  );
}
