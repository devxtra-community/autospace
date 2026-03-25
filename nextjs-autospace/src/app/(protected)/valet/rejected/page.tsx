"use client";

import { Card, CardContent } from "@/components/ui/card";
import { XCircle } from "lucide-react";

export default function Rejected() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-sm rounded-3xl shadow-lg">
        <CardContent className="p-6 text-center space-y-4">
          <XCircle className="mx-auto text-red-500 w-10 h-10" />

          <h2 className="text-lg font-semibold">Account Rejected</h2>

          <p className="text-sm text-muted-foreground">
            Your valet account was rejected. Please contact your manager.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
