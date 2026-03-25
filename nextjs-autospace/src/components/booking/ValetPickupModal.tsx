"use client";

import { useEffect, useState } from "react";
import { X, MapPin } from "lucide-react";
import ValetMap from "../map/valetMap";

export interface ValetPickupModalProps {
  open: boolean;
  onClose: () => void;
  garageLocation: {
    latitude: number;
    longitude: number;
    name: string;
    valetRadius: number;
  };
  onConfirm: (pickup: {
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
}

export const ValetPickupModal = ({
  open,
  onClose,
  garageLocation,
  onConfirm,
}: ValetPickupModalProps) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedLocation(null);
    }
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => {
    if (!selectedLocation) return;

    onConfirm(selectedLocation);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Select Valet Pickup Location
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Garage serves within {garageLocation.valetRadius} km radius
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MAP SECTION */}
        <div className="h-72 w-full">
          <ValetMap
            garageLocation={garageLocation}
            onLocationSelect={(loc) => {
              setSelectedLocation(loc);
              // onConfirm(loc);
            }}
          />
        </div>

        {/* SELECTED INFO */}
        {selectedLocation && (
          <div className="p-4 border-t border-gray-100 bg-indigo-50 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-800">
              Pickup : {selectedLocation.address}
            </span>
          </div>
        )}

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-100 bg-slate-50">
          <button
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className={`w-full py-3 rounded-md font-bold text-sm transition-all ${
              selectedLocation
                ? "bg-primary text-gray-900 shadow-md hover:bg-primary/90"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Confirm Pickup Location
          </button>
        </div>
      </div>
    </div>
  );
};
