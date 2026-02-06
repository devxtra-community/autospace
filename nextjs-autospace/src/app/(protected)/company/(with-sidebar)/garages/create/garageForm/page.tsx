"use client";
export const dynamic = "force-dynamic";

import { FileText, MapPin, Type, Loader2, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldErrors, UseFormRegister } from "react-hook-form";

interface GarageFormValues {
  name: string;
  description: string;
  locationName: string;
  capacity: number;
  latitude?: number;
  longitude?: number;
}

interface GarageFormProps {
  register: UseFormRegister<GarageFormValues>;
  errors: FieldErrors<GarageFormValues>;
  onNext: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function GarageForm({
  register,
  errors,
  onNext,
  onCancel,
  isLoading = false,
}: GarageFormProps) {
  if (typeof window === "undefined") {
    return null;
  }
  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">
          Create New Garage
        </h1>
        <p className="text-gray-600">
          Add a new garage location to your Autospace fleet.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
        className="space-y-6"
      >
        {/* Garage Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-black">
            <Type className="w-4 h-4 text-yellow-500" />
            Garage Name
          </label>
          <Input
            placeholder="e.g., Downtown Service Center"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Description (UI only) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-black">
            <FileText className="w-4 h-4 text-yellow-500" />
            Description
          </label>
          <textarea
            className="w-full h-32 px-4 py-3 border rounded-lg"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        {/* Location Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-black">
            <MapPin className="w-4 h-4 text-yellow-500" />
            Location Name
          </label>
          <Input
            placeholder="e.g., MG Road, Kochi"
            {...register("locationName")}
          />
          {errors.locationName && (
            <p className="text-sm text-red-500">
              {errors.locationName.message}
            </p>
          )}
        </div>

        {/* Capacity */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-black">
            <Warehouse className="w-4 h-4 text-yellow-500" />
            Parking Capacity
          </label>
          <Input
            type="number"
            min={1}
            placeholder="e.g., 50"
            {...register("capacity", { valueAsNumber: true })}
          />
          {errors.capacity && (
            <p className="text-sm text-red-500">{errors.capacity.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="flex-1 bg-black text-yellow-400"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Next: Set Location"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
