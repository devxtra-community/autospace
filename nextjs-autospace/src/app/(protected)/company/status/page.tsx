"use client";

import { useState, useEffect } from "react";
import { getMyCompany } from "@/services/company.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Company {
  id: string;
  companyName: string;
  businessRegistrationNumber: string;
  contactEmail: string;
  contactPhone: string;
  businessLocation: string;
  status: "pending" | "active" | "rejected";
  createdAt: string;
  rejectionReason?: string;
}

export default function CompanyStatusPage() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const data = await getMyCompany();
      setCompany(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Garage creation failed");
      } else {
        setError("Garage creation failed");
      }
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: <Clock className="h-5 w-5" />,
          badge: (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Pending Review
            </Badge>
          ),
          title: "Company Under Review",
          description:
            "Your company registration is being reviewed by our team.",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
      case "active":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
          badge: (
            <Badge className="bg-green-100 text-green-800 border-green-300">
              Approved
            </Badge>
          ),
          title: "Company Approved",
          description:
            "Your company has been successfully approved and is now active.",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "rejected":
        return {
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          badge: (
            <Badge className="bg-red-100 text-red-800 border-red-300">
              Rejected
            </Badge>
          ),
          title: "Registration Rejected",
          description:
            "Unfortunately, your company registration was not approved.",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          badge: <Badge variant="outline">Unknown</Badge>,
          title: "Status Unknown",
          description: "Unable to determine company status.",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-white">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
            <span className="ml-3 text-gray-600">
              Loading company details...
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-white p-4">
        <Card className="w-full max-w-md shadow-lg border-red-200">
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Data
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchCompanyData} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-white p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Company Found
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't registered a company yet.
            </p>
            <Button
              onClick={() => router.push("/company/create")}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              Register Company
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(company.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30 p-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Status Card */}
        <Card
          className={`shadow-lg border-2 ${statusConfig.borderColor} ${statusConfig.bgColor}`}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {statusConfig.icon}
                <div>
                  <CardTitle className="text-2xl">
                    {statusConfig.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {statusConfig.description}
                  </CardDescription>
                </div>
              </div>
              {statusConfig.badge}
            </div>
          </CardHeader>

          {company.status === "pending" && (
            <CardContent>
              <div className="bg-white/80 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-gray-700">
                  <strong>What's next?</strong> Our admin team is currently
                  reviewing your registration. This typically takes 1-2 business
                  days. You'll receive an email notification once the review is
                  complete.
                </p>
              </div>
            </CardContent>
          )}

          {company.status === "rejected" && company.rejectionReason && (
            <CardContent>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Rejection Reason:
                </p>
                <p className="text-sm text-gray-700">
                  {company.rejectionReason}
                </p>
                <Button
                  onClick={() => router.push("/company/create")}
                  variant="outline"
                  className="mt-4"
                >
                  Register Again
                </Button>
              </div>
            </CardContent>
          )}

          {company.status === "active" && (
            <CardContent>
              <div className="bg-white/80 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-gray-700">
                  <strong>Congratulations!</strong> You can now access all
                  features and start managing your company.
                </p>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="mt-4 bg-yellow-500 hover:bg-yellow-600"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Company Details Card */}
        <Card className="shadow-lg border border-gray-200">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-white border-b">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-yellow-600" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Company Name
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {company.companyName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Badge className="mt-0.5 bg-yellow-100 text-yellow-800 border-yellow-300">
                  BRN
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Business Registration Number
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {company.businessRegistrationNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Contact Email
                  </p>
                  <p className="text-base text-gray-900">
                    {company.contactEmail}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Phone Number
                  </p>
                  <p className="text-base text-gray-900">
                    {company.contactPhone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Business Location
                  </p>
                  <p className="text-base text-gray-900">
                    {company.businessLocation}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Registered On
                  </p>
                  <p className="text-base text-gray-900">
                    {new Date(company.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={fetchCompanyData}
            variant="outline"
            className="border-gray-300"
          >
            Refresh Status
          </Button>
          {company.status === "active" && (
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              Go to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
