"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type ValetStatus =
  | "PENDING"
  | "ACTIVE"
  | "REJECTED"
  | "AVAILABLE"
  | "BUSY"
  | "OFFLINE"
  | "OFF_DUTY";

interface ValetCardProps {
  name: string;
  email: string;
  phone: string;
  status: ValetStatus;
  showActions?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}

const statusStyles: Record<ValetStatus, string> = {
  PENDING: "bg-secondary text-secondary-foreground",
  ACTIVE: "bg-green-500 text-green-50",
  REJECTED: "bg-red-500 text-red-50",
  AVAILABLE: "bg-blue-500 text-blue-50",
  BUSY: "bg-yellow-500 text-yellow-50",
  OFFLINE: "bg-gray-500 text-gray-50",
  OFF_DUTY: "bg-purple-500 text-purple-50",
};

export function ValetCard({
  name,
  email,
  phone,
  status,
  showActions,
  onApprove,
  onReject,
}: ValetCardProps) {
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
          <span className="font-medium text-foreground">Email:</span> {email}
        </p>
        <p>
          <span className="font-medium text-foreground">Phone:</span> {phone}
        </p>
      </div>

      {/* Action */}
      {showActions && (
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={onApprove} variant="default">
            Approve
          </Button>
          <Button size="sm" onClick={onReject} variant="destructive">
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}

// i dont want shift logic remove it
