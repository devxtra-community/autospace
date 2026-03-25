"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

import { BackButton } from "@/components/ui/BackButton";

import { loginUser, getMe, logoutUser } from "@/lib/auth.api";
import { redirectByRole } from "@/lib/roleredirect";
import { LoginDto } from "@autospace/shared";

export default function ManagementLoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload: LoginDto = {
        email: identifier,
        password,
      };

      await loginUser(payload);
      console.log("LOGIN OK");

      const meRes = await getMe();
      console.log("ME RESPONSE", meRes.data);

      const role = meRes.data.data.role;

      if (role === "customer") {
        await logoutUser();
        setError("This login portal is for management users only.");
        return;
      }

      await redirectByRole(role);
    } catch (err) {
      const axiosError = err as AxiosError<{
        success: false;
        error: { code: string; message: string };
      }>;

      if (axiosError.response?.data?.error?.code === "GARAGE_BLOCKED") {
        window.location.href = "/garage-blocked";
        return;
      } else if (axiosError.response?.data?.error?.message) {
        setError(axiosError.response.data.error.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      if (!error) setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 relative">
      <BackButton />
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-40 p-6 sm:p-10">
        {/* LEFT (DESKTOP ONLY) */}
        <div className="hidden md:flex flex-col items-center justify-center text-center gap-6">
          <Image
            src="/coorparateParking.jpg"
            alt="Management Portal"
            width={420}
            height={320}
            className="rounded-lg object-cover w-full max-h-[320px]"
            priority
          />

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Management Portal</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Secure access for systems administration and parking operations
              management.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col justify-center gap-8 w-full max-w-md mx-auto">
          {/* Heading */}
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-3xl text-center font-semibold">
              Management Login
            </h1>
            <p className="text-sm text-center text-muted-foreground">
              Sign in to manage parking operations, garages, and system
              administration.
            </p>
          </div>

          {/* Email Input */}
          <div className="space-y-2 translate-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email Address"
                className="pl-10 bg-muted rounded-none"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="pl-10 pr-10 bg-muted rounded-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Checkbox className="bg-muted" id="remember" />
              <Label htmlFor="remember" className="cursor-pointer">
                Remember me
              </Label>
            </div>

            <Link
              href="/forgot-password"
              className="text-secondary hover:underline"
            >
              Forget Password?
            </Link>
          </div>

          {/* Button */}
          <Button
            className="w-full rounded-sm text-text"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          {/* Signup & Customer Portal Link */}
          <div className="flex flex-col items-center gap-2 mt-2">
            <p className="text-center text-sm text-foreground">
              Don’t have an account ?{" "}
              <span className="p-2 text-secondary font-medium cursor-pointer hover:underline">
                Contact Admin
              </span>
            </p>
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-secondary hover:underline transition-colors mt-4"
            >
              Customer? Login here
            </Link>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
