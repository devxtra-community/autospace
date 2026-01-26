"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MapPin, User, Layers } from "lucide-react";

export type GarageStatus = "pending" | "active" | "rejected" | "suspended";

interface GarageCardProps {
  name: string;
  location: string;
  status: GarageStatus;
  slots: number;
  total: number;
  manager?: string;
}

const statusStyles: Record<GarageStatus, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-700",
  suspended: "bg-gray-200 text-gray-700",
};

export function GarageCard({
  name,
  location,
  status,
  slots,
  total,
  manager,
}: GarageCardProps) {
  const [showAssign, setShowAssign] = useState(false);

  const usagePercent = Math.round((slots / total) * 100);

  return (
    <div className="relative rounded-2xl bg-card border border-border p-5 shadow-sm hover:shadow-lg transition-all">
      {/* Status Badge */}
      <span
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}
      >
        {status.toUpperCase()}
      </span>

      {/* Header */}
      <h3 className="text-lg font-semibold text-foreground">{name}</h3>
      <p className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
        <MapPin size={14} /> {location}
      </p>

      {/* Slot Usage */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Layers size={14} /> Slots Used
          </span>
          <span className="font-medium">
            {slots} / {total}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary transition-all"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      {/* Manager */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 text-muted-foreground">
          <User size={14} /> Manager
        </span>
        <span className="font-medium">{manager || "Unassigned"}</span>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-2">
        {!manager ? (
          <>
            <Button
              size="sm"
              className="bg-secondary text-black hover:bg-primary"
              onClick={() => setShowAssign(!showAssign)}
            >
              Assign Manager
            </Button>

            {showAssign && (
              <select className="border rounded-lg px-3 py-1 text-sm bg-background">
                <option>Select Manager</option>
                <option>John</option>
                <option>Sarah</option>
              </select>
            )}
          </>
        ) : (
          <Button size="sm" variant="destructive">
            Suspend Garage
          </Button>
        )}
      </div>
    </div>
  );
}
