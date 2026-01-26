import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, User } from "lucide-react";

export function GarageInfo() {
  return (
    <Card className="rounded-xl mb-8">
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Garage Details */}
        <div>
          <h3 className="text-xl font-semibold">City Center Garage</h3>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <MapPin size={18} /> Downtown Street, Metro City
            </p>
            <p className="flex items-center gap-2">
              <Phone size={18} /> +91 98765 43210
            </p>
            <p className="flex items-center gap-2">
              <User size={18} /> Manager: Rahul
            </p>
          </div>
        </div>

        {/* Highlight Box */}
        <div className="bg-secondary text-black rounded-xl p-6 flex flex-col items-center justify-center">
          <p className="text-sm">Garage Status</p>
          <p className="text-2xl font-bold">Active</p>
        </div>

        <div className="bg-black text-white rounded-xl p-6 flex flex-col items-center justify-center">
          <p className="text-sm">Valets</p>
          <p className="text-2xl font-bold">6</p>
        </div>
      </CardContent>
    </Card>
  );
}
