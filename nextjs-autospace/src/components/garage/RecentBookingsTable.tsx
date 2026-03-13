"use client";

import { Star, MoreHorizontal } from "lucide-react";
import { Booking } from "@/services/booking.service";

interface EnrichedBooking extends Booking {
  customerName?: string;
  customerEmail?: string;
  rating?: number;
}

export function RecentBookingsTable({
  bookings,
}: {
  bookings: EnrichedBooking[];
}) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
            <th className="py-4 px-2 font-semibold w-12 text-center">#</th>
            <th className="py-4 px-4 font-semibold">Customer</th>
            <th className="py-4 px-4 font-semibold">Email</th>
            <th className="py-4 px-4 font-semibold">Slot</th>
            <th className="py-4 px-4 font-semibold">Revenue</th>
            <th className="py-4 px-4 font-semibold">Rating</th>
            <th className="py-4 px-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {bookings.map((booking, index) => (
            <tr
              key={booking.id}
              className="group hover:bg-gray-50/50 transition-colors"
            >
              <td className="py-4 px-2 text-sm text-gray-400 font-medium text-center">
                {index + 1}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase shrink-0">
                    {booking.customerName?.slice(0, 2) || "U"}
                  </div>
                  <span className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                    {booking.customerName || "User"}
                  </span>
                </div>
              </td>
              <td className="py-4 px-4 text-sm text-gray-500 truncate max-w-[200px]">
                {booking.customerEmail || "N/A"}
              </td>
              <td className="py-4 px-4 text-sm text-gray-600 font-medium">
                {booking.slotNumber || "N/A"}
              </td>
              <td className="py-4 px-4">
                <span className="text-sm font-bold text-green-600">
                  ₹{booking.amount}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    ({booking.rating || "N/A"})
                  </span>
                </div>
              </td>
              <td className="py-4 px-2 text-right">
                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-white shadow-sm border border-transparent hover:border-gray-100 opacity-0 group-hover:opacity-100 transition-all">
                  <MoreHorizontal size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {bookings.length === 0 && (
        <div className="py-12 text-center text-gray-400 text-sm italic">
          No recent bookings found.
        </div>
      )}
    </div>
  );
}
