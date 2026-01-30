"use client";

import { MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GarageLocationProps {
  formData: {
    name: string;
    description: string;
    locationName: string;
    latitude?: number;
    longitude?: number;
  };
  currentStep: number;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export default function GarageLocation({
  formData,
  currentStep,
  onBack,
  isSubmitting = false,
}: GarageLocationProps) {
  /* ---------------- STEP 2 ---------------- */
  if (currentStep === 2) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">
            Set Garage Location
          </h1>
          <p className="text-gray-600">
            Location selection will be enabled later. For now, review details.
          </p>
        </div>

        {/* PLACEHOLDER (NO MAP) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-black">
            <MapPin className="w-4 h-4 text-yellow-500" />
            Garage Location
          </label>

          <div className="w-full h-40 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
            <p className="text-sm text-gray-500 text-center px-6">
              Map integration will be added next.
              <br />
              This step is intentionally disabled for now.
            </p>
          </div>

          <p className="text-xs text-gray-600">
            Exact coordinates will be selected once map integration is enabled.
          </p>
        </div>

        {/* PREVIEW */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-black mb-4">Location Preview</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Garage Name:</span>{" "}
              {formData.name || "—"}
            </p>
            <p>
              <span className="font-medium">Location Name:</span>{" "}
              {formData.locationName || "—"}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Back
          </Button>

          <Button
            type="button"
            className="flex-1 h-11 bg-black hover:bg-gray-900 text-yellow-400 font-semibold"
            disabled
          >
            Location Required (Next Step)
          </Button>
        </div>
      </div>
    );
  }

  /* ---------------- STEP 3 ---------------- */
  if (currentStep === 3) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-black mb-2">
            Garage Created Successfully
          </h1>
          <p className="text-gray-600 text-center max-w-sm">
            Your garage <strong>{formData.name}</strong> has been created.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
