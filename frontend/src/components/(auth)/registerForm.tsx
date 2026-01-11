"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Mail, Phone, User, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { registerUser } from "@/lib/auth.api";
import type { RegisterApiInput } from "@autospace/shared/auth/register.schema";

export default function RegisterLayout() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);

      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      const payload: RegisterApiInput = {
        fullname: form.fullname,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: "customer",
      };

      await registerUser(payload);
      window.location.href = "/login";
    } catch (err: unknown) {
      let message = "Registration failed";

      if (err instanceof Error && typeof err.message === "string") {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        {/* LEFT SIDE */}
        <div className="hidden md:flex flex-col items-center text-center">
          <img
            src="/valet-illustration.png"
            alt="Park Your Car"
            width={420}
            height={320}
            className="
                 w-[380px]  h-auto
                 min-[1440px]:w-[450px]
                 min-[1440px]:h-[350px] "
          />

          <h2 className="mt-6 text-3xl font-semibold text-foreground">
            Park Your Car
          </h2>
          <p className="mt-2 text-md text-muted-foreground max-w-xs">
            Track your vehicle in real-time with our valet service and enjoy
            hassle-free parking.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <Card className="w-full max-w-lg mx-auto bg-background border-none shadow-none rounded-2xl">
          <CardContent className="p-8 flex flex-col gap-2">
            <h1 className="text-3xl font-semibold text-center">Sign Up</h1>
            <p className="text-sm text-muted-foreground text-center">
              Please provide details below to create an account.
            </p>

            <div className="mt-6 space-y-8">
              {/* Full Name */}
              <div className="relative bg-muted">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 py-5 bg-muted rounded-none"
                  placeholder="Full Name"
                  value={form.fullname}
                  onChange={(e) => handleChange("fullname", e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="relative bg-muted">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  className="pl-9 py-5 bg-muted rounded-none"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              {/* Phone */}
              <div className="relative bg-muted">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  className="pl-9 py-5 bg-muted rounded-none"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10 bg-muted rounded-none"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showConfirm ? "text" : "password"}
                  className="pl-10 pr-10 bg-muted rounded-none"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button
                className="w-full text-text"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Have an account?{" "}
                <span className="text-secondary font-medium cursor-pointer">
                  Login
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
