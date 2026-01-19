"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Phone,
  User,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Warehouse,
} from "lucide-react";
import { registerOwner } from "@/lib/auth.api";
import type { RegisterApiInput } from "@autospace/shared/auth/register.schema";

interface ApiErrorResponse {
  success: false;
  message: string;
}

interface Props {
  role: "customer" | "owner" | "valet" | "manager";
}

export function RegisterForm({ role }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("REGISTER FORM ROLE 👉", role);

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    companyId: "",
    garageId: "",
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!acceptedTerms) {
        setError("Please accept Terms & Conditions");
        return;
      }

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
        role,
        ...(role === "valet" && { companyId: Number(form.companyId) }),
        ...(role === "manager" && { garageId: Number(form.garageId) }),
      };

      await registerOwner(payload);
      window.location.href = "/login";
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(
        axiosError.response?.data?.message ??
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Full Name */}
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10 h-12 rounded-md"
          placeholder="Full Name"
          value={form.fullname}
          onChange={(e) => handleChange("fullname", e.target.value)}
        />
      </div>

      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="email"
          className="pl-10 h-12 rounded-md"
          placeholder="Email Address"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
      </div>

      {/* Phone */}
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="tel"
          className="pl-10 h-12 rounded-md"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
      </div>

      {/* Manager only */}
      {role === "manager" && (
        <div className="relative">
          <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10 h-12 rounded-md"
            placeholder="Manager Access Code"
            value={form.garageId}
            onChange={(e) => handleChange("garageId", e.target.value)}
          />
        </div>
      )}

      {/* Valet only */}
      {role === "valet" && (
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10 h-12 rounded-md"
            placeholder="Company ID"
            value={form.companyId}
            onChange={(e) => handleChange("companyId", e.target.value)}
          />
        </div>
      )}

      {/* Password */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type={showPassword ? "text" : "password"}
          className="pl-10 pr-10 h-12 rounded-md"
          placeholder="Password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Confirm Password */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type={showConfirm ? "text" : "password"}
          className="pl-10 pr-10 h-12 rounded-md"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Terms */}
      <div className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="accent-yellow-400"
        />
        <span className="text-muted-foreground">
          I agree with{" "}
          <span className="text-secondary cursor-pointer">
            Terms & Conditions
          </span>{" "}
          and{" "}
          <span className="text-secondary cursor-pointer">Privacy Policy</span>{" "}
          of Auto Space
        </span>
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <Button
        className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-md"
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create Account"}
      </Button>

      <p className="text-sm text-center text-muted-foreground">
        Have an account?{" "}
        <span className="text-secondary font-medium cursor-pointer">Login</span>
      </p>
    </div>
  );
}
