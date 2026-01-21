const features = [
  {
    title: "Smart Parking Booking",
    description:
      "Find and reserve nearby parking spaces instantly with transparent pricing and availability.",
  },
  {
    title: "Professional Valet Service",
    description:
      "Trained valets operating under verified garages handle your car safely and efficiently.",
  },
  {
    title: "Parking Partner Network",
    description:
      "Garage owners and space providers can list and manage their parking spaces to earn reliably.",
  },
  {
    title: "Real-Time Tracking & Notifications",
    description:
      "Stay informed with live booking updates, valet status, and confirmations through notifications.",
  },
];

export default function ChooseParkerSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-black mb-2">
          Why Choosing Parker ?
        </h2>
        <p className="font-bold text-sm text-black mb-4">Shaping Vision</p>
        <p className="text-gray-600 max-w-3xl leading-relaxed">
          We aim to simplify urban parking by connecting drivers, garages, and
          valet services on one smart platform. Our goal is to reduce parking
          stress, improve space utilization, and deliver a secure, seamless
          parking experience for everyone.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-[#FFF8E7] p-6 rounded-xl border-b-4 border-r-4 border-l border-t border-[#F4DA71] shadow-sm h-full flex flex-col items-center text-center"
          >
            <h3 className="font-bold text-lg mb-4 leading-tight">
              {feature.title}
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed font-semibold">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
