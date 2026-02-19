"use client";
import Navbar from "@/components/landing/Navbar";

import { useEffect, useState } from "react";
import { getMyBookings, Booking } from "@/services/booking.service";
import { getGarageById } from "@/services/garage.service";
import {
  // CalendarDays,
  // MapPin,
  Phone,
  Navigation,
  Clock,
  Edit2,
  // QrCode,
  Star,
  RotateCcw,
  Loader2,
  CheckCircle2,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";

type BookingWithGarage = Booking & {
  garage?: {
    name: string;
    locationName: string;
    contactPhone?: string;
    standardSlotPrice?: number;
    largeSlotPrice?: number;
  };
};

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [bookings, setBookings] = useState<BookingWithGarage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMyBookings();
        // For each booking, we ideally want garage details.
        // For now, let's just fetch the bookings and we'll handle garage details.
        // In a real app, the backend should return this joined.
        const bookingsWithDetails = await Promise.all(
          data.map(async (b) => {
            try {
              const garage = await getGarageById(b.garageId);
              return { ...b, garage };
            } catch {
              return b;
            }
          }),
        );
        console.log("booking details", bookingsWithDetails);

        setBookings(bookingsWithDetails);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeBookings = bookings.filter(
    (b) =>
      b.status === "confirmed" ||
      b.status === "pending" ||
      b.status === "active",
  );
  const historyBookings = bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled",
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[var(--primary)]" size={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-32 pb-12 px-4 md:px-8">
      <Navbar />
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

        {/* Tabs */}
        <div className="flex  mb-8 bg-[#F5F1E6] rounded-sm p-1">
          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "flex-1 py-3 text-sm font-bold transition-all rounded-sm",
              activeTab === "active"
                ? "bg-white text-black border border-black"
                : "text-gray-500 hover:text-black",
            )}
          >
            Active Bookings
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex-1 py-3 text-sm font-bold transition-all rounded-sm",
              activeTab === "history"
                ? "bg-white text-black border border-black"
                : "text-gray-500 hover:text-black",
            )}
          >
            Booking History
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "active" ? (
            activeBookings.length > 0 ? (
              activeBookings.map((booking) => (
                <ActiveBookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 border border-dashed border-black/20 rounded-sm">
                <p className="text-gray-500">No active bookings found.</p>
              </div>
            )
          ) : historyBookings.length > 0 ? (
            historyBookings.map((booking) => (
              <HistoryBookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 border border-dashed border-black/20 rounded-sm">
              <p className="text-gray-500">No booking history found.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function ActiveBookingCard({ booking }: { booking: BookingWithGarage }) {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);

  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

  const pricePerHour =
    booking.vehicleType === "suv"
      ? (booking.garage?.largeSlotPrice ?? 15)
      : (booking.garage?.standardSlotPrice ?? 10);

  const subtotal = durationHours * pricePerHour;
  const valetCharge = booking.valetRequested ? 5 : 0;
  const total = subtotal + valetCharge;

  return (
    <div className="bg-white border border-black rounded-sm overflow-hidden flex flex-col md:flex-row">
      {/* Left Portion */}
      <div className="p-6 md:w-1/2 border-r border-black/10">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">
            {booking.garage?.name || "Garage Name"}
          </h2>
          <div className="bg-[#F4DA71] px-2 py-1 border border-black text-xs font-bold flex items-center gap-1">
            4 <Star size={10} fill="currentColor" />
          </div>
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

        <button className="flex items-center gap-2 px-4 py-2 bg-[#F4DA71] border border-black rounded-sm text-sm font-bold hover:bg-[#eac855] transition-colors active:translate-y-[1px]">
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
            sedan
          </span>
        </div>

        {booking.valetRequested && (
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-sm mb-6">
            <div className="bg-green-100 p-1 rounded-full text-green-600">
              {booking.valetStatus === "ASSIGNED" ? (
                <CheckCircle2 size={16} />
              ) : (
                <Clock size={16} />
              )}
            </div>
            <div className="text-xs">
              <p className="font-bold text-green-800">Valet assigned</p>
              <p className="text-green-600 flex items-center gap-1">
                Rajesh kumar | <Star size={10} fill="currentColor" /> 4.8
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2 border-t border-black/5 pt-4 mb-6">
          <p className="text-xs font-bold text-gray-400">Payment summary :</p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <div className="flex-1 border-b border-dotted border-gray-300 mx-2 mb-1"></div>
            <span className="font-bold">${subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 italic text-[11px]">
              Parking time {durationHours} hour
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Valet Charge</span>
            <div className="flex-1 border-b border-dotted border-gray-300 mx-2 mb-1"></div>
            <span className="font-bold">$00.00</span>
          </div>
          <div className="flex justify-between items-center pt-2 text-lg font-bold border-t border-black mt-2">
            <span>Total</span>
            <div className="flex-1 border-b border-dotted border-gray-300 mx-2 mb-1"></div>
            <span>${total}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full flex items-center justify-center gap-2 py-3 border border-black rounded-sm text-sm font-bold hover:bg-gray-50 transition-colors">
            ENTRY PIN :{" "}
            <span className="text-green-800">{booking.entryPin}</span>
          </button>
          <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#C5E4FD] border border-black rounded-sm text-sm font-bold hover:bg-[#b0dcfd] transition-colors">
            Track your Valet <Wifi size={18} className="rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryBookingCard({ booking }: { booking: BookingWithGarage }) {
  const isCancelled = booking.status === "cancelled";

  return (
    <div className="bg-white border border-black rounded-sm p-5 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">
              #{booking.garage?.name || "Garage Name"}
            </h2>
            <span
              className={cn(
                "px-4 py-0.5 rounded-sm text-[10px] font-bold border border-black/10 uppercase tracking-wider",
                isCancelled
                  ? "bg-red-300 text-red-900"
                  : "bg-green-200 text-green-800",
              )}
            >
              {booking.status}
            </span>
            {booking.valetRequested && (
              <span className="px-4 py-0.5 bg-red-50 text-red-800 border border-red-100 text-[10px] font-bold rounded-sm uppercase tracking-wider">
                Valet
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {booking.garage?.locationName ||
              "ABC nagar , kalamassery , kochi , kerala"}
          </p>

          <div className="flex items-center gap-4 text-xs font-bold text-gray-400 pt-1">
            <span>
              {new Date(booking.startTime).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <div className="w-1 h-4 border-l border-black/20"></div>
            <span>2 Hours</span>
            <div className="w-1 h-4 border-l border-black/20"></div>
            <span className="px-4 py-0.5 border border-red-100 bg-red-50 rounded-sm text-[10px]">
              sedan
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs text-gray-400 font-bold">
              Your rating :
            </span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className="text-gray-300" />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <p className="text-2xl font-bold">${isCancelled ? "0" : "40"}</p>
          {!isCancelled && (
            <button className="flex items-center gap-2 px-3 py-1.5 border border-black rounded-sm text-xs font-bold hover:bg-gray-50 transition-colors">
              <RotateCcw size={14} /> try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
