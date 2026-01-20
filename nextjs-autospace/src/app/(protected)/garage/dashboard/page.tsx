"use client";

import { useEffect, useState } from "react";
import { getMyGarages } from "@/services/garage.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

interface Garage {
  id: number;
  name: string;
  description: string;
  location: string;
  verificationStatus: string;
}

export default function GarageDashboardPage() {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMyGarages();
        setGarages(data || []);
      } catch (error) {
        console.error("Failed to fetch garages", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Garages</h1>
        <Button onClick={() => router.push("/garage/create")}>
          <Plus className="mr-2 h-4 w-4" /> Add Garage
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {garages.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed">
            <h3 className="text-lg font-medium text-gray-900">
              No garages found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first garage.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/garage/create")}
            >
              Create Garage
            </Button>
          </div>
        ) : (
          garages.map((garage) => (
            <Card key={garage.id}>
              <CardHeader>
                <CardTitle>{garage.name}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {garage.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {garage.description}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      garage.verificationStatus === "approved"
                        ? "bg-green-100 text-green-800"
                        : garage.verificationStatus === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {garage.verificationStatus || "Pending"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/garage/${garage.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
