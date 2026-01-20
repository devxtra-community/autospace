"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getPendingCompanies,
  approveCompany,
  rejectCompany,
  getPendingGarages,
  approveGarage,
  rejectGarage,
} from "@/services/admin.service";
import { Loader2, Check, X } from "lucide-react";

interface Company {
  id: number;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  businessLocation: string;
  createdAt: string;
}

interface Garage {
  id: number;
  name: string;
  description: string;
  location: string;
  createdAt: string;
}

export default function AdminPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [companiesData, garagesData] = await Promise.all([
        getPendingCompanies(),
        getPendingGarages(),
      ]);
      setCompanies(companiesData.data || []);
      setGarages(garagesData.data || []);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveCompany = async (id: number) => {
    try {
      await approveCompany(id);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      setMessage({ text: "Company approved successfully", type: "success" });
    } catch {
      setMessage({ text: "Failed to approve company", type: "error" });
    }
  };

  const handleRejectCompany = async (id: number) => {
    try {
      await rejectCompany(id);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      setMessage({ text: "Company rejected", type: "success" });
    } catch {
      setMessage({ text: "Failed to reject company", type: "error" });
    }
  };

  const handleApproveGarage = async (id: number) => {
    try {
      await approveGarage(id);
      setGarages((prev) => prev.filter((g) => g.id !== id));
      setMessage({ text: "Garage approved successfully", type: "success" });
    } catch {
      setMessage({ text: "Failed to approve garage", type: "error" });
    }
  };

  const handleRejectGarage = async (id: number) => {
    try {
      await rejectGarage(id);
      setGarages((prev) => prev.filter((g) => g.id !== id));
      setMessage({ text: "Garage rejected", type: "success" });
    } catch {
      setMessage({ text: "Failed to reject garage", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <Tabs defaultValue="companies" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="companies">Pending Companies</TabsTrigger>
          <TabsTrigger value="garages">Pending Garages</TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>Company Requests</CardTitle>
              <CardDescription>
                Review and manage company registration requests.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {companies.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No pending company requests.
                </p>
              ) : (
                companies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card"
                  >
                    <div>
                      <h3 className="font-semibold">{company.companyName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {company.contactEmail} • {company.contactPhone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {company.businessLocation}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleApproveCompany(company.id)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRejectCompany(company.id)}
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="garages">
          <Card>
            <CardHeader>
              <CardTitle>Garage Requests</CardTitle>
              <CardDescription>
                Review and manage garage creation requests.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {garages.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No pending garage requests.
                </p>
              ) : (
                garages.map((garage) => (
                  <div
                    key={garage.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card"
                  >
                    <div>
                      <h3 className="font-semibold">{garage.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {garage.location}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {garage.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleApproveGarage(garage.id)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRejectGarage(garage.id)}
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
