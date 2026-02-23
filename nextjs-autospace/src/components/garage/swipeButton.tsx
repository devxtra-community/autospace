import { useRef, useState, useEffect } from "react";

interface SmoothSwipeButtonProps {
  onSwipeComplete: () => void;
  disabled?: boolean;
  availableText?: string;
  successText?: string;
}

export const SmoothSwipeButton = ({
  onSwipeComplete,
  disabled = false,
  availableText = "✔ Valet available — Swipe to use valet",
  successText = "✓ Valet enabled. Will be assigned after booking.",
}: SmoothSwipeButtonProps) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const startXRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const MAX_WIDTH = 220;
  const THRESHOLD = MAX_WIDTH * 0.85;

  // Color interpolation from black to green
  const getSliderColor = () => {
    const ratio = Math.min(dragX / MAX_WIDTH, 1);
    const r = Math.floor(0 * (1 - ratio) + 34 * ratio);
    const g = Math.floor(0 * (1 - ratio) + 197 * ratio);
    const b = Math.floor(0 * (1 - ratio) + 94 * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getBackgroundColor = () => {
    const ratio = Math.min(dragX / MAX_WIDTH, 1);
    const r = Math.floor(229 * (1 - ratio) + 240 * ratio);
    const g = Math.floor(231 * (1 - ratio) + 253 * ratio);
    const b = Math.floor(235 * (1 - ratio) + 244 * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isCompleted || disabled) return;
    setIsDragging(true);
    startXRef.current = e.clientX - dragX;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isCompleted || disabled) return;
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX - dragX;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || isCompleted || disabled) return;
    const newX = e.clientX - startXRef.current;
    setDragX(Math.max(0, Math.min(newX, MAX_WIDTH)));
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || isCompleted || disabled) return;
    const newX = e.touches[0].clientX - startXRef.current;
    setDragX(Math.max(0, Math.min(newX, MAX_WIDTH)));
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragX >= THRESHOLD) {
      setIsCompleted(true);
      setDragX(MAX_WIDTH);
      onSwipeComplete();
    } else {
      setDragX(0);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, dragX, isCompleted]);

  const progressPercent = (dragX / MAX_WIDTH) * 100;

  const reset = () => {
    setIsCompleted(false);
    setDragX(0);
    setIsDragging(false);
  };

  return (
    <div className="mt-3">
      {!isCompleted && (
        <p className="text-xs text-green-600 font-bold mb-2">{availableText}</p>
      )}

      {isCompleted && (
        <div className="mb-3 p-3 bg-green-50 border border-green-300 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-xs text-green-700 font-bold">{successText}</p>
        </div>
      )}

      <div
        ref={containerRef}
        className={`relative h-12 rounded-full overflow-hidden cursor-grab active:cursor-grabbing select-none transition-all ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        } ${isCompleted ? "border-2 border-green-400 bg-green-50" : ""}`}
        style={{
          backgroundColor: isCompleted ? "#f0fdf4" : getBackgroundColor(),
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Background fill animation */}
        <div
          className="absolute inset-y-0 left-0 transition-all duration-75"
          style={{
            width: `${progressPercent}%`,
            background:
              "linear-gradient(90deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)",
          }}
        />

        {/* Text label */}
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold pointer-events-none z-10">
          <span
            style={{
              color: "#666",
              opacity: isCompleted ? 0 : Math.max(0, 1 - progressPercent / 100),
              transition: "opacity 0.2s ease",
            }}
          >
            Swipe →
          </span>
        </div>

        {/* Draggable slider thumb */}
        <div
          className="absolute top-1 left-1 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold transition-all"
          style={{
            backgroundColor: isCompleted ? "#22c55e" : getSliderColor(),
            transform: `translateX(${dragX}px)`,
            transitionDuration: isDragging ? "0s" : "0.3s",
            boxShadow:
              isDragging && !isCompleted
                ? "0 4px 20px rgba(34, 197, 94, 0.3)"
                : "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          {isCompleted ? "✓" : "→"}
        </div>
      </div>

      {isCompleted && (
        <button
          onClick={reset}
          className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Reset
        </button>
      )}
    </div>
  );
};

export default SmoothSwipeButton;
