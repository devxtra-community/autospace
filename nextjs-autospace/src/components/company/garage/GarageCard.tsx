"use client";

import { MapPin, User, Layers, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

export type GarageStatus = "pending" | "active" | "rejected";

interface GarageCardProps {
  id: string;
  name: string;
  location: string;
  status: GarageStatus;
  capacity: number;
  managerName?: string | null;

  // functionality callbacks (UNCHANGED)
  onOpenDetails: (garageId: string) => void;
  onAssignManager: (garageId: string) => void;
  onEdit: (garageId: string) => void;
}

const statusStyles: Record<GarageStatus, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-700",
};

export function GarageCard({
  id,
  name,
  location,
  status,
  capacity,
  managerName,
  onOpenDetails,
  onAssignManager,
  onEdit,
}: GarageCardProps) {
  const isActive = status === "active";
  const isPending = status === "pending";
  const isRejected = status === "rejected";
  const isUnassigned = !managerName;

  return (
    <div
      onClick={() => onOpenDetails(id)} // ✅ RESTORED
      className={`relative rounded-2xl border bg-white p-5 shadow-sm cursor-pointer transition
      ${isRejected ? "opacity-50" : "hover:shadow-md"}`}
    >
      {/* STATUS */}
      <span
        className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}
      >
        {status.toUpperCase()}
      </span>

      {/* EDIT (only pending / active) */}
      {(isPending || isActive) && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // ✅ important
            onEdit(id);
          }}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <Pencil size={16} />
        </button>
      )}

      <h3 className="mt-6 text-lg font-semibold">{name}</h3>

      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin size={14} /> {location}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Layers size={14} />
          Capacity: <strong>{capacity}</strong>
        </div>

        <div className="flex items-center gap-2">
          <User size={14} />
          Manager: <strong>{managerName ?? "Unassigned"}</strong>
        </div>
      </div>

      {/* ASSIGN MANAGER */}
      {isActive && isUnassigned && (
        <div className="mt-5">
          <Button
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation(); // ✅ prevents detail open
              onAssignManager(id);
            }}
          >
            Assign Manager
          </Button>
        </div>
      )}
    </div>
  );
}
