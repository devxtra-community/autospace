"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Eye, EyeOff } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  // const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!token) {
      setError("Invalid reset link");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await apiClient.post("/api/auth/reset-password", {
        token,
        password,
      });

      setSuccess(true);
      toast.success(res.data.message || "Password reset successful");

      // if (success) {
      //     setTimeout(() => {
      //         router.push("/login");
      //     }, 3000);
      // }
    } catch {
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 relative py-12">
      <BackButton />

      <Card className="w-full max-w-[420px] shadow-sm border border-border">
        <CardContent className="flex flex-col gap-6 sm:gap-8 p-6 sm:p-10">
          <div className="space-y-2 text-center px-2">
            <h1 className="text-3xl font-semibold">Reset Your Password</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Create a new secure password for your account.
            </p>
          </div>

          {success ? (
            <div className="flex flex-col gap-4 items-center">
              <div className="bg-green-50 text-green-700 p-4 rounded-md text-sm text-center border border-green-200">
                Password updated successfully.
              </div>

              <Link href="/login">
                <Button className="w-full">Go to Login</Button>
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-6 sm:gap-8"
            >
              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    className="pl-10 pr-10 border bg-white rounded-md h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="pl-10 pr-10 border bg-white rounded-md h-11"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full rounded-md text-text h-11 transition-colors hover:brightness-95"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          {/* <div className="text-center text-sm">
                        <Link href="/login" className="text-secondary hover:underline font-medium transition-all">
                            Back to Login
                        </Link>
                    </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
