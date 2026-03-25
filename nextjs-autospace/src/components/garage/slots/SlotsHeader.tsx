"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getMyManagerGarage } from "@/services/garage.service";

type Garage = {
  id: string;
  name: string;
  locationName: string;
  latitude: number;
  longitude: number;
  garageRegistrationNumber: string;
  capacity: number;
  status: string;
  openingTime: string;
  closingTime: string;
  standardSlotPrice: string;
  largeSlotPrice: string;
};

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const formattedHour = ((hour + 11) % 12) + 1;
  return `${formattedHour}:${m} ${suffix}`;
}

export function SlotsHeader() {
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
      <div className="px-6 pt-5">
        <Card className="px-5 py-3 border border-border bg-card">
          <p className="text-sm text-muted-foreground">
            Loading garage details...
          </p>
        </Card>
      </div>
    );
  }

  const isActive = garage.status.toLowerCase() === "active";

  return (
    <div className="px-6 pt-5">
      <Card className="border border-border bg-card shadow-sm">
        {/* SINGLE ROW LAYOUT */}
        <div className="px-6 py-4 flex items-center justify-between">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-10">
            {/* NAME + LOCATION */}
            <div>
              <p className="text-lg font-semibold leading-tight">
                {garage.name}
              </p>

              <p className="text-md text-muted-foreground">
                {garage.locationName}
              </p>
              <p className="text-xs text-muted-foreground">
                Lat: {garage.latitude}, Lng: {garage.longitude}
              </p>
            </div>

            {/* WORKING HOURS */}
            <InfoBlock
              label="Working Hours"
              value={`${formatTime(garage.openingTime)} – ${formatTime(
                garage.closingTime,
              )}`}
            />

            {/* CAPACITY */}
            <InfoBlock label="Capacity" value={`${garage.capacity} slots`} />

            {/* STANDARD PRICE */}
            <InfoBlock
              label="Std Slot Price"
              value={`₹${garage.standardSlotPrice}`}
            />

            {/* LARGE PRICE */}
            <InfoBlock
              label="Large Slot Price"
              value={`₹${garage.largeSlotPrice}`}
            />
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">
            {/* REG NUMBER */}
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Garage ID</p>

              <p className="text-xs font-medium">
                {garage.garageRegistrationNumber}
              </p>
            </div>

            {/* STATUS */}
            <div
              className={`
                flex items-center gap-2
                px-3 py-1
                rounded-full
                text-xs font-medium
                ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-red-500/10 text-red-600"
                }
              `}
            >
              <div
                className={`
                  w-2 h-2 rounded-full
                  ${isActive ? "bg-emerald-500" : "bg-red-500"}
                `}
              />

              {isActive ? "Active" : "Inactive"}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* SMALL BLOCK COMPONENT */
function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>

      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
