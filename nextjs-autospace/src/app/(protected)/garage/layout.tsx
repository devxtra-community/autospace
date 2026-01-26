"use client";

import { Sidebar } from "@/components/garage/sidebar";

export default function GarageWithSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Content */}
      <div className="flex-1 md:ml-64 p-6">{children}</div>
    </div>
  );
}
