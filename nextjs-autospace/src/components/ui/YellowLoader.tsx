"use client";

interface YellowLoaderProps {
  text?: string;
}

export function YellowLoader({ text = "Loading..." }: YellowLoaderProps) {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-secondary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
        <p className="text-sm font-bold text-gray-900 tracking-widest uppercase animate-pulse">
          {text}
        </p>
      </div>
    </div>
  );
}
