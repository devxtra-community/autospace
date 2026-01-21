import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-gray-500 font-medium text-sm flex items-center">
          <span className="mr-2">©</span> 2025 - Parker
        </div>

        <div className="flex items-center gap-8 text-[#917C0E]">
          <Link href="#" className="hover:text-[#F4DA71] transition-colors">
            <Instagram className="w-6 h-6" />
          </Link>
          <Link href="#" className="hover:text-[#F4DA71] transition-colors">
            <Facebook className="w-6 h-6" />
            {/* Note: In a real scenario, use actual icons. Lucide icons are close approximations. */}
          </Link>
          <Link href="#" className="hover:text-[#F4DA71] transition-colors">
            <Mail className="w-6 h-6" />
          </Link>
          <Link href="#" className="hover:text-[#F4DA71] transition-colors">
            <Phone className="w-6 h-6" />
          </Link>
        </div>

        <div className="flex items-center gap-6 text-gray-500 text-sm font-bold">
          <Link href="#" className="hover:text-black">
            Terms
          </Link>
          <Link href="#" className="hover:text-black">
            Privacy
          </Link>
          <Link href="#" className="hover:text-black">
            Cookies
          </Link>
          <Link href="#" className="hover:text-black">
            Sitemap
          </Link>
        </div>
      </div>
    </footer>
  );
}
