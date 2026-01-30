"use client";

import React, { useState } from "react";
import { Search, MapPin, Star, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

const garages = [
  {
    id: 1,
    name: "Garage name",
    rating: 4,
    location: "Garage Location",
    distance: "1.72 km",
    price: 999,
    status: "available",
  },
  {
    id: 2,
    name: "Garage name",
    rating: 4,
    location: "Garage Location",
    distance: "2.5 km",
    price: 999,
    status: "rented-out",
  },
  {
    id: 3,
    name: "Garage name",
    rating: 4,
    location: "Garage Location",
    distance: "1.72 km",
    price: 999,
    status: "available",
  },
  {
    id: 4,
    name: "Garage name",
    rating: 4,
    location: "Garage Location",
    distance: "2.5 km",
    price: 999,
    status: "rented-out",
  },
  {
    id: 5,
    name: "Garage name",
    rating: 4,
    location: "Garage Location",
    distance: "2.5 km",
    price: 999,
    status: "rented-out",
  },
];

export default function SearchPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col md:flex-row bg-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-[450px] flex flex-col border-r border-gray-200 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <MapPin className="text-red-500 w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="search address , place ......"
              className="w-full py-4 pl-12 pr-4 rounded-lg border border-pink-100 bg-pink-50/10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F4DA71] text-gray-400 font-medium"
            />
          </div>

          {/* Filters Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Filters</h2>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isFilterOpen ? (
                <ChevronUp className="w-6 h-6 text-gray-600" />
              ) : (
                <ChevronDown className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>

          {isFilterOpen && (
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-between px-4 py-2 border border-gray-800 rounded-md font-medium text-gray-800">
                Price <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex-1 flex items-center justify-between px-4 py-2 border border-gray-800 rounded-md font-medium text-gray-800">
                Availability <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex-1 flex items-center justify-between px-4 py-2 border border-gray-800 rounded-md font-medium text-gray-800">
                Distance <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Stats and Sort */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-bold text-gray-800">
              Spot found: 05
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <button className="flex items-center gap-2 px-3 py-1 border border-gray-800 rounded-md text-sm font-medium">
                Recommended <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Garage List */}
          <div className="space-y-4">
            {garages.map((garage) => (
              <div
                key={garage.id}
                className="border border-gray-800 rounded-lg p-5 flex flex-col gap-3 hover:shadow-md transition-shadow relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      # {garage.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-[#F4DA71]/20 px-2 py-0.5 rounded w-fit mt-1">
                      <span className="text-sm font-bold">{garage.rating}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                  <div className="bg-gray-100 px-3 py-1 rounded text-sm font-bold text-gray-700">
                    {garage.distance}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">{garage.location}</span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="text-lg font-bold text-gray-900">
                    $ {garage.price} / Hour
                  </div>

                  {garage.status === "available" ? (
                    <button className="px-6 py-2 bg-[#A8FFD8] text-gray-900 font-bold rounded-lg hover:brightness-95 transition-all">
                      Book now
                    </button>
                  ) : (
                    <button className="px-6 py-2 bg-[#FFB3B3] text-gray-900 font-bold rounded-lg cursor-not-allowed">
                      Rented Out
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="flex-1 relative bg-gray-100">
        {/* Placeholder for Map - using an image or a styled div */}
        <div className="absolute inset-0 bg-[#E5E7EB] overflow-hidden">
          {/* Mock Map background with SVG or just colors */}
          <div className="w-full h-full opacity-50 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.714728,-73.998672&zoom=12&size=1000x1000&sensor=false')] bg-cover bg-center"></div>

          {/* Custom Pin Markers */}
          <div className="absolute top-[20%] left-[30%] -translate-x-1/2 -translate-y-1/2 drop-shadow-lg">
            <div className="relative group">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded shadow-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                $ 999 / Hour
              </div>
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center p-2 border-2 border-white">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-red-600 mx-auto -mt-1"></div>
            </div>
          </div>

          <div className="absolute top-[50%] left-[60%] -translate-x-1/2 -translate-y-1/2 drop-shadow-lg">
            <div className="relative group">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded shadow-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                $ 999 / Hour
              </div>
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center p-2 border-2 border-white">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-red-600 mx-auto -mt-1"></div>
            </div>
          </div>

          <div className="absolute top-[80%] left-[40%] -translate-x-1/2 -translate-y-1/2 drop-shadow-lg">
            <div className="relative group">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded shadow-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                $ 999 / Hour
              </div>
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center p-2 border-2 border-white">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-red-600 mx-auto -mt-1"></div>
            </div>
          </div>

          <div className="absolute top-[40%] left-[20%] -translate-x-1/2 -translate-y-1/2 drop-shadow-lg">
            <div className="relative group">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center p-2 border-2 border-white">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-red-600 mx-auto -mt-1"></div>
            </div>
          </div>
        </div>

        {/* Home Button / Back Link */}
        <Link
          href="/"
          className="absolute top-6 left-6 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-gray-200 hover:bg-white transition-all group"
        >
          <Search className="w-6 h-6 text-gray-800 group-hover:scale-110 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
