"use client";

import GarageDetails from "@/components/garage/GarageDetails";

const mockGarage = {
  id: "test-garage-1",
  name: "Test Premium Garage",
  locationName: "123 Test Street, New York",
  latitude: 40.7128,
  longitude: -74.006,
  distance: 2.5,
  standardSlotPrice: 15,
  largeSlotPrice: 20,
  rating: 4.9,
  contactPhone: "+1 555 123 4567",
  valetAvailable: true,
};

export default function TestGaragePage() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-5">Garage Details UI Test</h1>
      <GarageDetails garage={mockGarage} />
    </div>
  );
}
