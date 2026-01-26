"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCompany } from "@/services/company.service";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const companySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  location: z.string().min(2, "Location is required"),
});

type CompanyFormjsValues = z.infer<typeof companySchema>;

export default function CreateCompanyPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormjsValues>({
    resolver: zodResolver(companySchema),
  });

  const onSubmit = async (data: CompanyFormjsValues) => {
    setError("");
    try {
      await createCompany(data);
      router.replace("/company/status");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Company creation failed");
      } else {
        setError("Company creation failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg border border-border shadow-xl rounded-3xl">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black font-bold text-xl">
            A
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight">
            Register Your Company
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Start managing your parking operations on{" "}
            <span className="font-semibold text-primary">Autospace</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Company Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                placeholder="Eg: FastPark Pvt Ltd"
                {...register("name")}
                className="rounded-xl"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="company@autospace.com"
                {...register("email")}
                className="rounded-xl"
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">Contact Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                {...register("phone")}
                className="rounded-xl"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label htmlFor="location">Business Location</Label>
              <Input
                id="location"
                placeholder="City, State"
                {...register("location")}
                className="rounded-xl"
              />
              {errors.location && (
                <p className="text-sm text-destructive">
                  {errors.location.message}
                </p>
              )}
            </div>

            {/* CTA */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-primary text-black font-semibold hover:bg-primary/90 transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit for Verification"
              )}
            </Button>
          </form>

          <p className="mt-5 text-xs text-muted-foreground text-center leading-relaxed">
            Your company will be reviewed by our team before approval. Once
            approved, you can start adding garages and managing slots.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
