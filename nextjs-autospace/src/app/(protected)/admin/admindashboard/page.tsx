"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getPendingCompanies,
  approveCompany,
  rejectCompany,
  getPendingGarages,
  approveGarage,
  rejectGarage,
} from "@/services/admin.service";
import {
  Loader2,
  Check,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Building2,
  Warehouse,
  Calendar,
  MapPin,
  Mail,
  Phone,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";

// --- Types ---

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

// --- Components ---

const StatCard = ({
  title,
  value,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  colorClass: string;
}) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 transition-all hover:shadow-md">
    <div className={`p-3 rounded-xl ${colorClass}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

// --- Main Page ---

export default function AdminPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);

  // UX State
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Modals
  const [confirmData, setConfirmData] = useState<{
    id: number;
    type: "company" | "garage";
    action: "approve";
  } | null>(null);

  const [rejectData, setRejectData] = useState<{
    id: number;
    type: "company" | "garage";
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

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

  // --- Handlers ---

  const toggleExpand = (uniqueId: string) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(uniqueId)) {
      newSet.delete(uniqueId);
    } else {
      newSet.add(uniqueId);
    }
    setExpandedItems(newSet);
  };

  const executeApprove = async () => {
    if (!confirmData) return;
    const { id, type } = confirmData;

    try {
      if (type === "company") {
        await approveCompany(id);
        setCompanies((prev) => prev.filter((c) => c.id !== id));
        setMessage({ text: "Company approved successfully", type: "success" });
      } else {
        await approveGarage(id);
        setGarages((prev) => prev.filter((g) => g.id !== id));
        setMessage({ text: "Garage approved successfully", type: "success" });
      }
    } catch {
      setMessage({ text: `Failed to approve ${type}`, type: "error" });
    } finally {
      setConfirmData(null);
    }
  };

  const executeReject = async () => {
    if (!rejectData) return;
    const { id, type } = rejectData;

    try {
      // NOTE: The backend API currently doesn't accept a reason, but we collect it for UX/future use.
      console.log(`Rejecting ${type} ${id} for reason: ${rejectionReason}`);

      if (type === "company") {
        await rejectCompany(id);
        setCompanies((prev) => prev.filter((c) => c.id !== id));
        setMessage({ text: "Company rejected", type: "success" });
      } else {
        await rejectGarage(id);
        setGarages((prev) => prev.filter((g) => g.id !== id));
        setMessage({ text: "Garage rejected", type: "success" });
      }
    } catch {
      setMessage({ text: `Failed to reject ${type}`, type: "error" });
    } finally {
      setRejectData(null);
      setRejectionReason("");
    }
  };

  // --- Filtering ---

  const filteredCompanies = companies.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredGarages = garages.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Admin <span className="text-yellow-500">Overview</span>
            </h1>
            <p className="mt-2 text-lg text-slate-500">
              Manage incoming registrations and approvals.
            </p>
          </div>

          {/* Global Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search companies or garages..."
              className="pl-10 h-10 bg-white border-slate-200 focus:ring-yellow-500 focus:border-yellow-500 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pending Companies"
            value={companies.length}
            icon={Building2}
            colorClass="bg-indigo-500"
          />
          <StatCard
            title="Pending Garages"
            value={garages.length}
            icon={Warehouse}
            colorClass="bg-orange-500"
          />
          <StatCard
            title="Today's Requests"
            value={companies.length + garages.length} // Simplified logic for demo
            icon={Calendar}
            colorClass="bg-yellow-500"
          />
          <StatCard
            title="Total Actionable"
            value={companies.length + garages.length}
            icon={AlertTriangle}
            colorClass="bg-pink-500"
          />
        </div>

        {/* Feedback Message */}
        {message && (
          <div
            className={`flex items-center p-4 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2 ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 mr-2" />
            )}
            {message.text}
            <button
              onClick={() => setMessage(null)}
              className="ml-auto hover:opacity-75"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="companies" className="w-full space-y-6">
          <TabsList className="bg-white p-1 rounded-xl border border-slate-100 shadow-sm w-full md:w-auto inline-flex h-auto">
            <TabsTrigger
              value="companies"
              className="rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-yellow-400 data-[state=active]:text-yellow-950 data-[state=active]:shadow-sm"
            >
              Pending Companies ({companies.length})
            </TabsTrigger>
            <TabsTrigger
              value="garages"
              className="rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-yellow-400 data-[state=active]:text-yellow-950 data-[state=active]:shadow-sm"
            >
              Pending Garages ({garages.length})
            </TabsTrigger>
          </TabsList>

          {/* Companies List */}
          <TabsContent value="companies" className="space-y-4 outline-none">
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  No companies found
                </h3>
                <p className="text-slate-500">
                  There are no pending company requests matching your criteria.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredCompanies.map((company) => {
                  const isExpanded = expandedItems.has(`c-${company.id}`);
                  return (
                    <Card
                      key={company.id}
                      className="border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden rounded-2xl"
                    >
                      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 text-yellow-600 font-bold text-lg">
                            {company.companyName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">
                              {company.companyName}
                            </h3>
                            <div className="flex items-center text-sm text-slate-500 mt-1 gap-3">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />{" "}
                                {company.contactEmail}
                              </span>
                              <span className="hidden md:inline text-slate-300">
                                |
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />{" "}
                                {company.businessLocation}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-slate-900"
                            onClick={() => toggleExpand(`c-${company.id}`)}
                          >
                            {isExpanded ? "Hide Details" : "View Details"}
                            {isExpanded ? (
                              <ChevronUp className="ml-2 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-2 h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            className="bg-white border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 shadow-sm border"
                            onClick={() =>
                              setRejectData({ id: company.id, type: "company" })
                            }
                          >
                            Reject
                          </Button>
                          <Button
                            className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500 shadow-sm font-medium"
                            onClick={() =>
                              setConfirmData({
                                id: company.id,
                                type: "company",
                                action: "approve",
                              })
                            }
                          >
                            Approve
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2">
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-slate-500 mb-1">
                                Contact Phone
                              </p>
                              <p className="font-medium text-slate-800 flex items-center gap-2">
                                <Phone className="h-3 w-3" />{" "}
                                {company.contactPhone}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 mb-1">
                                Registration Date
                              </p>
                              <p className="font-medium text-slate-800">
                                {formatDate(company.createdAt)}
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-slate-500 mb-1">
                                Full Location Address
                              </p>
                              <p className="font-medium text-slate-800">
                                {company.businessLocation}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Garages List */}
          <TabsContent value="garages" className="space-y-4 outline-none">
            {filteredGarages.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Warehouse className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  No garages found
                </h3>
                <p className="text-slate-500">
                  There are no pending garage requests matching your criteria.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredGarages.map((garage) => {
                  const isExpanded = expandedItems.has(`g-${garage.id}`);
                  return (
                    <Card
                      key={garage.id}
                      className="border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden rounded-2xl"
                    >
                      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600 font-bold text-lg">
                            {garage.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">
                              {garage.name}
                            </h3>
                            <div className="flex items-center text-sm text-slate-500 mt-1 gap-3">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {garage.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-slate-900"
                            onClick={() => toggleExpand(`g-${garage.id}`)}
                          >
                            {isExpanded ? "Hide Details" : "View Details"}
                            {isExpanded ? (
                              <ChevronUp className="ml-2 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-2 h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            className="bg-white border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 shadow-sm border"
                            onClick={() =>
                              setRejectData({ id: garage.id, type: "garage" })
                            }
                          >
                            Reject
                          </Button>
                          <Button
                            className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500 shadow-sm font-medium"
                            onClick={() =>
                              setConfirmData({
                                id: garage.id,
                                type: "garage",
                                action: "approve",
                              })
                            }
                          >
                            Approve
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2">
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid md:grid-cols-2 gap-4 text-sm">
                            <div className="md:col-span-2">
                              <p className="text-slate-500 mb-1">Description</p>
                              <p className="font-medium text-slate-800">
                                {garage.description ||
                                  "No description provided."}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 mb-1">
                                Request Date
                              </p>
                              <p className="font-medium text-slate-800">
                                {formatDate(garage.createdAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 mb-1">
                                Location Details
                              </p>
                              <p className="font-medium text-slate-800">
                                {garage.location}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* --- Modals / Dialogs --- */}

      {/* Confirmation Modal */}
      {confirmData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 transform scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Confirm Approval
            </h3>
            <p className="text-slate-500 mb-6">
              Are you sure you want to approve this <b>{confirmData.type}</b>?
              This action will grant them access to the platform.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setConfirmData(null)}>
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={executeApprove}
              >
                Confirm Approve
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 transform scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Reject Request
            </h3>
            <p className="text-slate-500 mb-4">
              Please provide a reason for rejecting this{" "}
              <b>{rejectData.type}</b>.
            </p>
            <textarea
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-sm min-h-[100px]"
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setRejectData(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={executeReject}
                disabled={!rejectionReason.trim()}
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
