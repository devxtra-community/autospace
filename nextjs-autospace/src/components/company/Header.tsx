"use client";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Company Dashboard" }: HeaderProps) {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3 bg-white border-b mb-6">
      <h1 className="text-xl sm:text-2xl font-semibold">{title}</h1>
    </div>
  );
}
