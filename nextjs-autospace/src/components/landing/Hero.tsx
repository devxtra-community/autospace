import Image from "next/image";
import { MapPin, Search } from "lucide-react";

export default function Hero() {
  return (
    <section className="flex flex-col items-center pt-8 pb-24 px-4 max-w-7xl mx-auto text-center">
      {/* Original Headings */}
      <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
        No More Parking Hassles. Just Park
      </h1>
      <p className="text-[#917C0E] text-2xl font-serif italic mb-12">
        Book the Best Spaces
      </p>

      {/* Search Bar */}
      <div className="relative w-full max-w-2xl mb-16">
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

      {/* New Title Section */}
      <h2 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter text-black mb-12">
        Park Your Car
      </h2>

      {/* Container for Image and Button */}
      <div className="relative w-full max-w-4xl mx-auto mt-4">
        {/* Pill/Oval Container */}
        <div className="relative w-full h-[400px] md:h-[500px] rounded-[5rem] overflow-hidden shadow-2xl">
          {/* Background Image with Blur/Dark Effect */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/herocar2.jpg"
              alt="Park Your Car"
              fill
              className="object-cover brightness-[0.7] blur-[1px] scale-105" // Slight scale to avoid blur edges
            />
          </div>

          {/* Overlay Content (Button) */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
            <p className="text-white/80 font-serif italic text-2xl md:text-3xl mb-8 tracking-wide">
              We Handle Rest
            </p>
            <button className="px-8 py-4 bg-[#F4DA71] border-2 border-black rounded-xl font-bold text-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wide">
              Book your Valet Parking
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
