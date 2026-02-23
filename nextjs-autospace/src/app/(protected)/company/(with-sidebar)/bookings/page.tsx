"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Building,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getMyCompany, getCompanyBookings } from "@/services/company.service";

/* ================= TYPES ================= */

interface Booking {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  garageId: string;
  garageName: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/* ================= COMPONENT ================= */

export default function CompanyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("ALL");

  const [startDate, setStartDate] = useState("");

  const [page, setPage] = useState(1);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  /* ================= FETCH ================= */

  const fetchBookings = useCallback(async () => {
    setLoading(true);

    try {
      const company = await getMyCompany();

      const res = await getCompanyBookings(company.id, {
        page,
        limit: 8,
        status: status === "ALL" ? undefined : status,
        search: search || undefined,
        startDate: startDate || undefined,
      });

      setBookings(res.data);

      setMeta(res.meta);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  }, [page, status, search, startDate]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /* ================= HELPERS ================= */

  const statusStyle: Record<string, string> = {
    confirmed: "bg-blue-100 text-blue-700",

    pending: "bg-yellow-100 text-yellow-700",

    completed: "bg-green-100 text-green-700",

    cancelled: "bg-red-100 text-red-700",
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex items-center gap-2">
        <ClipboardList size={22} />

        <h1 className="text-2xl font-semibold">Company Bookings</h1>
      </div>

      {/* FILTERS */}

      <div className="flex flex-wrap gap-3">
        {/* SEARCH */}

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-3 text-muted-foreground"
          />

          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search customer or garage..."
            className="pl-9 pr-3 py-2 border rounded-lg bg-background w-64"
          />
        </div>

        {/* STATUS */}

        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="border rounded-lg px-3 py-2 bg-background"
        >
          <option value="ALL">All Status</option>

          <option value="confirmed">Confirmed</option>

          <option value="pending">Pending</option>

          <option value="completed">Completed</option>

          <option value="cancelled">Cancelled</option>
        </select>

        {/* DATE FILTER */}

        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setPage(1);
            setStartDate(e.target.value);
          }}
          className="border rounded-lg px-3 py-2 bg-background"
        />
      </div>

      {/* LOADING */}

      {loading && (
        <div className="text-sm text-muted-foreground">Loading bookings...</div>
      )}

      {/* TABLE */}

      <div className="border rounded-xl overflow-hidden bg-card">
        <table className="w-full">
          <thead className="bg-muted border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold">
                Customer
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold">
                Garage
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold">
                Date
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {bookings.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-6 text-muted-foreground"
                >
                  No bookings found
                </td>
              </tr>
            )}

            {bookings.map((booking) => (
              <tr
                key={booking.bookingId}
                onClick={() => setSelectedBooking(booking)}
                className="border-b hover:bg-muted/40 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">
                    {booking.customerName || "-"}
                  </div>
                </td>

                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Building size={14} />

                    {booking.garageName || "-"}
                  </div>
                </td>

                <td className="px-4 py-3 text-sm">
                  <div>{formatDate(booking.startTime)}</div>

                  <div className="text-muted-foreground flex items-center gap-1">
                    <Clock size={13} />

                    {formatTime(booking.startTime)}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      statusStyle[booking.status] ||
                        "bg-gray-100 text-gray-700",
                    )}
                  >
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}

      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Page {meta.page} of {meta.totalPages}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border rounded-lg disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="p-2 border rounded-lg disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* MODAL */}

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 w-[420px] space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold">Booking Details</h2>

            <div className="space-y-2 text-sm">
              <div>Customer: {selectedBooking.customerName}</div>

              <div>Phone: {selectedBooking.customerPhone}</div>

              <div>Email: {selectedBooking.customerEmail}</div>

              <div>Garage: {selectedBooking.garageName}</div>

              <div>
                Start: {formatDate(selectedBooking.startTime)}{" "}
                {formatTime(selectedBooking.startTime)}
              </div>

              <div>
                End: {formatDate(selectedBooking.endTime)}{" "}
                {formatTime(selectedBooking.endTime)}
              </div>

              <div>Status: {selectedBooking.status}</div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
