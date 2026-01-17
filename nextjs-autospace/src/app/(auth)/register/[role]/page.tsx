import { Card, CardContent } from "@/components/ui/card";
import { RegisterForm } from "@/components/(auth)/registerForm";
import { RoleTabs } from "@/components/(auth)/roletabs";
import { notFound } from "next/navigation";
import { use } from "react";

const allowedRoles = ["owner", "manager", "valet"] as const;
type Role = (typeof allowedRoles)[number];

export default function RoleRegisterPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = use(params);

  if (!allowedRoles.includes(role as Role)) {
    notFound();
  }
  //  const role = params.role as "owner" | "manager" | "valet";

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center px-6">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        {/* LEFT SIDE */}
        <div className="hidden md:flex flex-col items-center text-center">
          <img
            src="/valet-illustration.png"
            alt="Park Your Car"
            className="w-[380px]"
          />

          <h2 className="mt-6 text-3xl font-semibold">Park Your Car</h2>

          <p className="mt-2 text-muted-foreground max-w-xs">
            Track your vehicle in real-time with our valet service and enjoy
            hassle-free parking.
          </p>
        </div>

        {/* RIGHT CARD */}
        <Card className="w-full max-w-lg mx-auto bg-background border-none shadow-none rounded-2xl">
          <CardContent className="p-8 flex flex-col gap-2">
            <h1 className="text-3xl font-semibold text-center">Sign Up</h1>
            <p className="text-sm text-muted-foreground text-center">
              Please provide details below to create an account.
            </p>

            <div className="mt-6 space-y-8">
              <RoleTabs activeRole={role as Role} />
              {/* CUSTOMER REGISTER FORM */}
              <RegisterForm role={role as Role} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
