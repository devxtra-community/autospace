"use client";
export const dynamic = "force-dynamic";

import { Phone, Mail, MapPin, Type, Loader2, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { useState } from "react";
import type { GarageFormValues } from "../page";

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
  const [filled, setFilled] = useState({
    name: false,
    phone: false,
    email: false,
    locationName: false,
    capacity: false,
  });

  const allFilled = Object.values(filled).every(Boolean);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create New Garage</h1>
        <p className="text-gray-600">
          Add a new garage location to your Autospace fleet.
        </p>
      </div>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        {/* Name */}
        <Field
          label="Garage Name"
          icon={<Type className="w-4 h-4 text-yellow-500" />}
          error={errors.name?.message}
        >
          <Input
            {...register("name")}
            onChange={(e) =>
              setFilled((s) => ({ ...s, name: e.target.value.trim() !== "" }))
            }
          />
        </Field>

        {/* Phone */}
        <Field
          label="Phone"
          icon={<Phone className="w-4 h-4 text-yellow-500" />}
          error={errors.phone?.message}
        >
          <Input
            type="tel"
            {...register("phone")}
            onChange={(e) =>
              setFilled((s) => ({ ...s, phone: e.target.value.trim() !== "" }))
            }
          />
        </Field>

        {/* Email */}
        <Field
          label="Email"
          icon={<Mail className="w-4 h-4 text-yellow-500" />}
          error={errors.email?.message}
        >
          <Input
            type="email"
            {...register("email")}
            onChange={(e) =>
              setFilled((s) => ({ ...s, email: e.target.value.trim() !== "" }))
            }
          />
        </Field>

        {/* Location */}
        <Field
          label="Location Name"
          icon={<MapPin className="w-4 h-4 text-yellow-500" />}
          error={errors.locationName?.message}
        >
          <Input
            {...register("locationName")}
            onChange={(e) =>
              setFilled((s) => ({
                ...s,
                locationName: e.target.value.trim() !== "",
              }))
            }
          />
        </Field>

        {/* Capacity */}
        <Field
          label="Capacity"
          icon={<Warehouse className="w-4 h-4 text-yellow-500" />}
          error={errors.capacity?.message}
        >
          <Input
            type="number"
            min={1}
            {...register("capacity", { valueAsNumber: true })}
            onChange={(e) =>
              setFilled((s) => ({ ...s, capacity: e.target.value !== "" }))
            }
          />
        </Field>

        {/* Actions */}
        <div className="flex gap-3 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>

          <Button
            type="submit"
            className="bg-black text-yellow-400"
            disabled={!allFilled || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading
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

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 font-semibold">
        {icon}
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
