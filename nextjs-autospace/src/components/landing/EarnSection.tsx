import Image from "next/image";

export default function EarnSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="relative rounded-[2rem] overflow-hidden bg-gray-200 h-[500px] w-full border border-gray-200 shadow-lg">
        {/* Background Image Placeholder */}
        <Image
          src="/bgparking1.jpg"
          alt="Parking Garage"
          fill
          className="object-cover"
        />

        {/* Content Overlay */}
        <div className="absolute top-12 left-0 z-10">
          <div className="bg-white py-8 px-12 rounded-r-[3rem] shadow-sm max-w-md">
            <h2 className="text-4xl font-bold text-black leading-tight">
              Earn
              <br />
              From Your
              <br />
              <span className="text-[#917C0E]">Parking Space</span>
            </h2>
          </div>
          <div className="ml-12 mt-6">
            <button className="bg-black text-[#F4DA71] text-lg font-bold py-4 px-8 rounded-xl border-2 border-transparent hover:border-[#F4DA71] transition-all shadow-lg">
              Register
              <br />
              now
            </button>
          </div>
        </div>

        {/* Decorative mask effect helper (simulating the curve if needed, but the white box above handles most of it) */}
      </div>
    </section>
  );
}
