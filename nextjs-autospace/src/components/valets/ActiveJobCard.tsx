"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Car,
  User,
  Phone,
  MapPin,
  Clock,
  Calendar,
  Hash,
  Key,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export type ValetStatus =
  | "ASSIGNED"
  | "ON_THE_WAY_TO_PICKUP"
  | "PICKED_UP"
  | "PARKED"
  | "ON_THE_WAY_TO_DROP"
  | "COMPLETED";

export type ActiveJob = {
  id: string;
  car: string;
  customer: string;
  phone: string;
  location: string;
  time: string;
  date: string;
  floor: string;
  entryPin: string;
  exitPin: string;
  valetStatus: ValetStatus;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  pickupAddress?: string | null;
  pickupPin?: string | null;
};

type Props = {
  req?: ActiveJob;
  onStartPickup?: () => void;
  onVerifyPickupPin?: (pin: string) => Promise<void>;
  onParked?: () => void;
  onStartDrop?: () => void;
  onComplete?: () => void;
};

export default function ActiveJobCard({
  req,
  onStartPickup,
  onVerifyPickupPin,
  onParked,
  onStartDrop,
  onComplete,
}: Props) {
  const [pickupPinInput, setPickupPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  if (!req) return null;

  const status = req.valetStatus || "ASSIGNED";

  const statusColor: Record<string, string> = {
    ASSIGNED: "bg-blue-500",
    ON_THE_WAY_TO_PICKUP: "bg-yellow-500",
    PICKED_UP: "bg-purple-500",
    PARKED: "bg-indigo-500",
    ON_THE_WAY_TO_DROP: "bg-orange-500",
    COMPLETED: "bg-green-500",
  };

  const statusText: Record<string, string> = {
    ASSIGNED: "Assigned",
    ON_THE_WAY_TO_PICKUP: "On the way to pickup",
    PICKED_UP: "Picked up",
    PARKED: "Parked",
    ON_THE_WAY_TO_DROP: "On the way to drop",
    COMPLETED: "Completed",
  };

  const openPickupNavigation = () => {
    if (!req.pickupLatitude || !req.pickupLongitude) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${req.pickupLatitude},${req.pickupLongitude}&travelmode=driving`;
    window.open(url, "_blank");
  };

  const handleVerifyPickupPin = async () => {
    if (!pickupPinInput.trim()) return;
    setVerifying(true);
    setPinError(null);
    try {
      await onVerifyPickupPin?.(pickupPinInput.trim());
      setPickupPinInput("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Invalid PIN, please try again";
      setPinError(msg);
    } finally {
      setVerifying(false);
    }
  };

  const renderButton = () => {
    switch (status) {
      case "ASSIGNED":
        return (
          <Button className="w-full" onClick={onStartPickup}>
            Start Pickup
          </Button>
        );

      case "ON_THE_WAY_TO_PICKUP":
        // Valet is heading to pickup — show PIN verification panel
        return (
          <div className="space-y-2 mt-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck size={13} className="text-yellow-500" />
              Ask the customer for their <strong>Pickup PIN</strong> and enter
              it below to confirm pickup.
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                value={pickupPinInput}
                onChange={(e) => {
                  setPickupPinInput(e.target.value);
                  setPinError(null);
                }}
                className="h-9 text-center tracking-widest font-semibold text-base"
              />
              <Button
                className="shrink-0"
                onClick={handleVerifyPickupPin}
                disabled={verifying || pickupPinInput.length !== 4}
              >
                {verifying ? "Verifying…" : "Verify"}
              </Button>
            </div>
            {pinError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle size={12} />
                {pinError}
              </p>
            )}
          </div>
        );

      case "PICKED_UP":
        return (
          <Button className="w-full" onClick={onParked}>
            Mark Parked
          </Button>
        );

      case "PARKED":
        return (
          <Button className="w-full" onClick={onStartDrop}>
            Start Drop
          </Button>
        );

      case "ON_THE_WAY_TO_DROP":
        return (
          <Button className="w-full" onClick={onComplete}>
            Complete Job
          </Button>
        );

      default:
        return null;
    }
  };

  // Show entry PIN only AFTER pickup is verified (PICKED_UP or later)
  const showEntryPin =
    status === "PICKED_UP" ||
    status === "PARKED" ||
    status === "ON_THE_WAY_TO_DROP";

  // Show exit PIN only after entry used
  const showExitPin =
    (status === "PARKED" || status === "ON_THE_WAY_TO_DROP") && req.exitPin;

  return (
    <Card className="rounded-xl">
      <CardContent className="p-4 space-y-3">
        {/* HEADER */}
        <div className="flex justify-between">
          <div className="font-semibold flex items-center gap-2">
            <Car size={16} />
            {req.car}
          </div>

          <Badge className={`${statusColor[status]} text-white`}>
            {statusText[status]}
          </Badge>
        </div>

        {/* CUSTOMER */}
        <div className="flex items-center gap-2 text-sm">
          <User size={14} />
          {req.customer}
        </div>

        {/* PHONE */}
        <div className="flex items-center gap-2 text-sm">
          <Phone size={14} />
          {req.phone}
        </div>

        {/* LOCATION */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={14} />
          {req.pickupAddress ?? req.location}
        </div>

        {/* FLOOR */}
        <div className="flex items-center gap-2 text-sm">
          <Hash size={14} />
          {req.floor}
        </div>

        {/* ENTRY PIN — only show after pickup verified */}
        {showEntryPin && req.entryPin && (
          <div className="rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 px-3 py-2 flex items-center gap-2">
            <Key size={14} className="text-purple-600" />
            <span className="text-sm">
              Gate Entry PIN:{" "}
              <span className="font-bold tracking-widest text-purple-700 dark:text-purple-300">
                {req.entryPin}
              </span>
            </span>
          </div>
        )}

        {/* EXIT PIN — show after parked */}
        {showExitPin && (
          <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-3 py-2 flex items-center gap-2">
            <Key size={14} className="text-green-600" />
            <span className="text-sm">
              Gate Exit PIN:{" "}
              <span className="font-bold tracking-widest text-green-700 dark:text-green-300">
                {req.exitPin}
              </span>
            </span>
          </div>
        )}

        {/* TIME */}
        <div className="flex items-center gap-2 text-sm">
          <Clock size={14} />
          {req.time}
        </div>

        {/* DATE */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} />
          {req.date}
        </div>

        {req.pickupLatitude &&
          req.pickupLongitude &&
          status !== "COMPLETED" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={openPickupNavigation}
            >
              Navigate to Pickup
            </Button>
          )}

        {renderButton()}
      </CardContent>
    </Card>
  );
}
