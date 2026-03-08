"use client";
// export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo } from "react";
import { MapPin, Star, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

import { useSearchParams } from "next/navigation";
import apiClient from "@/lib/apiClient";
// import dynamic from "next/dynamic";
import SearchMap from "@/components/map/SearchMap";
// import GarageDetails from "@/components/garage/GarageDetails";

interface PublicGarage {
  id: string;
  name: string;
  locationName: string;
  latitude: number;
  longitude: number;
  distance?: number;
  standard_slot_price?: number;
  large_slot_price?: number;
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
  const [priceFilter, setPriceFilter] = useState("");
  const [distanceFilter, setDistanceFilter] = useState("");

  const filteredGarages = useMemo(() => {
    let result = [...garages];

    if (distanceFilter === "under_2")
      result = result.filter((g) => (g.distance ?? 0) < 2);
    else if (distanceFilter === "under_5")
      result = result.filter((g) => (g.distance ?? 0) < 5);
    else if (distanceFilter === "under_10")
      result = result.filter((g) => (g.distance ?? 0) < 10);

    if (priceFilter === "under_50")
      result = result.filter((g) => (g.standard_slot_price ?? 0) < 50);
    else if (priceFilter === "under_100")
      result = result.filter((g) => (g.standard_slot_price ?? 0) < 100);
    else if (priceFilter === "under_200")
      result = result.filter((g) => (g.standard_slot_price ?? 0) < 200);

    if (distanceFilter === "nearest")
      result.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    else if (distanceFilter === "farthest")
      result.sort((a, b) => (b.distance ?? 0) - (a.distance ?? 0));

    if (priceFilter === "low_to_high")
      result.sort(
        (a, b) => (a.standard_slot_price ?? 0) - (b.standard_slot_price ?? 0),
      );
    else if (priceFilter === "high_to_low")
      result.sort(
        (a, b) => (b.standard_slot_price ?? 0) - (a.standard_slot_price ?? 0),
      );

    return result;
  }, [garages, priceFilter, distanceFilter]);
  // const [valetFilter, setValetFilter] = useState<boolean | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!lat || !lng) return;

      const url = `/api/public/user/garages?lat=${lat}&lng=${lng}`;

      // if (valetFilter === true) {
      //   url += `&valetAvailable=true`;
      // }

      // if (valetFilter === false) {
      //   url += `&valetAvailable=false`;
      // }

      // console.log("THe url",url);

      const res = await apiClient.get(url);
      setGarages(res.data.data);
      // console.log("garages", res.data);
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
              className="w-full py-3.5 pl-12 pr-4 border border-[#FADEDE] bg-[#FFF5F5]/30 shadow-none focus:outline-none focus:ring-1 focus:ring-pink-200 text-gray-400 font-normal text-sm"
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
                className="p-1 hover:bg-gray-50 transition-colors"
              >
                {isFilterOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>

            {isFilterOpen && (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <select
                    className="appearance-none w-full px-3 py-1.5 rounded-sm border border-black text-xs font-medium text-gray-800 bg-white focus:outline-none"
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                  >
                    <option value="">Price (All)</option>
                    <option value="under_50">Under ₹50</option>
                    <option value="under_100">Under ₹100</option>
                    <option value="under_200">Under ₹200</option>
                    <option value="low_to_high">Price: Low to High</option>
                    <option value="high_to_low">Price: High to Low</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-800" />
                </div>

                <div className="relative">
                  <select
                    className="appearance-none w-full px-3 py-1.5 rounded-sm border border-black text-xs font-medium text-gray-800 bg-white focus:outline-none"
                    value={distanceFilter}
                    onChange={(e) => setDistanceFilter(e.target.value)}
                  >
                    <option value="">Distance (All)</option>
                    <option value="under_2">Under 2 km</option>
                    <option value="under_5">Under 5 km</option>
                    <option value="under_10">Under 10 km</option>
                    <option value="nearest">Nearest First</option>
                    <option value="farthest">Farthest First</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-800" />
                </div>
              </div>
            )}
          </div>

          {/* Stats and Sort */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-bold text-gray-900">
              Spot found: {filteredGarages.length}
            </span>
            {/* <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                Sort by:
              </span>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-black text-xs font-medium bg-white text-forground">
                Recommended <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div> */}
          </div>
        </div>

        <div className="flex flex-col   overflow-y-auto px-6 pb-6 space-y-4 no-scrollbar">
          {loading && (
            <div className="text-sm text-gray-500 py-6 text-center">
              Searching nearby garages…
            </div>
          )}

          {filteredGarages.map((garage) => (
            <Link key={garage.id} href={`/garages/${garage.id}`}>
              <div className=" p-4 flex flex-col gap-3 rounded-lg relative bg-blue-50 cursor-pointer  transition-colors shadow-md active:translate-y-0.5">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-gray-900 uppercase">
                      {garage.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-[#F4DA71]/10 px-2 py-0.5 w-fit border border-[#F4DA71]/30">
                      <span className="text-xs font-bold">{garage.rating}</span>
                      <Star className="w-3 h-3 fill-black text-black" />
                    </div>
                  </div>
                  <div className="bg-gray-200/50 px-2 py-1 text-[10px] font-bold text-gray-800 min-w-[60px] text-center border border-gray-300/30">
                    <span className="text-[10px] font-bold text-gray-800">
                      {garage.distance != null
                        ? `${garage.distance.toFixed(2)} km`
                        : "— km"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-900">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">
                    {garage.locationName}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="text-sm font-bold text-gray-900 flex flex-col">
                    <p>₹ {garage.standard_slot_price} / Hour - standard </p>
                    <p>₹ {garage.large_slot_price} / Hour - Large</p>
                  </div>

                  {garage.status === "active" ? (
                    // <Link href={`/garage/${garage.id}`}>
                    <button className="px-4 py-1.5 bg-gray-800 rounded-sm text-white text-xs font-bold border border-black/10 shadow-sm hover:brightness-95 transition-all outline-none">
                      Book now
                    </button>
                  ) : (
                    // {/* </Link> */}
                    <button
                      disabled
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-1.5 bg-[#F9A8A8] text-gray-900 text-xs font-bold border border-black/10 shadow-sm cursor-not-allowed outline-none"
                    >
                      Rented Out
                    </button>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="hidden md:flex flex-1 relative overflow-hidden">
        {!loading && lat && lng && (
          <SearchMap
            garages={filteredGarages}
            userLat={Number(lat)}
            userLng={Number(lng)}
          />
        )}
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
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export function MapMarker({
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
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 shadow-lg text-[10px] font-bold whitespace-nowrap border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
          ₹ 999 / Hour
        </div>
      )}
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 bg-red-600 flex items-center justify-center p-2 border-[3px] border-white shadow-xl group-hover:scale-110 transition-transform">
          <div className="w-3.5 h-3.5 bg-white"></div>
        </div>
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-red-600 -mt-1 shadow-sm"></div>
      </div>
    </div>
  );
}
