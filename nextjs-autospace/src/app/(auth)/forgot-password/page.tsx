"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate API call
    try {
      const res = await apiClient.post("/api/auth/forget-password", { email });
      setEmail("");
      setSuccess(true);
      toast.success(res.data.message || "Reset link sent");
    } catch {
      toast.error("Network error");
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
            <h1 className="text-3xl font-semibold">Forgot Password</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Enter your registered email address and we will send you a link to
              reset your password.
            </p>
          </div>

          {success ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-md text-sm text-center border border-green-200">
              Reset link sent. Please check your email.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    className="pl-10 h-11 border bg-white rounded-md"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-md text-text h-11 transition-colors hover:brightness-95"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}

          <div className="text-center text-sm">
            <Link
              href="/login"
              className="text-secondary hover:underline font-medium transition-all"
            >
              Remember your password? Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
