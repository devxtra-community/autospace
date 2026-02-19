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
  active: "bg-blue-100 text-blue-700 border-blue-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

// --- Verify Modal Component ---
interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
  bookingId?: string;
}

const VerifyModal: React.FC<VerifyModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  bookingId,
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (!pin.trim()) {
      setError("Enter PIN");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await apiClient.post(`/api/bookings/${bookingId}/enter`, { pin });

      onVerify();
      setPin("");
      onClose();
    } catch {
      setError("Invalid PIN / Verification failed");
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
            Verify Entry
          </h2>
          <p className="text-sm text-muted-foreground">
            Booking ID:{" "}
            <span className="font-semibold text-foreground">{bookingId}</span>
          </p>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              Enter Entry PIN
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
}

export default function ManagerBookingsTable({
  bookings,
  loading = false,
  onRowClick,
}: ManagerBookingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const itemsPerPage = 10;

  // Filter Logic
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = booking.id
      .toString()
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter
      ? booking.startTime.includes(dateFilter)
      : true;
    return matchesSearch && matchesDate;
  });

  // Sorting - Date descending default
  const sortedBookings = [...filteredBookings].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
  );

  // Pagination Logic
  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = sortedBookings.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleApplyFilters = () => {
    setCurrentPage(1);
  };

  const handleVerifySuccess = () => {
    setSuccessMessage("Entry Verified Successfully");
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
                onChange={(e) => setDateFilter(e.target.value)}
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
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-11 pl-10 pr-4 rounded-[var(--radius)] border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-background text-foreground"
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleApplyFilters}
            className="h-11 px-8 bg-secondary hover:bg-secondary/90 text-primary-foreground rounded-[var(--radius)] font-medium transition-colors cursor-pointer w-full md:w-auto"
          >
            Apply Filters
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-card rounded-[var(--radius)] shadow-xl overflow-hidden border border-border flex flex-col min-h-[500px]">
          <div className="flex-1 overflow-x-auto">
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
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="p-8">
                        <div className="h-4 bg-muted rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : paginatedBookings.length > 0 ? (
                  paginatedBookings.map((booking, index) => (
                    <tr
                      key={booking.id}
                      onClick={() => onRowClick?.(booking)}
                      className="group hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6 text-sm text-muted-foreground font-medium">
                        {startIndex + index + 1}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 bg-card border-t border-border flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-[var(--radius)] border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center px-4 space-x-2">
                  <span className="text-sm font-medium text-foreground">
                    Page {currentPage}
                  </span>
                  <span className="text-sm text-muted-foreground">of</span>
                  <span className="text-sm font-medium text-foreground">
                    {totalPages}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-[var(--radius)] border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground"
                >
                  <ChevronRight className="w-5 h-5" />
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
        bookingId={selectedBooking?.id}
      />
    </div>
  );
}
