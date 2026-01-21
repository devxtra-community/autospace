"use client";

import Image from "next/image";

const partners = [
  { name: "Nova", src: "https://placehold.co/150x50/003366/FFF?text=NOVA" },
  { name: "Kross", src: "https://placehold.co/150x50/333/FFF?text=CROSS" },
  { name: "Fact", src: "https://placehold.co/150x50/000/FFF?text=FACT" },
  { name: "Trek", src: "https://placehold.co/150x50/000/FFF?text=TREK" },
  { name: "X", src: "https://placehold.co/150x50/000/FFF?text=X" },
  // Duplicate for seamless loop
  { name: "Nova", src: "https://placehold.co/150x50/003366/FFF?text=NOVA" },
  { name: "Kross", src: "https://placehold.co/150x50/333/FFF?text=CROSS" },
  { name: "Fact", src: "https://placehold.co/150x50/000/FFF?text=FACT" },
  { name: "Trek", src: "https://placehold.co/150x50/000/FFF?text=TREK" },
  { name: "X", src: "https://placehold.co/150x50/000/FFF?text=X" },
];

export default function PartnersSection() {
  return (
    <section className="py-20 overflow-hidden bg-white">
      <h2 className="text-3xl font-bold text-center mb-16 text-black">
        Our Trusted Parking Partners
      </h2>

      <div className="relative w-full overflow-hidden">
        <div className="flex w-[200%] animate-marquee">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[10%] flex justify-center items-center px-4"
            >
              <div className="relative w-32 h-12 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all">
                <Image
                  src={partner.src}
                  alt={partner.name}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </section>
  );
}
