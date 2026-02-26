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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  getValetRequests,
  acceptBooking,
  rejectBooking,
  getActiveJobs,
  getCompletedJobs,
  updateValetStatus,
} from "@/services/valet.service";

type BackendBooking = {
  id: string;
  slotNumber: string;
  slotType: string;
  customerName: string;
  customerPhone: string;
  garageName: string;
  garageLocation: string;
  pickupTime: string;
  dropTime: string;
  valetStatus: ValetStatus;
};

function transformBooking(b: BackendBooking): ActiveJob {
  return {
    id: b.id,
    car: `Slot ${b.slotNumber} (${b.slotType})`,
    customer: b.customerName,
    phone: b.customerPhone,
    location: `${b.garageName}, ${b.garageLocation}`,
    time: `${new Date(b.pickupTime).toLocaleTimeString()} → ${new Date(
      b.dropTime,
    ).toLocaleTimeString()}`,
    date: new Date(b.pickupTime).toLocaleDateString(),
    valetStatus: b.valetStatus || "ASSIGNED",
  };
}

export default function ValetDashboard() {
  const [requests, setRequests] = useState<ActiveJob[]>([]);
  const [active, setActive] = useState<ActiveJob[]>([]);
  const [completed, setCompleted] = useState<ActiveJob[]>([]);

  useEffect(() => {
    loadAll();
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
    await updateValetStatus(id, status);

    setActive((prev) =>
      prev.map((job) =>
        job.id === id ? { ...job, valetStatus: status } : job,
      ),
    );

    if (status === "COMPLETED") {
      const job = active.find((j) => j.id === id);
      if (job) {
        setCompleted((prev) => [...prev, { ...job, valetStatus: status }]);
        setActive((prev) => prev.filter((j) => j.id !== id));
      }
    }
  }

  async function accept(id: string) {
    await acceptBooking(id);
    loadAll();
  }

  async function reject(id: string) {
    await rejectBooking(id);
    loadAll();
  }

  return (
    <div className="min-h-screen bg-background">
      <ValetHeader />
      <StatusCard status="Available" />

      <Tabs defaultValue="requests" className="px-4">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="requests">
            Requests
            <Badge className="ml-2">{requests.length}</Badge>
          </TabsTrigger>

          <TabsTrigger value="active">
            Active
            <Badge className="ml-2">{active.length}</Badge>
          </TabsTrigger>

          <TabsTrigger value="completed">
            Completed
            <Badge className="ml-2">{completed.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* REQUESTS */}
        <TabsContent value="requests">
          <ScrollArea className="h-[60vh] space-y-3">
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
          <ScrollArea className="h-[60vh] space-y-3">
            {active.map((job) => (
              <ActiveJobCard
                key={job.id}
                req={job}
                onStartPickup={() => updateStatus(job.id, "ON_THE_WAY_PICKUP")}
                onPickedUp={() => updateStatus(job.id, "PICKED_UP")}
                onParked={() => updateStatus(job.id, "PARKED")}
                onStartDrop={() => updateStatus(job.id, "ON_THE_WAY_DROP")}
                onComplete={() => updateStatus(job.id, "COMPLETED")}
              />
            ))}
          </ScrollArea>
        </TabsContent>

        {/* COMPLETED */}
        <TabsContent value="completed">
          <ScrollArea className="h-[60vh] space-y-3">
            {completed.map((job) => (
              <ActiveJobCard key={job.id} req={job} />
            ))}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
