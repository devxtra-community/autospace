"use client";

import {
  X,
  Mail,
  Phone,
  MapPin,
  Warehouse,
  User,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { approveGarage, rejectGarage } from "@/services/admin.service";

import { GarageData } from "./GarageTable";

/* ================= TYPES ================= */

interface Props {
  garage: GarageData | null;
  onClose: () => void;
}

interface DetailProps {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
}

/* ================= STATUS STYLES ================= */

const statusStyles: Record<string, string> = {
  active: "bg-[#E7F7EF] text-[#0D9488]",
  pending: "bg-[#FEF3C7] text-[#D97706]",
  rejected: "bg-[#FEE2E2] text-[#EF4444]",
};

/* ================= COMPONENT ================= */

export function GarageProfilePanel({ garage, onClose }: Props) {
  if (!garage) return null;

  /* ===== ACTIONS ===== */

  const handleApprove = async () => {
    try {
      await approveGarage(garage.garageId);
    } catch (err) {
      console.error("Approve garage failed", err);
    }
  };

  const handleReject = async () => {
    try {
      await rejectGarage(garage.garageId);
    } catch (err) {
      console.error("Reject garage failed", err);
    }
  };

  /* ================= UI ================= */

  return (
    <aside className="fixed top-4 right-4 h-[calc(100vh-2rem)] w-[420px] bg-card rounded-3xl shadow-2xl border border-border z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* HEADER */}
      <div className="p-6 flex justify-between items-center border-b border-border">
        <h3 className="font-bold text-lg text-foreground">Garage Profile</h3>

        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-lg transition"
        >
          <X size={18} />
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* NAME + STATUS */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center">
            <Warehouse size={28} />
          </div>

          <h2 className="font-bold text-lg text-foreground">{garage.name}</h2>

          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold capitalize",
              statusStyles[garage.status],
            )}
          >
            {garage.status}
          </span>
        </div>

        {/* DETAILS */}
        <Detail
          icon={<User size={16} />}
          label="Manager"
          value={garage.managerName}
        />

        <Detail
          icon={<Mail size={16} />}
          label="Email"
          value={garage.contactEmail}
        />

        <Detail
          icon={<Phone size={16} />}
          label="Phone"
          value={garage.contactPhone}
        />

        <Detail
          icon={<MapPin size={16} />}
          label="Location"
          value={garage.locationName}
        />

        <Detail
          icon={<Warehouse size={16} />}
          label="Capacity"
          value={garage.capacity}
        />

        <Detail
          icon={<Warehouse size={16} />}
          label="Floors"
          value={garage.floorCount}
        />

        <Detail
          icon={<Warehouse size={16} />}
          label="Slots"
          value={garage.slotCount}
        />

        <Detail
          icon={<User size={16} />}
          label="Valets"
          value={garage.valetCount}
        />

        <Detail
          icon={<Calendar size={16} />}
          label="Created"
          value={new Date(garage.createdAt).toLocaleDateString()}
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className="p-6 border-t border-border space-y-3">
        {/* Pending → Approve + Reject */}
        {garage.status === "pending" && (
          <>
            <Button
              onClick={handleApprove}
              className="w-full bg-primary text-black hover:bg-primary/90"
            >
              Approve Garage
            </Button>

            <Button
              variant="destructive"
              onClick={handleReject}
              className="w-full"
            >
              Reject Garage
            </Button>
          </>
        )}

        {/* Active → Reject only */}
        {garage.status === "active" && (
          <Button
            variant="destructive"
            onClick={handleReject}
            className="w-full"
          >
            Reject Garage
          </Button>
        )}

        {/* Rejected → Approve only */}
        {garage.status === "rejected" && (
          <Button
            onClick={handleApprove}
            className="w-full bg-primary text-black hover:bg-primary/90"
          >
            Approve Garage
          </Button>
        )}
      </div>
    </aside>
  );
}

/* ================= DETAIL COMPONENT ================= */

function Detail({ icon, label, value }: DetailProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        {icon}
      </div>

      <div className="flex flex-col">
        <span className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">
          {label}
        </span>

        <span className="text-sm font-semibold text-foreground">
          {value ?? "-"}
        </span>
      </div>
    </div>
  );
}
