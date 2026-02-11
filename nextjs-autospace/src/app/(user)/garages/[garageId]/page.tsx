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

  if (loading) return <div>Loading...</div>;
  if (!garage) return <div>Garage not found</div>;

  return <GarageDetails garage={garage} />;
}
