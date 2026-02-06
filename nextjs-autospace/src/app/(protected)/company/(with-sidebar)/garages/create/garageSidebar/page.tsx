"use client";

import { CheckCircle2 } from "lucide-react";

interface GarageSidebarProps {
  currentStep: number;
  steps: { number: number; title: string; description: string }[];
}

export default function GarageSidebar({
  currentStep,
  steps,
}: GarageSidebarProps) {
  if (typeof window === "undefined") {
    return null;
  }
  return (
    <div className="lg:col-span-3">
      <div className="sticky top-24">
        <div className="space-y-8">
          {steps.map((step, idx) => (
            <div key={step.number} className="relative">
              {/* Connection line */}
              {idx < steps.length - 1 && (
                <div className="absolute left-5 top-16 w-0.5 h-12 bg-gradient-to-b from-yellow-300 to-yellow-100" />
              )}

              {/* Step indicator */}
              <div className="flex gap-4">
                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    currentStep === step.number
                      ? "bg-black text-yellow-400 shadow-lg shadow-black/30 scale-110"
                      : currentStep > step.number
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>

                <div className="flex-1 pt-1">
                  <h3
                    className={`font-semibold transition-colors ${
                      currentStep === step.number
                        ? "text-black"
                        : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Progress</span>
            <span className="text-xs font-bold text-yellow-500">
              {Math.round((currentStep / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
