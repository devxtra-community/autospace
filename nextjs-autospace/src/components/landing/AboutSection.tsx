export default function AboutSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8 mb-16">
      <div className="bg-[#F4DA71] rounded-2xl p-12 text-center flex flex-col items-center">
        <h2 className="text-2xl font-bold text-black mb-4">About Us</h2>
        <p className="text-gray-800 font-medium max-w-3xl mb-8 leading-relaxed">
          We're building a smarter parking ecosystem that connects drivers,
          garages, and valet services through one reliable platform.
        </p>
        <button className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
          See more
        </button>
      </div>
    </section>
  );
}
