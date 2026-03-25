"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Car, Phone, MapPin, Clock, Calendar, Hash, Key } from "lucide-react";

type RequestCardProps = {
  req: {
    id: string;
    car: string;
    customer: string;
    phone: string;
    location: string;
    time: string;
    date: string;
    floor: string;
    pickupPin?: string | null;
  };
  onAccept: () => void;
  onReject: () => void;
};

export default function RequestCard({
  req,
  onAccept,
  onReject,
}: RequestCardProps) {
  return (
    <Card className="rounded-xl">
      <CardContent className="p-4 space-y-3">
        {/* HEADER */}
        <div className="flex justify-between">
          <div className="flex items-center gap-2 font-medium">
            <Car size={16} />
            {req.car}
          </div>

          <Badge className="bg-yellow-400 text-black">NEW REQUEST</Badge>
        </div>

        {/* CUSTOMER */}
        <div className="text-sm font-medium">{req.customer}</div>

        {/* PHONE */}
        <div className="flex items-center gap-2 text-sm">
          <Phone size={14} />
          {req.phone}
        </div>

        <a href={`tel:${req.phone}`}>
          <button className="w-full flex items-center justify-center gap-2 bg-black text-white py-2 rounded-md text-sm font-semibold hover:bg-gray-800 transition mt-2">
            <Phone size={16} />
            Call Customer
          </button>
        </a>

        {/* LOCATION */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={14} />
          {req.location}
        </div>

        {/* FLOOR */}
        <div className="flex items-center gap-2 text-sm">
          <Hash size={14} />
          {req.floor}
        </div>

        {/* PICKUP PIN — shown so valet knows what to verify with customer */}
        {req.pickupPin && (
          <div className="flex items-center gap-2 text-sm">
            <Key size={14} />
            Pickup PIN:{" "}
            <span className="font-semibold tracking-widest">
              {req.pickupPin}
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

        {/* ACTION BUTTONS */}
        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1 bg-primary text-black hover:bg-secondary"
            onClick={onAccept}
          >
            Accept
          </Button>

          <Button variant="destructive" className="flex-1" onClick={onReject}>
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
