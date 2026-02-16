"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function PendingApproval() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-sm rounded-3xl shadow-lg">
        <CardContent className="p-6 text-center space-y-4">
          <Clock className="mx-auto text-primary w-10 h-10" />

          <h2 className="text-lg font-semibold">Approval Pending</h2>

          <p className="text-sm text-muted-foreground">
            Your manager needs to approve your valet account before you can
            accept jobs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
