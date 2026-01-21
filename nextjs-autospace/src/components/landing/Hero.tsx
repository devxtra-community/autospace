import Image from "next/image";
import { MapPin, Search } from "lucide-react";

export default function Hero() {
  return (
    <section className="flex flex-col items-center pt-16 pb-24 px-4 max-w-7xl mx-auto text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
        No More Parking Hassles. Just Park
      </h1>
      <p className="text-[#917C0E] text-2xl font-serif italic mb-12">
        Book the Best Spaces
      </p>

      {/* Search Bar */}
      <div className="relative w-full max-w-2xl mb-24">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <MapPin className="text-red-500 w-6 h-6" />
        </div>
        <input
          type="text"
          placeholder="search address , place ......"
          className="w-full py-4 pl-12 pr-12 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F4DA71] text-gray-600"
        />
        <div className="absolute inset-y-0 right-4 flex items-center border-l pl-3 border-gray-300">
          <Search className="text-gray-400 w-6 h-6" />
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 items-center gap-8 mt-8">
        <div className="text-left md:pl-12">
          <h2 className="text-3xl font-serif text-[#917C0E] mb-2">
            Hand Over{" "}
            <span className="text-black font-sans font-normal">Your Car.</span>
          </h2>
          <p className="text-gray-800 text-lg mb-6">We Handle Rest</p>
          <button className="px-8 py-3 bg-[#F4DA71] border border-black rounded-xl font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
            Book your
            <br />
            <span className="text-sm font-normal">Valet Parking</span>
          </button>
        </div>

        <div className="relative h-64 md:h-80 w-full">
          {/* Placeholder for Car Image */}
          <div className="w-full h-full relative">
            <Image
              src="https://placehold.co/800x400/1a1a1a/FFF?text=Sports+Car"
              alt="Sports Car"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
