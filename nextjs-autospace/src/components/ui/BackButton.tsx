"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={cn(
        "absolute top-6 left-6 flex items-center gap-2 bg-[#e9efd4] hover:bg-[#dfe6c4] px-4 py-2 rounded-full transition-colors border border-black/5 z-50",
        className,
      )}
    >
      <div className="bg-[#c8d8a3] rounded-full p-1 flex items-center justify-center">
        <ArrowLeft size={16} className="text-black" />
      </div>
      <span className="font-bold text-sm text-black">Go Back</span>
    </button>
  );
}
