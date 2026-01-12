"use client";

import { useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";

import { loginUser } from "@/lib/auth.api";
import { LoginDto } from "@autospace/shared";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<"email" | "phone">("email");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload =
        loginType === "email"
          ? { email: identifier, password }
          : { phone: identifier, password };

      const res = await loginUser(payload as LoginDto);

      // store tokens
      localStorage.setItem("accessToken", res.data.accessToken);

      // temporary redirect
      window.location.href = "/";
    } catch (err: unknown) {
      let message = "Login failed";

      if (
        typeof err === "object" &&
        err !== null &&
        "error" in err &&
        typeof (err as { error?: { message?: string } }).error?.message ===
          "string"
      ) {
        message = (err as { error: { message: string } }).error.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6">
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-40 p-6 sm:p-10">
        {/* LEFT (DESKTOP ONLY) */}
        <div className="hidden md:flex flex-col items-center justify-center text-center gap-6">
          <Image
            src="/valet-illustration.png"
            alt="Park your car"
            width={420}
            height={320}
            priority
          />

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Park Your Car</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Track your vehicle in real-time with our valet service and enjoy
              hassle-free parking.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col justify-center gap-8 w-full max-w-md mx-auto">
          {/* Heading */}
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-3xl text-center font-semibold">Login</h1>
            <p className="text-sm text-center text-muted-foreground">
              Please enter your details below
            </p>
          </div>

          {/* Tabs */}
          <Tabs
            value={loginType}
            onValueChange={(value) => {
              setLoginType(value as "email" | "phone");
              setIdentifier("");
            }}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full bg-muted rounded-sm">
              <TabsTrigger value="email" className="rounded-sm">
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="rounded-sm">
                Phone
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Email / Phone Input */}
          <div className="space-y-2">
            <div className="relative">
              {loginType === "email" ? (
                <>
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    className="pl-10 bg-muted rounded-none"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    className="pl-10 bg-muted rounded-none"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </>
              )}
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

            <button className="text-secondary hover:underline">
              Forget Password?
            </button>
          </div>

          {/* Button */}
          <Button
            className="w-full rounded-sm text-text"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          {/* Signup */}
          <p className="text-center text-sm text-foreground">
            Don’t have an account ?{" "}
            <span className="p-2 text-secondary font-medium cursor-pointer hover:underline">
              Sign Up
            </span>
          </p>
        </div>
      </CardContent>
    </div>
  );
}
