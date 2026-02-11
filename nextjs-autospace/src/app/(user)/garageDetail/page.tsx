"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { MapPin, Star, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { useSearchParams } from "next/navigation";
import apiClient from "@/lib/apiClient";

interface PublicGarage {
  id: string;
  name: string;
  locationName: string;
  latitude: number;
  longitude: number;
  distance?: number;
  pricePerHour?: number;
  rating?: number;
  status?: "active" | "closed";
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const q = searchParams.get("q");

  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [garages, setGarages] = useState<PublicGarage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!lat || !lng) return;
      const res = await apiClient.get(
        `/api/public/user/garages?lat=${lat}&lng=${lng}`,
      );
      setGarages(res.data.data);
      console.log("garages", res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lat, lng]);

  return (
    <div className="flex flex-col h-screen md:flex-row bg-white overflow-hidden font-sans">
      <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col border-r border-gray-100 overflow-hidden">
        <div className="p-6 space-y-6 flex-shrink-0">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <MapPin className="text-red-500 w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="search address , place ......"
              className="w-full py-3.5 pl-12 pr-4 rounded-md border border-[#FADEDE] bg-[#FFF5F5]/30 shadow-none focus:outline-none focus:ring-1 focus:ring-pink-200 text-gray-400 font-normal text-sm"
              readOnly
              value={q ?? ""}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-gray-800 tracking-wide">
                Filters
              </h2>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="p-1 hover:bg-gray-50 rounded transition-colors"
              >
                {isFilterOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>

            {isFilterOpen && (
              <div className="grid grid-cols-3 gap-3">
                <button className="flex items-center justify-between px-3 py-2 border border-black rounded-sm text-xs font-medium text-gray-800 bg-white">
                  Price <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button className="flex items-center justify-between px-3 py-2 border border-black rounded-sm text-xs font-medium text-gray-800 bg-white">
                  Availability <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button className="flex items-center justify-between px-3 py-2 border border-black rounded-sm text-xs font-medium text-gray-800 bg-white">
                  Distance <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Stats and Sort */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-gray-900">
              Spot found: {garages.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                Sort by:
              </span>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-black rounded-sm text-xs font-medium bg-white">
                Recommended <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Garage List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 custom-scrollbar">
          {loading && (
            <div className="text-sm text-gray-500 py-6 text-center">
              Searching nearby garages…
            </div>
          )}

          {garages.map((garage) => (
            <div
              key={garage.id}
              className="border border-black rounded-sm p-4 flex flex-col gap-3 relative bg-white"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-gray-900 uppercase">
                    # {garage.name}
                  </h3>
                  <div className="flex items-center gap-1 bg-[#F4DA71]/10 px-2 py-0.5 rounded w-fit">
                    <span className="text-xs font-bold">{garage.rating}</span>
                    <Star className="w-3 h-3 fill-black text-black" />
                  </div>
                </div>
                <div className="bg-gray-200/50 px-2 py-1 rounded text-[10px] font-bold text-gray-800 min-w-[60px] text-center">
                  <span className="text-[10px] font-bold text-gray-800">
                    {garage.distance != null
                      ? `${garage.distance.toFixed(2)} km`
                      : "— km"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-900">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">{garage.locationName}</span>
              </div>

              <div className="flex items-center justify-between mt-1">
                <div className="text-sm font-bold text-gray-900">
                  $ {garage.pricePerHour} / Hour
                </div>

                {garage.status === "active" ? (
                  <button className="px-4 py-1.5 bg-[#B7F4D8] text-gray-900 text-xs font-bold rounded-sm border-none shadow-sm hover:brightness-95 transition-all">
                    Book now
                  </button>
                ) : (
                  <button className="px-4 py-1.5 bg-[#F9A8A8] text-gray-900 text-xs font-bold rounded-sm border-none shadow-sm cursor-not-allowed">
                    Rented Out
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Section */}
      <div className="hidden md:flex flex-1 relative bg-[#E5E7EB] overflow-hidden">
        {/* Mock Map Grid */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #000 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-6 left-6 z-20 bg-white p-2.5 rounded shadow-md border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </Link>

        {/* Static Map Visuals (Roads etc) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1000 1000"
        >
          <path
            d="M0 200 Q 300 150 500 400 T 1000 300"
            stroke="#888"
            strokeWidth="4"
            fill="none"
            opacity="0.3"
          />
          <path
            d="M200 0 Q 350 400 300 600 T 500 1000"
            stroke="#888"
            strokeWidth="3"
            fill="none"
            opacity="0.3"
          />
          <path
            d="M1000 100 Q 700 300 800 500 T 600 1000"
            stroke="#888"
            strokeWidth="5"
            fill="none"
            opacity="0.3"
          />
        </svg>

        {/* Custom Pin Markers */}
        <MapMarker top="20%" left="35%" showPrice />
        <MapMarker top="55%" left="75%" showPrice />
        <MapMarker top="85%" left="65%" showPrice />
        <MapMarker top="45%" left="15%" />
        <MapMarker top="15%" left="85%" />

        {/* Small Detail: Gray path from image */}
        <div className="absolute top-[40%] right-[10%] w-24 h-24 border-2 border-gray-400/20 rounded-full" />
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}

function MapMarker({
  top,
  left,
  showPrice = false,
}: {
  top: string;
  left: string;
  showPrice?: boolean;
}) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
      style={{ top, left }}
    >
      {showPrice && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded shadow-lg text-[10px] font-bold whitespace-nowrap border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
          $ 999 / Hour
        </div>
      )}
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center p-2 border-[3px] border-white shadow-xl group-hover:scale-110 transition-transform">
          <div className="w-3.5 h-3.5 bg-white rounded-sm"></div>
        </div>
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-red-600 -mt-1 shadow-sm"></div>
      </div>
    </div>
  );
}
