"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
  fallbackHref?: string;
}

export function BackButton({ className, fallbackHref = "/" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    const referrer = document.referrer;
    const isSameOrigin =
      referrer && referrer.startsWith(window.location.origin);

    if (isSameOrigin) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleBack}
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
