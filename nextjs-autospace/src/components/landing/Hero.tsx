import Image from "next/image";
import { MapPin, Search } from "lucide-react";

export default function Hero() {
  return (
    <section className="flex flex-col font-zalando items-center pt-[250px] pb-24 px-4 max-w-7xl mx-auto text-center">
      {/* Original Headings */}
      <h1 className="text-4xl md:text-5xl font-medium text-black mb-4">
        No More Parking Hassles. Just Park
      </h1>
      <p className="text-[#917C0E] text-4xl font-serif mb-12">
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
          className="w-full py-4 pl-12 pr-12 rounded-full border border-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F4DA71] text-gray-600"
        />
        <div className="absolute inset-y-0 right-4 flex items-center border-l pl-3 border-gray-700">
          <Search className="text-gray-700 w-6 h-6" />
        </div>
      </div>

      {/* Hand Over Your Car Section - Matching Image 2 */}
      <div className="w-full max-w-6xl mx-auto">
        {/* Title Above Car */}
        <div className="text-left mb-8">
          <h2 className="text-5xl md:text-6xl font-bold text-black">
            <span className="text-[#917C0E]">Hand Over</span> Your Car.
          </h2>
          <p className="text-xl md:text-2xl text-black mt-2">We Handle Rest</p>
        </div>

        {/* Car Image with Button */}
        <div className="relative w-full h-[300px] md:h-[400px]">
          {/* Button positioned on the left */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20">
            <button className="px-6 py-3 md:px-8 md:py-4 bg-[#F4DA71] border-2 border-black rounded-xl font-bold text-black text-base md:text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
              Book your
              <br />
              Valet Parking
            </button>
          </div>

          {/* Car Image */}
          <div className="relative w-full h-full">
            <Image
              src="/car3.jpg"
              alt="Luxury Sports Car"
              fill
              className="object-contain object-center"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
