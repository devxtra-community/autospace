import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="flex items-center border border-black bg-white/60 fixed top-0 left-0 right-0 z-50 backdrop-blur-sm w-full justify-between px-18 py-6 max-w-full mx-auto">
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <Image
            src="/auto2.png"
            alt="Autospace logo"
            width={40}
            height={40}
            priority
            className="scale-150"
          />
          {/* <span className="font-bold tracking-widest text-sm text-black">
            AUTOSPACE
          </span> */}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="px-6 py-2 bg-[var(--secondary-button)] text-black font-medium border border-black rounded-lg hover:bg-[#eac855] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
          Rent Plot
        </button>
        <button className="px-6 py-2 bg-white text-black font-medium border border-black rounded-lg hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
          Signup
        </button>
      </div>
    </nav>
  );
}
