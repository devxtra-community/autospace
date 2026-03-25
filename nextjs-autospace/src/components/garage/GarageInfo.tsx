"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, User } from "lucide-react";
import { getMyManagerGarage } from "@/services/garage.service";

type Garage = {
  id: string;
  name: string;
  locationName: string;
  contactPhone?: string;
  contactEmail?: string;
  status: string;
  activeValetCount: number;
};

export function GarageInfo() {
  const [garage, setGarage] = useState<Garage | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyManagerGarage();
        setGarage(data);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, []);

  if (!garage) {
    return (
      <Card className="rounded-xl mb-8">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Loading garage details...
          </p>
        </CardContent>
      </Card>
    );
  }

  const isActive = garage.status?.toLowerCase() === "active";

  return (
    <Card className="rounded-xl mb-8 shadow-sm border border-border">
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* LEFT — Garage Details */}
        <div>
          <h3 className="text-xl font-semibold tracking-tight">
            {garage.name}
          </h3>

          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <MapPin size={18} />
              {garage.locationName}
            </p>

            {garage.contactPhone && (
              <p className="flex items-center gap-2">
                <Phone size={18} />
                {garage.contactPhone}
              </p>
            )}
            {garage.contactEmail && (
              <p className="flex items-center gap-2">
                <User size={18} />
                {garage.contactEmail}
              </p>
            )}
          </div>
        </div>

        {/* CENTER — Status */}
        <div
          className={`
            rounded-xl p-6 flex flex-col items-center justify-center
            ${
              isActive
                ? "bg-emerald-500/10 text-emerald-700"
                : "bg-red-500/10 text-red-700"
            }
          `}
        >
          <p className="text-sm">Garage Status</p>
          <p className="text-2xl font-bold mt-1">
            {isActive ? "Active" : "Inactive"}
          </p>
        </div>

        {/* RIGHT — Valet Count */}
        <div className="bg-black text-white rounded-xl p-6 flex flex-col items-center justify-center">
          <p className="text-sm">Active Valets</p>
          <p className="text-2xl font-bold mt-1">{garage.activeValetCount}</p>
        </div>
      </CardContent>
    </Card>
  );
}
