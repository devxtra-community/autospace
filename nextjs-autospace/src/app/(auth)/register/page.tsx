"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RegisterForm } from "@/components/(auth)/registerForm";
import { BackButton } from "@/components/ui/BackButton";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative">
      <BackButton />
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        {/* LEFT SIDE (IMAGE + TEXT) */}
        <div className="hidden md:flex flex-col items-center text-center">
          <img
            src="/valet-illustration.png"
            alt="Park Your Car"
            width={420}
            height={320}
            className="
              w-[380px] h-auto
              min-[1440px]:w-[450px]
              min-[1440px]:h-[350px]
            "
          />

          <h2 className="mt-6 text-3xl font-semibold text-foreground">
            Park Your Car
          </h2>
          <p className="mt-2 text-md text-muted-foreground max-w-xs">
            Track your vehicle in real-time with our valet service and enjoy
            hassle-free parking.
          </p>
        </div>

        {/* RIGHT SIDE (CARD + FORM) */}
        <Card className="w-full max-w-lg mx-auto bg-background border-none shadow-none rounded-2xl">
          <CardContent className="p-8 flex flex-col gap-2">
            <h1 className="text-3xl font-semibold text-center">Sign Up</h1>
            <p className="text-sm text-muted-foreground text-center">
              Please provide details below to create an account.
            </p>

            <div className="mt-6 space-y-8">
              {/* CUSTOMER REGISTER FORM */}
              <RegisterForm role="customer" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
