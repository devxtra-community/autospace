"use client";

import { useEffect, useState } from "react";
import ManagerBookingsTable from "@/components/garage/ManagerBookingsTable";
import apiClient from "@/lib/apiClient";
import { Booking } from "@/services/booking.service";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);

        const res = await apiClient.get("/api/bookings/manager/bookings");
        console.log("manger bookings", res.data.data);

        const rawData: Booking[] = res.data.data ?? [];

        setBookings(rawData);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setBookings([]); // no fake data
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleRowClick = (booking: Booking) => {
    console.log("Clicked booking:", booking);
  };

  return (
    <div className="min-h-screen">
      <ManagerBookingsTable
        bookings={bookings}
        loading={loading}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
