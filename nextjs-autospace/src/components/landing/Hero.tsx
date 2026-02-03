"use client";

import Image from "next/image";
import { MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { PhotonFeature, searchPhoton } from "@/services/photon.service";
import { useRouter } from "next/navigation";

export default function Hero() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PhotonFeature[]>([]);
  const [loading, setLoading] = useState(false);

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
      `/garageDetail?lat=${lat}&lng=${lng}&q=${encodeURIComponent(query)}`,
    );
  };

  return (
    <section className="flex flex-col font-zalando items-center pt-[250px] pb-24 text-center ">
      <div className="max-w-7xl mx-auto px-4 w-full flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-medium text-black mb-4">
          No More Parking Hassles. Just Park
        </h1>
        <p className="text-[#917C0E] text-4xl font-serif mb-12">
          Book the Best Spaces
        </p>

        <div className="relative w-full max-w-2xl mb-16">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <MapPin className="text-red-500 w-6 h-6" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="search address , place ......"
            className="w-full py-4 pl-12 pr-12 rounded-full border border-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F4DA71] text-gray-600"
          />
          <div className="absolute inset-y-0 right-4 flex items-center border-l pl-3 border-gray-700">
            <Search
              onClick={handleSearch}
              className="text-gray-700 w-6 h-6 cursor-pointer hover:text-black transition-colors"
            />
          </div>
          {results.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border overflow-hidden z-50">
              {loading && (
                <div className="px-4 py-3 text-sm text-gray-500">
                  Searching locations…
                </div>
              )}

              {results.map((item, idx) => {
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
                        `/garageDetail?lat=${lat}&lng=${lng}&q=${encodeURIComponent(label)}`,
                      );
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-800">{label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="w-full mt-16 md:mt-24">
        <div className="relative w-full h-[350px] md:h-[550px] lg:h-[650px]">
          <div className="absolute inset-0 z-20 pointer-events-none">
            <div className="max-w-7xl mx-auto px-4 h-full relative">
              <div className="absolute left-4 top-0 md:top-10 flex flex-col items-start pointer-events-auto">
                <div className="text-left mb-3 md:mb-5">
                  <h2 className="text-2xl md:text-4xl font-bold text-black leading-tight">
                    <span className="text-[#917C0E]">Hand Over</span> Your Car.
                  </h2>
                  <p className="text-lg md:text-xl text-black mt-1">
                    We Handle Rest
                  </p>
                </div>

                {/* Button */}
                <button className="px-5 py-2 md:px-6 md:py-3 bg-[#F4DA71] border-2 border-black rounded-xl font-bold text-black text-base md:text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
                  Book your
                  <br />
                  Valet Parking
                </button>
              </div>
            </div>
          </div>

          {/* Car Image - Expanded */}
          <div className="relative w-full h-full flex justify-center items-end pb-10">
            <div className="w-full h-[80%] md:h-[90%] scale-110 md:scale-120 lg:scale-125">
              <Image
                src="/Desktop Car.png"
                alt="Luxury Sports Car"
                fill
                className="object-contain  scale-140 select-none"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
