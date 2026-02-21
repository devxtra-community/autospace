"use client";

import { useEffect, useState, useCallback } from "react";
import ManagerBookingsTable from "@/components/garage/ManagerBookingsTable";
import apiClient from "@/lib/apiClient";
import { Booking } from "@/services/booking.service";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const limit = 8;

  const fetchBookings = useCallback(
    async (isPolling = false) => {
      try {
        if (!isPolling) setLoading(true);

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
        });

        if (searchTerm) params.append("search", searchTerm);
        // Backend controller uses "status" query param for status filtering
        // and "search" for ID/PIN. Date filter on UI could be mapped to search if it matches format,
        // but let's stick to searchTerm for now as per controller logic.
        if (dateFilter) params.append("search", dateFilter);

        const res = await apiClient.get(
          `/api/bookings/manager/bookings?${params.toString()}`,
        );

        setBookings(res.data.data ?? []);
        setTotalPages(res.data.pagination?.pages ?? 1);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        if (!isPolling) setBookings([]);
      } finally {
        if (!isPolling) setLoading(false);
      }
    },
    [currentPage, searchTerm, dateFilter],
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchBookings(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchBookings]);

  const handleRowClick = (booking: Booking) => {
    console.log("Clicked booking:", booking);
  };

  return (
    <div className="min-h-screen">
      <ManagerBookingsTable
        bookings={bookings}
        loading={loading}
        onRowClick={handleRowClick}
        refreshBookings={() => fetchBookings()}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        dateFilter={dateFilter}
        onDateChange={(val) => {
          setDateFilter(val);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
