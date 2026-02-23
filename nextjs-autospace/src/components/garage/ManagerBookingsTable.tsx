"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  CheckCircle2,
  X,
  RefreshCw,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Booking } from "@/services/booking.service";
import apiClient from "@/lib/apiClient";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const statusStyles: Record<string, string> = {
  completed: "bg-green-100 text-green-700 border-green-200",
  occupied: "bg-blue-100 text-blue-700 border-blue-200",
  confirmed: "bg-indigo-100 text-indigo-700 border-indigo-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

// --- Verify Modal Component ---
interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (type: "entry" | "exit") => void;
  booking?: Booking | null;
}

const VerifyModal: React.FC<VerifyModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  booking,
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !booking) return null;

  const isEntry = booking.status === "confirmed";
  const endpoint = isEntry
    ? `/api/bookings/${booking.id}/enter`
    : `/api/bookings/${booking.id}/exit`;

  const handleVerify = async () => {
    if (loading) return;

    if (!pin.trim()) {
      setError("Enter PIN");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await apiClient.post(endpoint, { pin });

      onVerify(isEntry ? "entry" : "exit");
      setPin("");
      onClose();
    } catch (err: unknown) {
      let message = "Verification failed";

      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (err as { response?: unknown }).response;

        if (
          typeof response === "object" &&
          response !== null &&
          "data" in response
        ) {
          const data = (response as { data?: unknown }).data;

          if (
            typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof (data as { message?: unknown }).message === "string"
          ) {
            message = (data as { message: string }).message;
          }
        }
      }

      setError(message);
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[var(--radius)] shadow-2xl p-6 relative animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground mt-2">
            {isEntry ? "Verify Entry" : "Verify Exit"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Booking ID:{" "}
            <span className="font-semibold text-foreground">{booking.id}</span>
          </p>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              Enter {isEntry ? "Entry" : "Exit"} PIN
            </label>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="e.g. 1234"
              className={cn(
                "w-full h-11 px-4 rounded-[var(--radius)] border focus:ring-1 outline-none transition-all",
                error
                  ? "border-destructive focus:ring-destructive"
                  : "border-border focus:border-primary focus:ring-primary",
              )}
            />
            {error && <p className="text-xs text-destructive ml-1">{error}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-11 rounded-[var(--radius)] border border-border font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={loading}
              className="flex-1 h-11 bg-secondary hover:bg-secondary/90 text-primary-foreground font-bold rounded-[var(--radius)] transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Verify"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ManagerBookingsTableProps {
  bookings: Booking[];
  loading?: boolean;
  onRowClick?: (booking: Booking) => void;
  refreshBookings: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onDateChange: (date: string) => void;
  searchTerm: string;
  dateFilter: string;
}

export default function ManagerBookingsTable({
  bookings,
  loading = false,
  onRowClick,
  refreshBookings,
  currentPage,
  totalPages,
  onPageChange,
  onSearchChange,
  onDateChange,
  searchTerm,
  dateFilter,
}: ManagerBookingsTableProps) {
  const [successMessage, setSuccessMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const handleVerifySuccess = (type: "entry" | "exit") => {
    setSuccessMessage(
      type === "entry"
        ? "Entry Verified Successfully"
        : "Exit Verified Successfully",
    );
    refreshBookings();
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="w-full bg-background min-h-screen p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Bookings
            </h1>
            <p className="text-muted-foreground">
              View and manage all parking bookings
            </p>
          </div>

          {/* Success Toast / Message */}
          {successMessage && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-[var(--radius)] border border-green-100 shadow-sm animate-in slide-in-from-top-4 duration-300">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}
        </div>

        {/* Filters Top Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-end bg-card p-6 rounded-[var(--radius)] shadow-sm border border-border">
          <div className="w-full md:w-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full h-11 px-4 rounded-[var(--radius)] border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-background text-foreground"
              />
            </div>
            <div className="space-y-1.5 text-left relative group">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Search ID
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Booking ID..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-[var(--radius)] border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-background text-foreground"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => refreshBookings()}
              disabled={loading}
              className="h-11 w-11 flex items-center justify-center bg-background border border-border hover:bg-muted rounded-[var(--radius)] text-muted-foreground transition-all active:rotate-180 duration-500 disabled:opacity-50 shadow-sm"
              title="Refresh Bookings"
            >
              <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Table Container - Adaptive Height, No Page Scroll for 8 rows */}
        <div className="bg-card rounded-[var(--radius)] shadow-xl overflow-hidden border border-border flex flex-col h-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-secondary">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-primary-foreground border-b border-black/10">
                    SL.NO
                  </th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-primary-foreground border-b border-black/10">
                    SLOT NAME
                  </th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-primary-foreground border-b border-black/10">
                    DATE
                  </th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-primary-foreground border-b border-black/10">
                    STATUS
                  </th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-primary-foreground border-b border-black/10">
                    ACTION
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="p-8">
                        <div className="h-4 bg-muted rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : bookings.length > 0 ? (
                  bookings.map((booking, index) => (
                    <tr
                      key={booking.id}
                      onClick={() => onRowClick?.(booking)}
                      className="group hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6 text-sm text-muted-foreground font-medium">
                        {(currentPage - 1) * 8 + index + 1}
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-foreground">
                        {booking.slotNumber}
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {new Date(booking.startTime).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider",
                            statusStyles[booking.status] ||
                              "bg-gray-100 text-gray-700 border-gray-200",
                          )}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(booking);
                            setIsModalOpen(true);
                          }}
                          disabled={
                            booking.status === "completed" ||
                            booking.status === "cancelled"
                          }
                          className="px-4 py-1.5 bg-secondary hover:bg-secondary/90 disabled:bg-gray-400 disabled:text-white disabled:cursor-not-allowed text-primary-foreground text-xs font-bold rounded-[var(--radius)] transition-all shadow-sm active:scale-[0.95]"
                        >
                          Verify
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                        <Inbox className="w-12 h-12 text-muted-foreground" />
                        <h3 className="text-xl font-semibold text-muted-foreground">
                          No bookings found
                        </h3>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Simplified Next/Prev as requested */}
          {totalPages > 1 && (
            <div className="p-4 bg-card border-t border-border flex items-center justify-between px-6">
              <span className="text-sm text-muted-foreground">
                Showing Page{" "}
                <span className="font-semibold text-foreground">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {totalPages || 1}
                </span>
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="flex items-center gap-1.5 px-4 h-10 rounded-[var(--radius)] border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all text-foreground font-medium text-sm shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={
                    currentPage === totalPages || totalPages === 0 || loading
                  }
                  className="flex items-center gap-1.5 px-4 h-10 rounded-[var(--radius)] border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all text-foreground font-medium text-sm shadow-sm"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      <VerifyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVerify={handleVerifySuccess}
        booking={selectedBooking}
      />
    </div>
  );
}
