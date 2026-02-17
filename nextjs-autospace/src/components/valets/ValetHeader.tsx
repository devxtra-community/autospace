"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from "lucide-react";

export default function ValetHeader() {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-black font-bold">
            V
          </AvatarFallback>
        </Avatar>

        <div>
          <p className="font-semibold leading-none">Valet</p>
          <p className="text-xs text-muted-foreground">Ready for requests</p>
        </div>
      </div>

      <Bell className="text-muted-foreground" />
    </div>
  );
}
