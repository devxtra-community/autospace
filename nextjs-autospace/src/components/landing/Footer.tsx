import { Instagram, Mail, Phone, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-700 text-white pt-16 relative overflow-hidden font-sans">
      {/* Grid overlay for aesthetic (matches reference faint grid vibe) */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255, 255, 255, 0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] z-0"></div>

      {/* Top Section */}
      <div className="max-w-[90rem] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start z-10 relative">
        {/* Left: Icons */}
        <div className="flex flex-wrap items-center gap-3 mb-12 md:mb-0">
          <Link
            href="#"
            className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Instagram className="w-5 h-5 text-white/80" />
          </Link>
          <Link
            href="#"
            className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Phone className="w-5 h-5 text-white/80" />
          </Link>
          <Link
            href="#"
            className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Mail className="w-5 h-5 text-white/80" />
          </Link>
        </div>

        {/* Right: Links */}
        <div className="flex flex-col gap-2 w-full md:w-auto min-w-[300px]">
          {["Terms", "Privacy", "Cookies", "Sitemap"].map((item) => (
            <Link
              key={item}
              href="#"
              className="group flex items-center justify-between gap-16 md:gap-24 px-6 md:px-8 py-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/10 transition-colors"
            >
              <span className="text-white/80 text-sm tracking-wide lowercase">
                {item}
              </span>
              <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom: Giant Text */}
      <div className="mt-24 md:mt-32 w-full flex justify-center items-center overflow-hidden pointer-events-none select-none z-10 relative">
        <h1
          className="text-[17vw] font-bold tracking-tighter text-white leading-[0.75] mb-[-2vw] px-4 whitespace-nowrap"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        >
          Autospace
        </h1>
      </div>
    </footer>
  );
}
