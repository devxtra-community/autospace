"use client";

import { useEffect, useState, useCallback } from "react";
import {
  User,
  MapPin,
  Phone,
  Users,
  ClipboardList,
  UserCheck,
  LucideIcon,
} from "lucide-react";

import {
  getGarageValets,
  approveValet,
  rejectValet,
  getManualAssignBookings,
  assignValetManually,
  ManualAssignBooking,
} from "@/services/garageValets.service";

import { getMyManagerGarage } from "@/services/garage.service";
import { cn } from "@/lib/utils";

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

function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
        <Icon size={26} className="text-muted-foreground" />
      </div>

      <p className="font-semibold text-sm">{title}</p>

      <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
        {subtitle}
      </p>
    </div>
  );
}

export function ValetsGrid() {
  const [garageId, setGarageId] = useState<string>();

  const [pendingValets, setPendingValets] = useState<GarageValet[]>([]);
  const [valets, setValets] = useState<GarageValet[]>([]);
  const [unassignedBookings, setUnassignedBookings] = useState<
    ManualAssignBooking[]
  >([]);

  const [selectedValets, setSelectedValets] = useState<Record<string, string>>(
    {},
  );

  const [activeTab, setActiveTab] = useState<TabType>("ACTIVE");

  const [availabilityStatus, setAvailabilityStatus] = useState<
    AvailabilityStatus | "ALL"
  >("ALL");

  const [search, setSearch] = useState("");

  const limit = 10;

  useEffect(() => {
    async function init() {
      const garage = await getMyManagerGarage();
      if (garage?.id) setGarageId(garage.id);
    }
    init();
  }, []);

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

  const fetchUnassigned = useCallback(async () => {
    if (!garageId) return;

    const data = await getManualAssignBookings();

    setUnassignedBookings(Array.isArray(data) ? data : []);
  }, [garageId]);

  useEffect(() => {
    fetchPending();
    fetchValets();
  }, [fetchPending, fetchValets]);

  useEffect(() => {
    if (activeTab === "UNASSIGNED") fetchUnassigned();
  }, [activeTab, fetchUnassigned]);

  async function handleApprove(id: string) {
    await approveValet(id);
    fetchPending();
    fetchValets();
  }

  async function handleReject(id: string) {
    await rejectValet(id);
    fetchPending();
    fetchValets();
  }

  async function handleAssign(bookingId: string) {
    const valetId = selectedValets[bookingId];

    if (!valetId) return;

    await assignValetManually(bookingId, valetId);

    fetchUnassigned();
    fetchValets();
  }

  function statusColor(status: AvailabilityStatus) {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-500/10 text-emerald-600";

      case "BUSY":
        return "bg-amber-500/10 text-amber-600";

      case "OFF_DUTY":
        return "bg-gray-500/10 text-gray-600";

      default:
        return "bg-red-500/10 text-red-600";
    }
  }

  return (
    <div className="space-y-5">
      {/* SEARCH */}
      <div className="flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search valet..."
          className="border border-border rounded-xl px-3 py-2 text-sm bg-background w-60"
        />

        <select
          value={availabilityStatus}
          onChange={(e) =>
            setAvailabilityStatus(e.target.value as AvailabilityStatus | "ALL")
          }
          className="border border-border rounded-xl px-3 py-2 text-sm bg-background"
        >
          <option value="ALL">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="BUSY">Busy</option>
          <option value="OFFLINE">Offline</option>
          <option value="OFF_DUTY">Off Duty</option>
        </select>
      </div>

      {/* TABS */}
      <div className="flex gap-6 border-b border-border">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={cn(
            "pb-3 text-sm font-semibold flex items-center gap-2",
            activeTab === "ACTIVE"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground",
          )}
        >
          Active
          <span className="bg-muted px-2 py-[2px] rounded-full text-xs">
            {valets.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("PENDING")}
          className={cn(
            "pb-3 text-sm font-semibold flex items-center gap-2",
            activeTab === "PENDING"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground",
          )}
        >
          Pending
          <span className="bg-muted px-2 py-[2px] rounded-full text-xs">
            {pendingValets.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("UNASSIGNED")}
          className={cn(
            "pb-3 text-sm font-semibold flex items-center gap-2",
            activeTab === "UNASSIGNED"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground",
          )}
        >
          Manual Assign
          <span className="bg-muted px-2 py-[2px] rounded-full text-xs">
            {unassignedBookings.length}
          </span>
        </button>
      </div>

      {/* ACTIVE */}
      {activeTab === "ACTIVE" && (
        <div className="border border-border rounded-2xl overflow-hidden bg-card">
          {valets.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No active valets"
              subtitle="Approved valets will appear here"
            />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Valet</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>

              <tbody>
                {valets.map((valet) => (
                  <tr key={valet.id} className="border-t hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="font-medium">{valet.name}</div>

                      <div className="text-xs text-muted-foreground">
                        {valet.email}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {valet.phone}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          statusColor(valet.availabilityStatus),
                        )}
                      >
                        {valet.availabilityStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* PENDING */}
      {activeTab === "PENDING" &&
        (pendingValets.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No pending valets"
            subtitle="New valet approvals will appear here"
          />
        ) : (
          <div className="space-y-3">
            {pendingValets.map((valet) => (
              <div
                key={valet.id}
                className="border border-border rounded-xl p-4 bg-card flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{valet.name}</div>

                  <div className="text-xs text-muted-foreground">
                    {valet.email}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(valet.id)}
                    className="bg-primary text-primary-foreground px-3 py-1 rounded-lg text-xs"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(valet.id)}
                    className="bg-muted px-3 py-1 rounded-lg text-xs"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* UNASSIGNED */}
      {activeTab === "UNASSIGNED" &&
        (unassignedBookings.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No manual assignments needed"
            subtitle="Bookings requiring valet assignment will appear here"
          />
        ) : (
          <div className="space-y-4">
            {unassignedBookings.map((booking) => {
              const selected = selectedValets[booking.bookingId] || "";

              return (
                <div
                  key={booking.bookingId}
                  className="border border-border rounded-xl p-5 bg-card"
                >
                  <div className="grid md:grid-cols-3 gap-5">
                    {/* LEFT */}
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <User size={14} />
                        {booking.customer?.name}
                      </div>

                      <div className="text-xs text-muted-foreground flex gap-2">
                        <Phone size={12} />
                        {booking.customer?.phone}
                      </div>

                      <div className="text-xs flex gap-2 mt-1">
                        <MapPin size={12} />
                        {booking.garage?.name}
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div>
                      <select
                        value={selected}
                        onChange={(e) =>
                          setSelectedValets((prev) => ({
                            ...prev,
                            [booking.bookingId]: e.target.value,
                          }))
                        }
                        className="border border-border rounded-lg px-2 py-1 text-sm w-full"
                      >
                        <option value="">Select valet</option>

                        {booking.availableValets?.map((valet) => (
                          <option key={valet.id} value={valet.id}>
                            {valet.name}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleAssign(booking.bookingId)}
                        className="mt-2 w-full bg-primary text-primary-foreground py-1 rounded-lg text-sm"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
    </div>
  );
}
