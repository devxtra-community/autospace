"use client";

import { MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { PhotonFeature, searchPhoton } from "@/services/photon.service";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

export default function Hero() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PhotonFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await searchPhoton(query);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const router = useRouter();

  const handleSearch = () => {
    if (!results[0]) return;

    const [lng, lat] = results[0].geometry.coordinates;

    router.push(
      `/searchDetail?lat=${lat}&lng=${lng}&q=${encodeURIComponent(query)}`,
    );
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        router.push(`/searchDetail?lat=${lat}&lng=${lng}&q=current-location`);
      },
      (error) => {
        console.error(error);
        toast.error("Unable to retrieve your location");
      },
    );
  };

  return (
    <section className="relative z-30 w-full min-h-[90vh] flex flex-col items-center justify-center px-4 md:px-16 lg:px-24 font-zalando overflow-visible bg-white/70">
      {/* Background Image (subdued with overlay for text readability) */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Image
          src="/hero_bg_white.png"
          alt="Parking"
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover"
        />
        {/* Soft radial gradient mask to match reference image style */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center mt-20 text-center space-y-8">
        {/* Hero Typography */}
        <h1 className="text-5xl md:text-7xl font-medium text-gray-900 leading-tight tracking-tight">
          No More Parking Hassles.
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400">
            Just Park
          </span>
        </h1>

        {/* Replace above with actual content but styled like reference: */}
        {/* <h1 className="text-5xl md:text-7xl font-medium text-gray-900 leading-tight tracking-tight mt-0">
          No More Parking Hassles.<br />
          Book the <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500">Best Spaces</span>
        </h1> */}

        <p className="text-gray-080 text-sm md:text-base max-w-2xl mx-auto font-sans pt-2">
          Autospace brings your parking, your bookings, and your valet
          management together in one place so you can manage your operations
          better.
        </p>

        {/* Centered Search Bar */}
        <div
          className={`relative w-full transition-all duration-500 ease-in-out ${isSearchFocused ? "max-w-2xl" : "max-w-md"} mt-8 shadow-2xl rounded-full group`}
        >
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="text-gray-400 w-5 h-5 group-focus-within:text-black transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => {
              // Delay blur to allow clicks on dropdown items or the search button
              setTimeout(() => setIsSearchFocused(false), 200);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="search address , place ......"
            className="w-full py-4 pl-14 pr-48 rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:border-gray-200 text-gray-900 placeholder-gray-400 text-base font-sans transition-all"
          />
          <button
            onClick={handleCurrentLocation}
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 bg-black hover:bg-gray-800 text-white rounded-full transition-all duration-500 ease-in-out flex items-center justify-center h-11 overflow-hidden ${isSearchFocused ? "w-48 px-4" : "w-11 px-0 aspect-square"}`}
          >
            <div
              className={`flex items-center gap-2 whitespace-nowrap justify-center w-full transition-all duration-500`}
            >
              <MapPin className="w-5 h-5 flex-shrink-0" />
              <span
                className={`text-sm font-medium transition-opacity duration-300 ease-in-out h-5 flex items-center ${isSearchFocused ? "opacity-100" : "opacity-0 w-0 hidden"}`}
              >
                Current Locaton
              </span>
            </div>
          </button>

          {/* Autocomplete Dropdown */}
          {results.length > 0 && (
            <div className="absolute top-full mt-3 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 text-left">
              {loading && (
                <div className="px-5 py-4 text-sm text-gray-500 animate-pulse">
                  Searching locations…
                </div>
              )}

              {results.slice(0, 5).map((item, idx) => {
                const [lng, lat] = item.geometry.coordinates;
                const label = [
                  item.properties.name,
                  item.properties.city,
                  item.properties.state,
                  item.properties.country,
                ]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      router.push(
                        `/searchDetail?lat=${lat}&lng=${lng}&q=${encodeURIComponent(label)}`,
                      );
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="bg-gray-100 p-2 rounded-full">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
