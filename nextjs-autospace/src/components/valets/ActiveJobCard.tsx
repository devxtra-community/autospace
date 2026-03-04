"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Car, User, Phone, MapPin, Clock, Calendar } from "lucide-react";

export type ValetStatus =
  | "ASSIGNED"
  | "ON_THE_WAY_PICKUP"
  | "PICKED_UP"
  | "PARKED"
  | "ON_THE_WAY_DROP"
  | "COMPLETED";

export type ActiveJob = {
  id: string;
  car: string;
  customer: string;
  phone: string;
  location: string;
  time: string;
  date: string;
  valetStatus: ValetStatus;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  pickupAddress?: string | null;
};

type Props = {
  req?: ActiveJob;
  onStartPickup?: () => void;
  onPickedUp?: () => void;
  onParked?: () => void;
  onStartDrop?: () => void;
  onComplete?: () => void;
};

export default function ActiveJobCard({
  req,
  onStartPickup,
  onPickedUp,
  onParked,
  onStartDrop,
  onComplete,
}: Props) {
  if (!req) return null;

  const status = req.valetStatus || "ASSIGNED";

  const statusColor: Record<string, string> = {
    ASSIGNED: "bg-blue-500",
    ON_THE_WAY_PICKUP: "bg-yellow-500",
    PICKED_UP: "bg-purple-500",
    PARKED: "bg-indigo-500",
    ON_THE_WAY_DROP: "bg-orange-500",
    COMPLETED: "bg-green-500",
  };

  const statusText: Record<string, string> = {
    ASSIGNED: "Assigned",
    ON_THE_WAY_PICKUP: "On the way to pickup",
    PICKED_UP: "Picked up",
    PARKED: "Parked",
    ON_THE_WAY_DROP: "On the way to drop",
    COMPLETED: "Completed",
  };

  const openPickupNavigation = () => {
    if (!req.pickupLatitude || !req.pickupLongitude) return;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${req.pickupLatitude},${req.pickupLongitude}&travelmode=driving`;

    window.open(url, "_blank");
  };

  const renderButton = () => {
    switch (status) {
      case "ASSIGNED":
        return (
          <Button className="w-full" onClick={onStartPickup}>
            Start Pickup
          </Button>
        );

      case "ON_THE_WAY_PICKUP":
        return (
          <Button className="w-full" onClick={onPickedUp}>
            Mark Picked Up
          </Button>
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

      case "ON_THE_WAY_DROP":
        return (
          <Button className="w-full" onClick={onComplete}>
            Complete Job
          </Button>
        );

      default:
        return null;
    }
  };

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
        {/* LOCATION */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={14} />
          {req.pickupAddress ?? req.location}
        </div>

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
