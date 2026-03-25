import { ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
  linkHref: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
  linkHref,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl text-white ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[22px] font-bold text-gray-900 leading-none mb-1">
            {value}
          </h3>
          <p className="text-[13px] text-gray-500 font-medium">{label}</p>
        </div>
      </div>
      <div className="border-t border-dashed border-gray-200 pt-4 flex items-center justify-between mt-1">
        <Link
          href={linkHref}
          className="text-[13px] text-gray-500 font-semibold hover:text-gray-900 transition-colors"
        >
          View details
        </Link>
        <ArrowRight className="w-4 h-4 text-gray-500" />
      </div>
    </div>
  );
}
