"use client";

import { useEffect, useState } from "react";
import { getMyCompany } from "@/services/company.service";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";

type Company = {
  companyName: string;
  businessLocation: string;
  contactEmail: string;
  contactPhone: string;
};

export function CompanyInfo() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await getMyCompany();
        setCompany(data);
      } catch (err) {
        console.error("Failed to load company info", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  if (loading) {
    return (
      <Card className="rounded-sm">
        <CardContent className="p-6">Loading company info...</CardContent>
      </Card>
    );
  }

  if (!company) {
    return (
      <Card className="rounded-sm">
        <CardContent className="p-6 text-muted-foreground">
          Company info not available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-sm">
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Company Info */}
        <div>
          <h3 className="text-lg font-semibold">{company.companyName}</h3>
          <div className="mt-5 space-y-4 text-sm text-muted-foreground">
            <p className="flex items-start gap-2 break-words">
              <MapPin size={20} className="mt-0.5 shrink-0" />
              <span>{company.businessLocation}</span>
            </p>
            <p className="flex items-start gap-2">
              <Phone size={20} className="shrink-0" />
              <span>{company.contactPhone}</span>
            </p>
            <p className="flex items-start gap-2 break-words">
              <Mail size={20} className="shrink-0" />
              <span>{company.contactEmail}</span>
            </p>
          </div>
        </div>

        {/* Garages (placeholder for now) */}
        <div className="bg-secondary text-black rounded-sm flex flex-col items-center justify-center min-h-[120px] py-4">
          <p className="text-sm">Garages</p>
          <p className="text-3xl font-bold">—</p>
        </div>

        {/* Employees (placeholder for now) */}
        <div className="bg-black text-white rounded-sm flex flex-col items-center justify-center min-h-[120px] py-4">
          <p className="text-sm">Employees</p>
          <p className="text-3xl font-bold">—</p>
        </div>
      </CardContent>
    </Card>
  );
}
