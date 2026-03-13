"use client";

import Navbar from "@/components/landing/Navbar";
import { BackButton } from "@/components/ui/BackButton";

import { useEffect, useState, useCallback } from "react";
import {
  getMyBookings,
  submitGarageReview,
  Booking,
} from "@/services/booking.service";

import { getGarageById } from "@/services/garage.service";

import {
  Phone,
  Navigation,
  Clock,
  Edit2,
  Star,
  // RotateCcw,
  CheckCircle2,
  // Wifi,
  X,
} from "lucide-react";
import { YellowLoader } from "@/components/ui/YellowLoader";

import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";

type Garage = {
  name: string;
  locationName: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
};

type BookingWithGarage = Booking & {
  garage?: Garage;
  reviewSubmitted?: boolean;
};

type ApiError = {
  message?: string;
};

const valetStatusConfig = {
  REQUESTED: {
    text: "Searching for valet...",
    bg: "bg-yellow-50 border-yellow-200 text-yellow-800",
    icon: Clock,
  },

  ASSIGNED: {
    text: "Valet assigned",
    bg: "bg-blue-50 border-blue-200 text-blue-800",
    icon: CheckCircle2,
  },

  ON_THE_WAY_TO_PICKUP: {
    text: "Valet is coming for pickup",
    bg: "bg-sky-50 border-sky-200 text-sky-800",
    icon: Navigation,
  },

  PICKED_UP: {
    text: "Car picked up by valet",
    bg: "bg-purple-50 border-purple-200 text-purple-800",
    icon: CheckCircle2,
  },

  PARKED: {
    text: "Car parked safely",
    bg: "bg-green-50 border-green-200 text-green-800",
    icon: CheckCircle2,
  },

  ON_THE_WAY_TO_DROP: {
    text: "Valet is bringing your car",
    bg: "bg-orange-50 border-orange-200 text-orange-800",
    icon: Navigation,
  },

  COMPLETED: {
    text: "Valet job completed",
    bg: "bg-gray-50 border-gray-200 text-gray-800",
    icon: CheckCircle2,
  },
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

    const interval = setInterval(() => {
      fetchBookings();
    }, 10000);

    return () => clearInterval(interval);
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
    return <YellowLoader text="Loading Bookings..." />;
  }

  return (
    <main className="min-h-screen bg-white pt-32 pb-12 px-4 md:px-8 relative">
      <BackButton className="fixed top-6 left-6 z-[100]" />
      <Navbar />

      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

        {/* Tabs */}
        <div className="flex mb-8 bg-[#F5F1E6] rounded-sm p-1">
          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "flex-1 py-3 text-sm font-bold rounded-sm",
              activeTab === "active"
                ? "bg-white border border-black"
                : "text-gray-500",
            )}
          >
            Active Bookings
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex-1 py-3 text-sm font-bold rounded-sm",
              activeTab === "history"
                ? "bg-white border border-black"
                : "text-gray-500",
            )}
          >
            Booking History
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === "active"
            ? activeBookings.map((b) => (
                <ActiveBookingCard key={b.id} booking={b} />
              ))
            : historyBookings.map((b) => (
                <HistoryBookingCard
                  key={b.id}
                  booking={b}
                  onClick={() => setSelectedBooking(b)}
                />
              ))}
        </div>
      </div>

      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </main>
  );
}

function ActiveBookingCard({ booking }: { booking: BookingWithGarage }) {
  const openDirections = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        const destLat = booking.garage?.latitude;
        const destLng = booking.garage?.longitude;

        const url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}&travelmode=driving`;

        window.open(url, "_blank");
      },
      () => {
        toast.error("Location permission denied");
      },
    );
  };

  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);

  const durationMs = end.getTime() - start.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);

  const total = Number(booking.amount ?? 0);

  // If valet is fixed ₹5
  const valetCharge = booking.valetRequested ? 5 : 0;

  // parking amount = total - valet
  const subtotal = Math.max(total - valetCharge, 0);

  return (
    <div className="bg-white border border-black rounded-sm overflow-hidden flex flex-col md:flex-row">
      {/* Left Portion */}
      <div className="p-6 md:w-1/2 border-r border-black/10">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">
            {booking.garage?.name || "Garage Name"}
          </h2>
          {/* <div className="bg-[#F4DA71] px-2 py-1 border border-black text-xs font-bold flex items-center gap-1">
            4 <Star size={10} fill="currentColor" />
          </div> */}
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">
              Adress:
            </p>
            <p className="text-sm">
              {booking.garage?.locationName ||
                "ABC nagar , kalamassery , kochi , kerala"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Phone size={16} className="text-gray-400" />
            <span className="text-sm font-medium">
              {booking.garage?.contactPhone || "+91 9999000090"}
            </span>
          </div>
        </div>

        <button
          onClick={openDirections}
          className="flex items-center gap-2 px-4 py-2 bg-[#F4DA71] border border-black rounded-sm text-sm font-bold hover:bg-[#eac855] transition-colors active:translate-y-[1px]"
        >
          <div className="bg-white/20 p-1 rounded-full border border-black/10">
            <Navigation size={14} />
          </div>
          Get Direction
        </button>
      </div>

      {/* Right Portion */}
      <div className="p-6 md:w-1/2 bg-gray-50/30">
        <div className="flex items-center gap-2 mb-6">
          <Clock size={18} className="text-gray-400" />
          <h3 className="text-sm font-bold">Booking Details</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-500 uppercase">start</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">
                {new Date(booking.startTime)
                  .toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                  .replace(",", "")}
              </p>
              <Edit2
                size={12}
                className="text-gray-400 cursor-pointer hover:text-black"
              />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-500 uppercase">End</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">
                {new Date(booking.endTime)
                  .toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                  .replace(",", "")}
              </p>
              <Edit2
                size={12}
                className="text-gray-400 cursor-pointer hover:text-black"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <span className="px-6 py-1 border border-black text-xs font-bold rounded-sm bg-white">
            {booking.vehicleType?.toUpperCase() || "N/A"}
          </span>
        </div>

        {booking.valetRequested &&
          booking.valetStatus &&
          booking.valetStatus !== "NONE" &&
          booking.valetStatus !== "REJECTED" &&
          (() => {
            const status = valetStatusConfig[booking.valetStatus];
            const Icon = status.icon;

            return (
              <div
                className={`flex items-center gap-3 p-3 border rounded-sm mb-6 ${status.bg}`}
              >
                <div className="p-1 rounded-full bg-white/60">
                  <Icon size={16} />
                </div>

                <div className="text-xs font-bold">{status.text}</div>
              </div>
            );
          })()}

        {booking.valetRequested &&
          booking.valetId &&
          booking.valetStatus === "ASSIGNED" && (
            <div className="flex items-center justify-between gap-3 p-3 border rounded-sm mb-6 bg-white">
              {/* Valet Name */}
              <div className="text-sm font-bold">
                Valet: {booking.valet?.fullname}
              </div>

              {/* Call Button */}
              <a href={`tel:${booking.valet?.phone}`}>
                <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md text-xs font-bold hover:bg-gray-800 transition">
                  <Phone size={14} />
                  Call valet
                </button>
              </a>
            </div>
          )}

        <div className="space-y-2 border-t border-black/5 pt-4 mb-6">
          <p className="text-xs font-bold text-gray-400">Payment summary :</p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <div className="flex-1 border-b border-dotted border-gray-300 mx-2 mb-1"></div>
            <span className="font-bold">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 italic text-[11px]">
              Parking time {durationHours.toFixed(1)} hour
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Valet Charge</span>
            <div className="flex-1 border-b border-dotted border-gray-300 mx-2 mb-1"></div>
            <span className="font-bold">₹{valetCharge}</span>
          </div>
          <div className="flex justify-between items-center pt-2 text-lg font-bold border-t border-black mt-2">
            <span>Total</span>
            <div className="flex-1 border-b border-dotted border-gray-300 mx-2 mb-1"></div>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-3">
          {/* M2 FIX: Show pickupPin for valet bookings before it's been used */}
          {booking.valetRequested &&
            booking.pickupPin &&
            !booking.pickupPinUsed && (
              <div className="w-full flex items-center justify-center gap-2 py-3 border border-black rounded-sm text-sm font-bold bg-yellow-50">
                PICKUP PIN:{" "}
                <span className="text-yellow-800 tracking-widest text-lg">
                  {booking.pickupPin}
                </span>
              </div>
            )}

          {!booking.valetRequested && (
            <button className="w-full flex items-center justify-center gap-2 py-3 border border-black rounded-sm text-sm font-bold hover:bg-gray-50 transition-colors">
              {booking.status === "confirmed" ? "ENTRY PIN :" : "EXIT PIN :"}{" "}
              {booking.status === "confirmed" ? (
                <span className="text-green-800">{booking.entryPin}</span>
              ) : (
                <span className="text-green-800">{booking.exitPin}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryBookingCard({
  booking,
  onClick,
}: {
  booking: BookingWithGarage;
  onClick: () => void;
}) {
  const isCancelled = booking.status === "cancelled";

  return (
    <div
      onClick={onClick}
      className="relative bg-white border border-black rounded-sm p-6 cursor-pointer hover:bg-gray-50"
    >
      {/* Status Badge */}
      <div
        className={`absolute top-3 right-3 px-3 py-1 text-[10px] font-bold uppercase border rounded-sm
        ${
          isCancelled
            ? "bg-red-100 text-red-800 border-red-300"
            : "bg-green-100 text-green-800 border-green-300"
        }`}
      >
        {booking.status}
      </div>

      <h2 className="text-xl font-bold">{booking.garage?.name}</h2>

      <p className="text-xs text-gray-600 mt-2 mb-1 ">
        {new Date(booking.startTime).toLocaleDateString("en-IN")}
      </p>

      <p className="text-sm text-gray-500">{booking.garage?.locationName}</p>

      <div className="flex justify-between mt-4">
        <span>{booking.vehicleType}</span>
        <span className="font-bold">₹{booking.amount}</span>
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

  async function handleSubmitReview() {
    try {
      await submitGarageReview({
        bookingId: booking.id,
        rating,
        comment,
      });

      alert("Review submitted");
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data as ApiError;
        alert(apiError?.message || "Failed");
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-5">
        <div className="flex justify-between mb-4">
          <h2 className="font-bold text-lg">Review</h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
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
          placeholder="Write review"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded p-2 mb-4"
        />

        <button
          onClick={handleSubmitReview}
          className="w-full bg-primary text-white py-2 rounded"
        >
          Submit Review
        </button>
      </div>
    </div>
  );
}
