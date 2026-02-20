"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Car, Phone, MapPin, Clock, Calendar } from "lucide-react";

type RequestCardProps = {
  req: {
    id: string;
    car: string;
    customer: string;
    phone: string;
    location: string;
    time: string;
    date: string;
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
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between">
          <div className="flex items-center gap-2 font-medium">
            <Car size={16} />
            {req.car}
          </div>

          <Badge className="bg-yellow-200 text-black">NEW</Badge>
        </div>

        <div className="text-sm text-muted-foreground">{req.customer}</div>

        <div className="flex items-center gap-2 text-sm">
          <Phone size={14} />
          {req.phone}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <MapPin size={14} />
          {req.location}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock size={14} />
          {req.time}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} />
          {req.date}
        </div>

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
