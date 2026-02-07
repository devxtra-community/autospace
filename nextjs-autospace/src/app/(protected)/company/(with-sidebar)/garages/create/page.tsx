"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { createGarage } from "@/services/garage.service";
import GarageForm from "./garageForm/page";
import GarageLocation from "./garageLocation/page";

const GarageSidebar = dynamic(() => import("./garageSidebar/page"), {
  ssr: false,
});

const garageSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  description: z.string().min(10),
  locationName: z.string().min(3),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  capacity: z.coerce.number().int().positive(),
});

export type GarageFormValues = z.infer<typeof garageSchema>;

const steps = [
  { number: 1, title: "Garage Details", description: "Basic information" },
  { number: 2, title: "Location", description: "Set garage location on map" },
  { number: 3, title: "Review", description: "Verify your information" },
];

export default function CreateGaragePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<GarageFormValues>({
    resolver: zodResolver(garageSchema),
  });

  const formData = watch();

  const onSubmit = async (data: GarageFormValues) => {
    setError("");

    if (!data.latitude || !data.longitude) {
      setError("Please select garage location on map");
      return;
    }

    try {
      await createGarage({
        name: data.name,
        locationName: data.locationName,
        latitude: data.latitude,
        longitude: data.longitude,
        capacity: data.capacity,
      });

      setCurrentStep(3);
      setTimeout(() => router.push("/company/dashboard"), 1500);
    } catch {
      setError("Garage creation failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <GarageSidebar currentStep={currentStep} steps={steps} />

          <div className="lg:col-span-9">
            <div className="bg-white rounded-2xl border p-8 md:p-10">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              {currentStep === 1 && (
                <GarageForm
                  register={register}
                  errors={errors}
                  onNext={() => setCurrentStep(2)}
                  onCancel={() => router.back()}
                  isLoading={isSubmitting}
                />
              )}

              {(currentStep === 2 || currentStep === 3) && (
                <GarageLocation
                  formData={formData}
                  currentStep={currentStep}
                  setValue={setValue}
                  onBack={() => setCurrentStep(1)}
                  onSubmit={() => handleSubmit(onSubmit)()}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
