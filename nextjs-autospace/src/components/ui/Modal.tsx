"use client";

import { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      {/* px-4 is VERY IMPORTANT for mobile */}
      <div className="bg-card rounded-md w-full max-w-md p-6 relative">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
}
