"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import apiClient from "@/lib/apiClient";
import GarageDetails from "@/components/garage/GarageDetails";

interface Garage {
  id: string;
  name: string;
  locationName: string;
  latitude: number;
  longitude: number;
  distance?: number;
  standardSlotPrice?: number;
  largeSlotPrice?: number;
  rating?: number;
  contactPhone?: string;
  hasOffer?: boolean;
  offerText?: string;
  valetAvailable?: boolean;
  valetServiceRadius: number;
}

export default function GaragePage() {
  const params = useParams();

  // console.log("params",params)

  const garageId = Array.isArray(params?.garageId)
    ? params.garageId[0]
    : params?.garageId;

  // console.log("dynamic garage",garageId);

  const [garage, setGarage] = useState<Garage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!garageId) return;

    const fetchGarage = async () => {
      try {
        const res = await apiClient.get(`/api/public/user/garages/${garageId}`);
        setGarage(res.data.data);
        console.log("garage/id", res.data.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGarage();
  }, [garageId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-secondary rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-primary rounded-full animate-pulse" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-900 tracking-widest uppercase animate-pulse">
            Loading Garage...
          </p>
        </div>
      </div>
    );
  }
  if (!garage) return <div>Garage not found</div>;

  return <GarageDetails garage={garage} />;
}
