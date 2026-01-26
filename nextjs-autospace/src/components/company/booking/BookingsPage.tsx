"use client";

import { BookingsHeader } from "./BookingsHeader";
import { BookingFilters } from "./BookingFilters";
import { BookingsTable } from "./BookingsTable";
import { Pagination } from "./Pagination";

export function BookingsPage() {
  return (
    <div className="space-y-6">
      <BookingsHeader />
      <BookingFilters />
      <BookingsTable />
      <Pagination />
    </div>
  );
}
