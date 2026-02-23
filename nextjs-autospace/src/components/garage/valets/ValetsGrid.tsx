"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, User, MapPin, Phone, CarFront } from "lucide-react";

import {
  getGarageValets,
  approveValet,
  rejectValet,
  getManualAssignBookings,
  assignValetManually,
  ManualAssignBooking,
  AvailableValet,
} from "@/services/garageValets.service";

import { getMyManagerGarage } from "@/services/garage.service";
import { cn } from "@/lib/utils";

/* ================= TYPES ================= */

type AvailabilityStatus = "AVAILABLE" | "BUSY" | "OFFLINE" | "OFF_DUTY";

type EmploymentStatus = "PENDING" | "ACTIVE" | "REJECTED";

type TabType = "ACTIVE" | "PENDING" | "UNASSIGNED";

interface GarageValet {
  id: string;
  name: string;
  email: string;
  phone: string;
  employmentStatus: EmploymentStatus;
  availabilityStatus: AvailabilityStatus;
}

/* ================= COMPONENT ================= */

export function ValetsGrid() {
  /* ================= STATE ================= */

  const [garageId, setGarageId] = useState<string>();

  const [pendingValets, setPendingValets] = useState<GarageValet[]>([]);

  const [valets, setValets] = useState<GarageValet[]>([]);

  const [unassignedBookings, setUnassignedBookings] = useState<
    ManualAssignBooking[]
  >([]);

  const [selectedValets, setSelectedValets] = useState<Record<string, string>>(
    {},
  );

  const [availabilityStatus, setAvailabilityStatus] = useState<
    AvailabilityStatus | "ALL"
  >("ALL");

  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] = useState<TabType>("ACTIVE");

  const limit = 8;

  /* ================= INIT ================= */

  useEffect(() => {
    const init = async () => {
      const garage = await getMyManagerGarage();
      if (garage?.id) setGarageId(garage.id);
    };
    init();
  }, []);

  /* ================= FETCH ================= */

  const fetchPending = useCallback(async () => {
    if (!garageId) return;

    const res = await getGarageValets(garageId, {
      page: 1,
      limit: 50,
      employmentStatus: "PENDING",
    });

    setPendingValets(res?.data ?? []);
  }, [garageId]);

  const fetchValets = useCallback(async () => {
    if (!garageId) return;

    const res = await getGarageValets(garageId, {
      page: 1,
      limit,
      employmentStatus: "ACTIVE",
      availabilityStatus:
        availabilityStatus === "ALL" ? undefined : availabilityStatus,
      search: search || undefined,
    });

    setValets(res?.data ?? []);
  }, [garageId, availabilityStatus, search]);

  const fetchManualAssign = useCallback(async () => {
    if (!garageId) return;

    const data = await getManualAssignBookings();

    setUnassignedBookings(Array.isArray(data) ? data : []);
  }, [garageId]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  useEffect(() => {
    fetchValets();
  }, [fetchValets]);

  useEffect(() => {
    if (activeTab === "UNASSIGNED") fetchManualAssign();
  }, [activeTab, fetchManualAssign]);

  /* ================= ACTIONS ================= */

  const handleApprove = async (id: string) => {
    await approveValet(id);
    fetchPending();
    fetchValets();
  };

  const handleReject = async (id: string) => {
    await rejectValet(id);
    fetchPending();
    fetchValets();
  };

  const handleSelectValet = (bookingId: string, valetId: string) => {
    setSelectedValets((prev) => ({
      ...prev,
      [bookingId]: valetId,
    }));
  };

  const handleAssign = async (bookingId: string) => {
    const valetId = selectedValets[bookingId];

    if (!valetId) return;

    await assignValetManually(bookingId, valetId);

    await fetchManualAssign();
    await fetchValets();

    setSelectedValets((prev) => {
      const copy = { ...prev };
      delete copy[bookingId];
      return copy;
    });
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* SEARCH */}

      <div className="flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search valets..."
          className="border border-border rounded-lg px-3 py-2 w-80 bg-background"
        />

        <select
          value={availabilityStatus}
          onChange={(e) =>
            setAvailabilityStatus(e.target.value as AvailabilityStatus | "ALL")
          }
          className="border border-border rounded-lg px-3 py-2 bg-background"
        >
          <option value="ALL">All</option>
          <option value="AVAILABLE">Available</option>
          <option value="BUSY">Busy</option>
          <option value="OFFLINE">Offline</option>
          <option value="OFF_DUTY">Off Duty</option>
        </select>
      </div>

      {/* TABS */}

      <div className="flex gap-6 border-b">
        {[
          {
            key: "ACTIVE",
            label: "Active Valets",
          },
          {
            key: "PENDING",
            label: "Pending Approval",
          },
          {
            key: "UNASSIGNED",
            label: "Manual Assignment Required",
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={cn(
              "pb-3 text-sm font-medium border-b-2 transition",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ACTIVE */}

      {activeTab === "ACTIVE" && (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted border-b">
              <tr>
                <th className="px-4 py-3 text-xs font-bold">Name</th>
                <th className="px-4 py-3 text-xs font-bold">Email</th>
                <th className="px-4 py-3 text-xs font-bold">Phone</th>
                <th className="px-4 py-3 text-xs font-bold">Status</th>
              </tr>
            </thead>

            <tbody>
              {valets.map((valet) => (
                <tr key={valet.id}>
                  <td className="px-4 py-3 font-medium">{valet.name}</td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {valet.email}
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {valet.phone}
                  </td>

                  <td className="px-4 py-3 font-semibold">
                    {valet.availabilityStatus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PENDING */}

      {activeTab === "PENDING" && (
        <div className="grid gap-4">
          {pendingValets.map((valet) => (
            <div key={valet.id} className="border rounded-xl bg-card p-5">
              <div className="font-semibold">{valet.name}</div>

              <div className="text-sm text-muted-foreground">{valet.email}</div>

              <div className="text-sm text-muted-foreground">{valet.phone}</div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleApprove(valet.id)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  Approve
                </button>

                <button
                  onClick={() => handleReject(valet.id)}
                  className="px-4 py-2 bg-muted rounded-lg"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UNASSIGNED */}

      {activeTab === "UNASSIGNED" && (
        <div className="grid gap-4">
          {unassignedBookings.map((booking) => {
            const selected = selectedValets[booking.bookingId] || "";

            const availableValets = booking.availableValets ?? [];

            return (
              <div
                key={booking.bookingId}
                className="border bg-card rounded-xl p-6"
              >
                <div className="grid md:grid-cols-3 gap-6">
                  {/* LEFT */}

                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      <User size={16} />
                      {booking.customer?.name}
                    </div>

                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone size={14} />
                      {booking.customer?.phone}
                    </div>

                    <div className="text-sm flex items-center gap-2">
                      <MapPin size={14} />
                      {booking.garage?.name}
                    </div>

                    <div className="text-sm flex items-center gap-2">
                      <CarFront size={14} />
                      Slot {booking.slot?.slotNumber}
                    </div>
                  </div>

                  {/* CENTER */}

                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {new Date(booking.timing.startTime).toLocaleString()}
                    </div>

                    <div className="text-muted-foreground">
                      →{new Date(booking.timing.endTime).toLocaleString()}
                    </div>
                  </div>

                  {/* RIGHT */}

                  <div className="space-y-3">
                    <select
                      value={selected}
                      onChange={(e) =>
                        handleSelectValet(booking.bookingId, e.target.value)
                      }
                      className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                    >
                      <option value="">Select valet</option>

                      {availableValets.map((valet: AvailableValet) => (
                        <option key={valet.id} value={valet.id}>
                          {valet.name}/{valet.phone}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleAssign(booking.bookingId)}
                      disabled={!selected}
                      className={cn(
                        "w-full py-2 rounded-lg font-medium",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground cursor-not-allowed",
                      )}
                    >
                      Assign Valet
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
