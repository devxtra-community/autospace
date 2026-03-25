"use client";

import { ArrowRight } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
  bgColor: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Find Parking Near You",
    description:
      "Use our smart geo search to instantly discover nearby garages with available parking slots in your area.",
    bgColor: "#F6E3A2",
  },
  {
    id: 2,
    title: "Choose Your Garage",
    description:
      "View garage details, pricing, and available slot types to choose the best parking option for your vehicle.",
    bgColor: "#E4D7FF",
  },
  {
    id: 3,
    title: "Reserve Your Slot",
    description:
      "Select your parking time, vehicle type, and confirm your reservation in just a few seconds.",
    bgColor: "#F1E0C6",
  },
  {
    id: 4,
    title: "Receive Secure Entry PIN",
    description:
      "After booking, you receive a secure entry PIN that allows access to your reserved parking slot.",
    bgColor: "#DDE5E1",
  },
  {
    id: 5,
    title: "Request Valet Service",
    description:
      "Want extra convenience? Request a valet to pick up your car and park it safely at the garage.",
    bgColor: "#F0DAD4",
  },
  {
    id: 6,
    title: "Your Car Is Parked",
    description:
      "Once your vehicle arrives at the garage, it is securely parked in your reserved slot.",
    bgColor: "#EAD6D8",
  },
  {
    id: 7,
    title: "Receive Your Car",
    description:
      "When you're ready to leave, your car can be returned by the valet or you can exit using your secure exit PIN.",
    bgColor: "#DADAE8",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-white px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            How Autospace Works
          </h2>
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-gray-600 leading-relaxed">
              Book parking in seconds and park stress‑free with Autospace. Find
              garages, reserve slots, or let a valet handle your car.
            </p>
          </div>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Featured Card (Card 1) */}
          <div className="lg:col-span-2">
            <HowItWorksCard {...steps[0]} isFeatured />
          </div>

          {/* All other cards */}
          {steps.slice(1).map((step) => (
            <HowItWorksCard key={step.id} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksCard({
  title,
  description,
  bgColor,
}: Step & { isFeatured?: boolean }) {
  return (
    <div
      className={`p-8 rounded-3xl h-full flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group min-h-[280px]`}
      style={{
        backgroundColor: bgColor,
      }}
    >
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight leading-snug">
          {title}
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed mb-8 opacity-80">
          {description}
        </p>
      </div>

      <button
        disabled
        className="flex items-center gap-2 text-sm font-bold text-gray-900 opacity-60 cursor-default group-hover:opacity-100 transition-opacity"
      >
        Read more{" "}
        <ArrowRight
          size={16}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </button>
    </div>
  );
}
