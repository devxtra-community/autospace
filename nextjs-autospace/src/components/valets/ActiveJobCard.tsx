"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Car, User, Phone, MapPin, Clock, Calendar } from "lucide-react";

type ActiveJobCardProps = {
  req: {
    id: string;
    car: string;
    customer: string;
    phone: string;
    location: string;
    time: string;
    date: string;
  };
  onComplete?: () => void;
  completed?: boolean;
};
export default function ActiveJobCard({
  req,
  onComplete,
  completed,
}: ActiveJobCardProps) {
  return (
    <Card className="rounded-xl">
      <CardContent className="p-4 space-y-3">
        {/* HEADER */}
        <div className="flex justify-between">
          <div className="font-semibold flex items-center gap-2">
            <Car size={16} />
            {req.car}
          </div>

          <Badge
            className={
              completed ? "bg-green-500 text-white" : "bg-blue-500 text-white"
            }
          >
            {completed ? "COMPLETED" : "IN PROGRESS"}
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
          {req.location}
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

        {/* COMPLETE BUTTON */}
        {!completed && (
          <Button className="w-full" onClick={onComplete}>
            Complete Job
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
