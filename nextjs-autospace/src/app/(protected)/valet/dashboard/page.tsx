"use client";

import { useEffect, useState } from "react";

import ValetHeader from "@/components/valets/ValetHeader";
import StatusCard from "@/components/valets/StatusCard";
import RequestCard from "@/components/valets/RequestCard";
import ActiveJobCard from "@/components/valets/ActiveJobCard";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  getValetRequests,
  acceptBooking,
  rejectBooking,
  getActiveJobs,
  getCompletedJobs,
  completeBooking,
} from "@/services/valet.service";

/* ================= TYPES ================= */

type BookingRequest = {
  id: string;
  car: string;
  customer: string;
  phone: string;
  location: string;
  time: string;
  date: string;
};

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
};

const transformBooking = (b: BackendBooking): BookingRequest => ({
  id: b.id,

  car: `Slot ${b.slotNumber} (${b.slotType})`,

  customer: b.customerName,

  phone: b.customerPhone,

  location: `${b.garageName}, ${b.garageLocation}`,

  time: `${new Date(b.pickupTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} → ${new Date(b.dropTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`,

  date: new Date(b.pickupTime).toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }),
});

/* ================= COMPONENT ================= */

export default function ValetDashboard() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [active, setActive] = useState<BookingRequest[]>([]);
  const [completed, setCompleted] = useState<BookingRequest[]>([]);

  /* ================= LOAD ALL DATA ================= */

  useEffect(() => {
    loadRequests();
    loadActiveJobs();
    loadCompletedJobs();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await getValetRequests();

      const formatted = data.map(transformBooking);

      setRequests(formatted);
    } catch (err) {
      console.error("Failed to load requests", err);
    }
  };

  const loadActiveJobs = async () => {
    try {
      const data = await getActiveJobs();

      const formatted = data.map(transformBooking);

      setActive(formatted);
    } catch (err) {
      console.error("Failed to load active jobs", err);
    }
  };

  const loadCompletedJobs = async () => {
    try {
      const data = await getCompletedJobs();

      const formatted = data.map(transformBooking);

      setCompleted(formatted);
    } catch (err) {
      console.error("Failed to load completed jobs", err);
    }
  };

  /* ================= ACTIONS ================= */

  const accept = async (req: BookingRequest) => {
    try {
      await acceptBooking(req.id);

      // move UI
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      setActive((prev) => [...prev, req]);
    } catch (err) {
      console.error("Accept failed", err);
    }
  };

  const reject = async (req: BookingRequest) => {
    try {
      await rejectBooking(req.id);

      setRequests((prev) => prev.filter((r) => r.id !== req.id));
    } catch (err) {
      console.error("Reject failed", err);
    }
  };

  const complete = async (req: BookingRequest) => {
    try {
      await completeBooking(req.id);

      setActive((prev) => prev.filter((r) => r.id !== req.id));

      setCompleted((prev) => [...prev, req]);
    } catch (err) {
      console.error("Complete failed", err);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-background">
      <ValetHeader />

      <StatusCard status="Available" />

      <Tabs defaultValue="requests" className="px-4">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="requests">
            Requests
            <Badge className="ml-2 bg-primary text-black">
              {requests.length}
            </Badge>
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

        {/* REQUESTS TAB */}

        <TabsContent value="requests">
          <ScrollArea className="h-[60vh] space-y-3">
            {requests.map((req) => (
              <RequestCard
                key={req.id}
                req={req}
                onAccept={() => accept(req)}
                onReject={() => reject(req)}
              />
            ))}
          </ScrollArea>
        </TabsContent>

        {/* ACTIVE TAB */}

        <TabsContent value="active">
          <ScrollArea className="h-[60vh] space-y-3">
            {active.map((req) => (
              <ActiveJobCard
                key={req.id}
                req={req}
                onComplete={() => complete(req)}
              />
            ))}
          </ScrollArea>
        </TabsContent>

        {/* COMPLETED TAB */}

        <TabsContent value="completed">
          <ScrollArea className="h-[60vh] space-y-3">
            {completed.map((req) => (
              <ActiveJobCard key={req.id} req={req} completed />
            ))}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
