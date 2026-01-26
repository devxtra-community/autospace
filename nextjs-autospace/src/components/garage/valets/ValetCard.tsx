"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type ValetStatus = "on-duty" | "off-duty" | "on-break";

interface ValetCardProps {
  name: string;
  shift: string;
  status: ValetStatus;
}

const statusStyles: Record<ValetStatus, string> = {
  "on-duty": "bg-secondary text-secondary-foreground",
  "off-duty": "bg-muted text-muted-foreground",
  "on-break": "bg-accent text-accent-foreground",
};

export function ValetCard({ name, shift, status }: ValetCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-lg">{name}</h3>
        <Badge className={statusStyles[status]}>
          {status.replace("-", " ")}
        </Badge>
      </div>

      {/* Info */}
      <div className="text-sm text-muted-foreground space-y-1">
        <p>
          <span className="font-medium text-foreground">Shift:</span> {shift}
        </p>
      </div>

      {/* Action */}
      <Button size="sm" className="mt-2">
        {status === "on-duty" ? "End Shift" : "Start Shift"}
      </Button>
    </div>
  );
}
