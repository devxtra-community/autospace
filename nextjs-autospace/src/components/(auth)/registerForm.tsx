import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { Mail, Phone, User, Lock } from "lucide-react";

export default function RegisterLayout() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        {/* LEFT SIDE */}
        <div className="hidden md:flex flex-col items-center text-center">
          <Card className="p-6 rounded-2xl">
            <img
              src="/valet-illustration.png"
              alt="Park Your Car"
              className="w-72"
            />
          </Card>

          <h2 className="mt-6 text-xl font-semibold text-foreground">
            Park Your Car
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            Track your vehicle in real-time with our valet service and enjoy
            hassle-free parking.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <Card className="w-full max-w-md mx-auto rounded-2xl">
          <CardContent className="p-8">
            <h1 className="text-2xl font-semibold text-center">Sign Up</h1>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Please provide details below to create an account.
            </p>

            <div className="mt-6 space-y-4">
              {/* Full Name */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Full Name" />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  type="email"
                  placeholder="Email Address"
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" type="tel" placeholder="Phone Number" />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  type="password"
                  placeholder="Password"
                />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  type="password"
                  placeholder="Confirm Password"
                />
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Checkbox id="terms" />
                <label htmlFor="terms" className="leading-snug">
                  I agree with{" "}
                  <span className="text-primary cursor-pointer">
                    Terms & Conditions
                  </span>{" "}
                  and{" "}
                  <span className="text-primary cursor-pointer">
                    Privacy Policy
                  </span>{" "}
                  of Auto Space
                </label>
              </div>

              {/* Button */}
              <Button className="w-full ">Create Account</Button>

              {/* Footer */}
              <p className="text-sm text-center text-muted-foreground">
                Have an account?{" "}
                <span className="text-secondary font-medium cursor-pointer">
                  Sign In
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
