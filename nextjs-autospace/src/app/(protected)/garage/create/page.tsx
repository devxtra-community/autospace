"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGarage } from "@/services/garage.service";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import GarageSidebar from "./garageSidebar/page";
import GarageForm from "./garageForm/page";
import GarageLocation from "./garageLocation/page";

const garageSchema = z.object({
  name: z.string().min(2, "Garage name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  locationName: z.string().min(3),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  capacity: z.coerce.number().int().positive(),
});

type GarageFormValues = z.infer<typeof garageSchema>;

const steps = [
  { number: 1, title: "Garage Details", description: "Basic information" },
  { number: 2, title: "Location", description: "Set garage location on map" },
  { number: 3, title: "Review", description: "Verify your information" },
];

export default function CreateGaragePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<GarageFormValues>({
    resolver: zodResolver(garageSchema),
  });

  const formData = watch();

  const onSubmit = async (data: GarageFormValues) => {
    setError("");

    const latitude = data.latitude ?? 9.9312; // Kochi default
    const longitude = data.longitude ?? 76.2673;

    const payload = {
      name: data.name,
      locationName: data.locationName,
      latitude,
      longitude,
      capacity: data.capacity,
    };

    try {
      await createGarage(payload);
      setCurrentStep(3);
      setTimeout(() => {
        router.push("/garage/dashboard");
      }, 1500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Garage creation failed");
      } else {
        setError("Garage creation failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* Header with Autospace Branding */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
            <span className="text-yellow-400 font-bold text-sm">A</span>
          </div>
          <span className="text-xl font-bold text-black">Autospace</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Sidebar - Steps Progress */}
          <GarageSidebar currentStep={currentStep} steps={steps} />

          {/* Right Content - Form */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-10">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
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
