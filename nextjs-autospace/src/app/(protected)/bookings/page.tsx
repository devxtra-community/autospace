"use client";

import { BackButton } from "@/components/ui/BackButton";

import Navbar from "@/components/landing/Navbar";
import { useEffect, useState, useCallback } from "react";
import {
  getMyBookings,
  submitGarageReview,
  Booking,
} from "@/services/booking.service";

import { getGarageById } from "@/services/garage.service";

import { Star, Loader2, Clock, X, Building } from "lucide-react";

import { cn } from "@/lib/utils";
import axios from "axios";

type Valet = {
  id: string;
  fullname: string;
  phone: string;
  email: string;
};

type Slot = {
  slotNumber: string;
  floorNumber: number;
};

type Garage = {
  name: string;
  locationName: string;
  contactPhone?: string;
};

type BookingWithGarage = Booking & {
  garage?: Garage;
  valet?: Valet | null;
  slot?: Slot | null;
  reviewSubmitted?: boolean;
};

type ApiError = {
  message?: string;
};

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  const [bookings, setBookings] = useState<BookingWithGarage[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] =
    useState<BookingWithGarage | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      const data = await getMyBookings();

      const enriched = await Promise.all(
        data.map(async (b) => {
          try {
            const garage = await getGarageById(b.garageId);

            return {
              ...b,
              garage,
              reviewSubmitted: b.reviewSubmitted ?? false,
            };
          } catch {
            return b;
          }
        }),
      );

      setBookings(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const activeBookings = bookings.filter(
    (b) =>
      b.status === "confirmed" ||
      b.status === "pending" ||
      b.status === "occupied",
  );

  const historyBookings = bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled",
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-32 pb-12 px-4 md:px-8 relative">
      <BackButton />
      <Navbar />

      <div className="pt-24 px-4 max-w-md mx-auto">
        <h1 className="text-xl font-semibold mb-4">My Bookings</h1>

        {/* Tabs */}

        <div className="flex bg-muted rounded-lg p-1 mb-5">
          <TabButton
            active={activeTab === "active"}
            onClick={() => setActiveTab("active")}
          >
            Active
          </TabButton>

          <TabButton
            active={activeTab === "history"}
            onClick={() => setActiveTab("history")}
          >
            History
          </TabButton>
        </div>

        {/* List */}

        <div className="space-y-4">
          {(activeTab === "active" ? activeBookings : historyBookings).map(
            (b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onClick={() => setSelectedBooking(b)}
              />
            ),
          )}
        </div>
      </div>

      {/* Modal */}

      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </main>
  );
}

function BookingCard({
  booking,
  onClick,
}: {
  booking: BookingWithGarage;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="border rounded-xl p-4 space-y-2 cursor-pointer hover:bg-muted/30 transition"
    >
      <h2 className="font-semibold">{booking.garage?.name}</h2>

      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Clock size={12} />
        {formatDate(booking.startTime)}
      </p>

      {booking.slot && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Building size={12} />
          Floor {booking.slot.floorNumber} • Slot {booking.slot.slotNumber}
        </p>
      )}

      <div className="flex justify-between items-center pt-1">
        <span className="text-xs uppercase">{booking.vehicleType}</span>

        <span className="font-semibold">₹{booking.amount}</span>
      </div>
    </div>
  );
}

function BookingModal({
  booking,
  onClose,
}: {
  booking: BookingWithGarage;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canReview = booking.status === "completed" && !booking.reviewSubmitted;

  async function handleSubmitReview() {
    if (rating === 0) {
      alert("Please select rating");
      return;
    }

    try {
      setSubmitting(true);

      await submitGarageReview({
        bookingId: booking.id,
        rating,
        comment,
      });

      alert("Review submitted successfully");

      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data as ApiError;

        alert(apiError?.message || "Failed to submit review");
      } else {
        alert("Unexpected error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Booking Details</h2>

          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Garage */}

        <p className="font-medium">{booking.garage?.name}</p>

        {/* Review */}

        {canReview && (
          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium">Rate this booking</p>

            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={28}
                  onClick={() => setRating(i)}
                  fill={i <= rating ? "currentColor" : "none"}
                  className="text-yellow-500 cursor-pointer"
                />
              ))}
            </div>

            <textarea
              placeholder="Write your review"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm resize-none h-24"
            />

            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              className="w-full bg-primary text-white py-2 rounded-lg text-sm"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-2 text-sm rounded-md",
        active ? "bg-white shadow font-medium" : "text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
