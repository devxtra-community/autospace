"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StatusCard({
  status = "Available",
}: {
  status?: string;
}) {
  return (
    <div className="px-4 mb-4">
      <Card className="rounded-2xl border-none shadow-sm bg-primary text-black">
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm opacity-80">Current Status</p>

            <p className="font-semibold text-lg">{status}</p>
          </div>

          <Badge className="bg-black text-primary">ACTIVE</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
