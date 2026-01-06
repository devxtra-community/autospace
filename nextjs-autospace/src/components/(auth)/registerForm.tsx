"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { Mail, Phone, User, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function RegisterLayout() {
  const [showPassword, setShowPassword] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        {/* LEFT SIDE */}
        <div className="hidden md:flex flex-col items-center text-center">
          {/* <Card className="p-6 rounded"> */}
          <img
            src="/valet-illustration.png"
            alt="Park Your Car"
            // width={420}
            // height={320}
            className="
                 w-[380px]  h-auto
                 min-[1440px]:w-[450px]
                 min-[1440px]:h-[350px] "
          />
          {/* </Card> */}

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
            <p className="text-sm text-muted-foreground text-center ">
              Please provide details below to create an account.
            </p>

            <div className="mt-6 space-y-8">
              {/* Full Name */}
              <div className="relative bg-muted">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 py-5 bg-muted rounded-none"
                  placeholder="Full Name"
                />
              </div>

              {/* Email */}
              <div className="relative bg-muted">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 py-5 bg-muted rounded-none"
                  type="email"
                  placeholder="Email Address"
                />
              </div>

              {/* Phone */}
              <div className="relative bg-muted ">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 py-5 bg-muted rounded-none"
                  type="tel"
                  placeholder="Phone Number"
                />
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="pl-10 pr-10 bg-muted rounded-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="relative  ">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={confirm ? "text" : "password"}
                  className="pl-9 py-5 bg-muted rounded-none"
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  onClick={() => setConfirm(!confirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {confirm ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Checkbox id="terms" className="bg-muted" />
                <label htmlFor="terms" className="leading-snug text-center">
                  I agree with{" "}
                  <span className="text-secondary font-bold cursor-pointer">
                    Terms & Conditions
                  </span>{" "}
                  and{" "}
                  <span className="text-secondary font-bold cursor-pointer">
                    Privacy Policy
                  </span>{" "}
                  of Autospace
                </label>
              </div>

              {/* Button */}
              <Button className="w-full text-text ">Create Account</Button>

              {/* Footer */}
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
