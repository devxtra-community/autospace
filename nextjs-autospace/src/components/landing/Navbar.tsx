export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
      <div className="flex items-center">
        {/* Placeholder for Logo */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-8 h-8 relative">
            {/*  Icon placeholder */}
            <div className="absolute inset-0 border-t-4 border-l-4 border-black rounded-tl-lg skew-x-[-10deg]"></div>
            <div className="absolute top-2 left-2 w-4 h-1 bg-yellow-400 rounded-full"></div>
          </div>
          <span className="font-bold text-xs tracking-widest mt-1">PARKER</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="px-6 py-2 bg-[#F4DA71] text-black font-medium border border-black rounded-lg hover:bg-[#eac855] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
          Rent Plot
        </button>
        <button className="px-6 py-2 bg-white text-black font-medium border border-black rounded-lg hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
          Signup
        </button>
      </div>
    </nav>
  );
}
