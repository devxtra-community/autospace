import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <Card className="rounded-md shadow-sm">
      <CardContent className="p-5">
        <p className="text-md text-muted-foreground">{label}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
        {sub && <p className="text-xs text-green-600 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}
