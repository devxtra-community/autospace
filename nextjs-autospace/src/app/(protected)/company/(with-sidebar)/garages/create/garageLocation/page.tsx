"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import maplibregl, { Map, Marker } from "maplibre-gl";
import { MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UseFormSetValue } from "react-hook-form";
import { GarageFormValues } from "../page";

interface GarageLocationProps {
  formData: {
    name: string;
    description: string;
    locationName: string;
    latitude?: number;
    longitude?: number;
  };
  currentStep: number;
  onBack: () => void;
  setValue: UseFormSetValue<GarageFormValues>;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export default function GarageLocation({
  formData,
  currentStep,
  onBack,
  setValue,
  onSubmit,
  isSubmitting = false,
}: GarageLocationProps) {
  if (typeof window === "undefined") {
    return null;
  }
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);

  const hasSelectedLocation =
    formData.latitude != null && formData.longitude != null;

  useEffect(() => {
    if (typeof window === "undefined") return; // ← server guard
    if (currentStep !== 2 || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current!,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: [76.2673, 9.9312],
      zoom: 12,
    });

    map.on("click", (e) => {
      if (locationConfirmed) return;
      const { lng, lat } = e.lngLat;

      setValue("latitude", lat);
      setValue("longitude", lng);
      setLocationConfirmed(false);

      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new maplibregl.Marker()
          .setLngLat([lng, lat])
          .addTo(map);
      }

      map.flyTo({ center: [lng, lat], zoom: 16 });
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [currentStep, setValue]);

  if (currentStep === 2) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">
            Set Garage Location
          </h1>
          <p className="text-gray-600">
            Click on the map to pin your garage location.
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-black">
            <MapPin className="w-4 h-4 text-yellow-500" />
            Garage Location
          </label>

          <div
            ref={mapContainerRef}
            className="w-full h-96 rounded-xl border border-gray-300"
          />
        </div>

        {formData.latitude && formData.longitude && (
          <p className="text-sm text-gray-600">
            Selected: {formData.latitude.toFixed(5)},{" "}
            {formData.longitude.toFixed(5)}
          </p>
        )}

        {locationConfirmed && (
          <p className="text-sm text-green-600 font-medium">
            Location confirmed. You can go back to change it.
          </p>
        )}

        <div className="flex gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Back
          </Button>

          {locationConfirmed ? (
            <Button
              type="button"
              className="flex-1 h-11 bg-black text-yellow-400"
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              Create Garage
            </Button>
          ) : (
            <Button
              type="button"
              className="flex-1 h-11 bg-black text-yellow-400"
              disabled={!hasSelectedLocation}
              onClick={() => setLocationConfirmed(true)}
            >
              Confirm Location
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 3) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center py-12">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-black mb-2">
            Garage Created Successfully
          </h1>
          <p className="text-gray-600">
            Your garage <strong>{formData.name}</strong> has been created.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
