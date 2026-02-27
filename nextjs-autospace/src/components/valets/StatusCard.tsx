"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getMyValet } from "@/services/valet.service";

type AvailabilityStatus = "AVAILABLE" | "BUSY" | "OFF_DUTY" | "OFFLINE";

type EmploymentStatus = "PENDING" | "ACTIVE" | "REJECTED";

export default function StatusCard() {
  const [availabilityStatus, setAvailabilityStatus] =
    useState<AvailabilityStatus>("OFFLINE");

  const [employmentStatus, setEmploymentStatus] =
    useState<EmploymentStatus>("PENDING");

  useEffect(() => {
    async function load() {
      try {
        const valet = await getMyValet();
        setAvailabilityStatus(valet.availabilityStatus);
        setEmploymentStatus(valet.employmentStatus);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const statusColor =
    availabilityStatus === "AVAILABLE"
      ? "bg-emerald-500"
      : availabilityStatus === "BUSY"
        ? "bg-amber-500"
        : availabilityStatus === "OFF_DUTY"
          ? "bg-gray-400"
          : "bg-red-500";

  const availabilityLabel = availabilityStatus.replace("_", " ");

  return (
    <div className="px-4 pt-1">
      <Card className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            {/* STATUS DOT */}
            <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />

            {/* STATUS TEXT */}
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-muted-foreground">Your Status</span>

              <span className="text-base font-semibold tracking-tight">
                {availabilityLabel}
              </span>
            </div>
          </div>

          {/* EMPLOYMENT BADGE */}
          <div
            className={`
              text-[11px]
              px-2.5 py-1
              rounded-full
              font-medium
              ${
                employmentStatus === "ACTIVE"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }
            `}
          >
            {employmentStatus}
          </div>
        </div>
      </Card>
    </div>
  );
}
