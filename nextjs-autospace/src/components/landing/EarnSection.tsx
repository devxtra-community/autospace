"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

const cards = [
  {
    id: 1,
    label: "Public Marketplace",
    image: "/publicCarpark.jpg",
    href: "#",
  },
  {
    id: 2,
    label: "Corporate Leasing",
    image: "/coorparateParking.jpg",
    href: "#",
  },
  {
    id: 3,
    label: "Dedicated/Reserved",
    image: "/resrvedParking.jpg",
    href: "#",
  },
];

function ParkingCard({
  label,
  image,
  href,
}: {
  label: string;
  image: string;
  href: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        border: hovered ? "3px solid #22c55e" : "3px solid transparent",
        transition: "border-color 0.35s ease, box-shadow 0.35s ease",
        boxShadow: hovered
          ? "0 0 0 2px rgba(34,197,94,0.25), 0 8px 32px rgba(34,197,94,0.15)"
          : "0 2px 16px rgba(0,0,0,0.10)",
      }}
    >
      {/* Card Image */}
      <div className="relative w-full h-52 overflow-hidden">
        <Image
          src={image}
          alt={label}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Green overlay on hover */}
        <div
          className="absolute inset-0 transition-opacity duration-350"
          style={{
            background:
              "linear-gradient(180deg, rgba(34,197,94,0.18) 0%, rgba(21,128,61,0.32) 100%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.35s ease",
          }}
        />
      </div>

      {/* Label Bar */}
      <div
        className="flex items-center justify-between px-5 py-4 transition-colors duration-350"
        style={{
          backgroundColor: hovered ? "#22c55e" : "#ffffff",
          transition: "background-color 0.35s ease",
        }}
      >
        <span
          className="text-base font-semibold tracking-wide transition-colors duration-350"
          style={{
            color: hovered ? "#ffffff" : "#111827",
            transition: "color 0.35s ease",
          }}
        >
          {label}
        </span>

        {/* Arrow Button */}
        <div
          className="flex items-center justify-center rounded-full w-9 h-9 transition-all duration-350"
          style={{
            backgroundColor: hovered ? "#ffffff" : "#f3f4f6",
            boxShadow: hovered ? "0 2px 8px rgba(34,197,94,0.30)" : "none",
            transition:
              "background-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease",
            transform: hovered ? "translateX(3px)" : "translateX(0)",
          }}
        >
          <ArrowRight
            size={17}
            style={{
              color: hovered ? "#22c55e" : "#6b7280",
              transition: "color 0.35s ease",
            }}
          />
        </div>
      </div>
    </a>
  );
}

export default function EarnSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      {/* Hero Banner — two-column layout */}
      <div className="flex flex-col lg:flex-row h-[60vh] items-stretch gap-6 mb-10 rounded-2xl overflow-hidden bg-white shadow-sm">
        {/* Left: Text */}
        <div className="flex flex-col justify-center gap-6 px-12 py-14 lg:w-5/12">
          <h2 className="text-4xl font-extrabold text-gray-900 leading-snug">
            Earn From Your
            <br />
            <span className="text-[#917C0E]">Parking Space</span>
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            Turn your unused parking spot into a steady income stream. List your
            space in minutes and start earning today.
          </p>
          <div className="flex items-center gap-3">
            <button className="bg-black text-[#F4DA71] font-bold py-3 px-7 rounded-xl border-2 border-transparent hover:border-[#F4DA71] transition-all shadow-md text-sm">
              Register Now
            </button>
            <button className="border-2 border-gray-200 text-gray-700 font-semibold py-3 px-7 rounded-xl hover:border-gray-400 transition-all text-sm">
              More Info
            </button>
          </div>
        </div>

        {/* Right: Image */}
        <div className="relative lg:w-7/12 h-72 lg:h-auto min-h-[280px]">
          <Image
            src="/bgparking1.jpg"
            alt="Parking Garage"
            fill
            className="object-cover rounded-2xl lg:rounded-none lg:rounded-r-3xl"
          />
        </div>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {cards.map((card) => (
          <ParkingCard
            key={card.id}
            label={card.label}
            image={card.image}
            href={card.href}
          />
        ))}
      </div>
    </section>
  );
}
