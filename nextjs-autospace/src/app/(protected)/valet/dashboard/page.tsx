"use client";

import { useEffect, useState } from "react";

import ValetHeader from "@/components/valets/ValetHeader";
import StatusCard from "@/components/valets/StatusCard";
import RequestCard from "@/components/valets/RequestCard";
import ActiveJobCard, {
  ActiveJob,
  ValetStatus,
} from "@/components/valets/ActiveJobCard";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { ScrollArea } from "@/components/ui/scroll-area";

import {
  getValetRequests,
  acceptBooking,
  rejectBooking,
  getActiveJobs,
  getCompletedJobs,
  updateValetStatus,
  completeBooking,
  verifyPickupPin,
} from "@/services/valet.service";

type BackendBooking = {
  id: string;
  slotNumber: string;
  slotType: string;
  floorNumber: number;
  entryPin: string;
  exitPin: string;
  customerName: string;
  customerPhone: string;
  garageName: string;
  garageLocation: string;
  pickupTime: string;
  dropTime: string;
  valetStatus: ValetStatus;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  pickupAddress?: string | null;
  pickupPin?: string | null;
};

function transformBooking(b: BackendBooking): ActiveJob {
  return {
    id: b.id,
    car: `Slot ${b.slotNumber} (${b.slotType})`,
    floor: `Floor ${b.floorNumber}`,
    entryPin: b.entryPin,
    exitPin: b.exitPin,
    customer: b.customerName,
    phone: b.customerPhone,
    location: `${b.garageName}, ${b.garageLocation}`,
    time: `${new Date(b.pickupTime).toLocaleTimeString()} → ${new Date(
      b.dropTime,
    ).toLocaleTimeString()}`,
    date: new Date(b.pickupTime).toLocaleDateString(),
    valetStatus: b.valetStatus || "ASSIGNED",
    pickupLatitude: b.pickupLatitude ?? null,
    pickupLongitude: b.pickupLongitude ?? null,
    pickupAddress: b.pickupAddress ?? null,
    pickupPin: b.pickupPin ?? null,
  };
}

export default function ValetDashboard() {
  const [tab, setTab] = useState("requests");

  const [requests, setRequests] = useState<ActiveJob[]>([]);
  const [active, setActive] = useState<ActiveJob[]>([]);
  const [completed, setCompleted] = useState<ActiveJob[]>([]);

  useEffect(() => {
    loadAll();

    const interval = setInterval(loadAll, 15000);

    return () => clearInterval(interval);
  }, []);
  async function loadAll() {
    try {
      const req = await getValetRequests();
      const act = await getActiveJobs();
      const comp = await getCompletedJobs();

      setRequests(req.map(transformBooking));
      setActive(act.map(transformBooking));
      setCompleted(comp.map(transformBooking));
    } catch (err) {
      console.error(err);
    }
  }

  async function updateStatus(id: string, status: ValetStatus) {
    if (status === "COMPLETED") {
      await completeBooking(id);
    } else {
      await updateValetStatus(id, status);
    }

    await loadAll();
  }

  async function accept(id: string) {
    await acceptBooking(id);
    await loadAll();
  }

  async function reject(id: string) {
    await rejectBooking(id);
    await loadAll();
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <ValetHeader />
      <StatusCard />

      <Tabs value={tab} onValueChange={setTab} className="mt-4">
        {/* Modern Production Tabs */}
        <TabsList className="mx-4 grid grid-cols-3 rounded-xl bg-muted p-1 h-10">
          <TabsTrigger
            value="requests"
            className="rounded-lg text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Requests
            {requests.length > 0 && (
              <span className="ml-1 text-[10px] opacity-80">
                {requests.length}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="active"
            className="rounded-lg text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            In‑Progress
            {active.length > 0 && (
              <span className="ml-1 text-[10px] opacity-80">
                {active.length}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="completed"
            className="rounded-lg text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Completed
            {completed.length > 0 && (
              <span className="ml-1 text-[10px] opacity-80">
                {completed.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* REQUESTS */}
        <TabsContent value="requests">
          <ScrollArea className="h-[60vh] px-4 mt-3 space-y-3">
            {requests.map((job) => (
              <RequestCard
                key={job.id}
                req={job}
                onAccept={() => accept(job.id)}
                onReject={() => reject(job.id)}
              />
            ))}
          </ScrollArea>
        </TabsContent>

        {/* ACTIVE */}
        <TabsContent value="active">
          <ScrollArea className="h-[60vh] px-4 mt-3 space-y-3">
            {active.map((job) => (
              <ActiveJobCard
                key={job.id}
                req={job}
                onStartPickup={() =>
                  updateStatus(job.id, "ON_THE_WAY_TO_PICKUP")
                }
                onVerifyPickupPin={async (pin: string) => {
                  await verifyPickupPin(job.id, pin);
                  await loadAll();
                }}
                onParked={() => updateStatus(job.id, "PARKED")}
                onStartDrop={() => updateStatus(job.id, "ON_THE_WAY_TO_DROP")}
                onComplete={() => updateStatus(job.id, "COMPLETED")}
              />
            ))}
          </ScrollArea>
        </TabsContent>

        {/* COMPLETED */}
        <TabsContent value="completed">
          <ScrollArea className="h-[60vh] px-4 mt-3 space-y-3">
            {completed.map((job) => (
              <ActiveJobCard key={job.id} req={job} />
            ))}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
