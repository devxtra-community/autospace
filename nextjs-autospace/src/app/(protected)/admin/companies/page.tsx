"use client";

import { useEffect, useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getPendingCompanies,
  approveCompany,
  rejectCompany,
  getCompanyAdmin,
} from "@/services/admin.service";
import { Loader2, Building2 } from "lucide-react";

import { DashboardHeader } from "@/components/admin/DashboardHeader";
import { StatusMessage } from "@/components/admin/StatusMessage";
import { CompanyCard } from "@/components/admin/CompanyCard";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { RejectModal } from "@/components/admin/RejectModal";
import { ComponentType, SVGProps } from "react";

type EmptyStateProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
};

interface Company {
  id: number;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  businessLocation: string;
  createdAt: string;
}

type EntityId = number | string;

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const [confirmData, setConfirmData] = useState<{
    id: EntityId;
    type: "company";
    action: "approve";
  } | null>(null);

  const [rejectData, setRejectData] = useState<{
    id: EntityId;
    type: "company";
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getPendingCompanies();
      setCompanies(res.data || []);
      const response = await getCompanyAdmin();
      setAllCompanies(response.data || []);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    const { id } = confirmData;

    try {
      await approveCompany(id as number);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      setMessage({ text: "Company approved successfully", type: "success" });
    } catch {
      setMessage({ text: `Failed to approve company`, type: "error" });
    } finally {
      setConfirmData(null);
    }
  };

  const executeReject = async () => {
    if (!rejectData) return;
    const { id } = rejectData;

    try {
      await rejectCompany(id as number);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      setMessage({ text: "Company rejected", type: "success" });
    } catch {
      setMessage({ text: `Failed to reject company`, type: "error" });
    } finally {
      setRejectData(null);
      setRejectionReason("");
    }
  };

  const filteredCompanies = useMemo(
    () =>
      companies.filter(
        (c) =>
          c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [companies, searchTerm],
  );

  const filteredActiveCompanies = useMemo(
    () =>
      allCompanies.filter(
        (c) =>
          (c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())) &&
          !companies.some((pc) => pc.id === c.id),
      ),
    [allCompanies, companies, searchTerm],
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
      <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 font-sans text-foreground">
      <div className="mx-auto max-w-7xl space-y-8">
        <DashboardHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <StatusMessage message={message} onClear={() => setMessage(null)} />

        <Tabs defaultValue="pending" className="w-full space-y-6">
          <TabsList className="bg-card p-1 rounded-xl border border-border shadow-sm w-full md:w-auto inline-flex h-auto">
            <TabsTrigger
              value="pending"
              className="rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-sm"
            >
              Pending Companies ({companies.length})
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-sm"
            >
              Active Companies ({filteredActiveCompanies.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 outline-none">
            {filteredCompanies.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No pending companies"
                description="There are no pending company requests matching your criteria."
              />
            ) : (
              <div className="grid gap-4">
                {filteredCompanies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    isExpanded={expandedItems.has(`c-${company.id}`)}
                    onToggleExpand={toggleExpand}
                    onReject={(id) => setRejectData({ id, type: "company" })}
                    onApprove={(id) =>
                      setConfirmData({ id, type: "company", action: "approve" })
                    }
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4 outline-none">
            {filteredActiveCompanies.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No active companies"
                description="There are no active companies matching your criteria."
              />
            ) : (
              <div className="grid gap-4">
                {filteredActiveCompanies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    isExpanded={expandedItems.has(`c-${company.id}`)}
                    onToggleExpand={toggleExpand}
                    onReject={(id) => setRejectData({ id, type: "company" })}
                    onApprove={(id) =>
                      setConfirmData({ id, type: "company", action: "approve" })
                    }
                    formatDate={formatDate}
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {confirmData && (
        <ConfirmModal
          type={confirmData.type}
          onCancel={() => setConfirmData(null)}
          onConfirm={executeApprove}
        />
      )}

      {rejectData && (
        <RejectModal
          type={rejectData.type}
          rejectionReason={rejectionReason}
          onReasonChange={setRejectionReason}
          onCancel={() => {
            setRejectData(null);
            setRejectionReason("");
          }}
          onConfirm={executeReject}
        />
      )}
    </div>
  );
}

const EmptyState = ({ icon: Icon, title, description }: EmptyStateProps) => (
  <div className="text-center py-20 bg-card rounded-3xl border border-border shadow-sm">
    <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="h-8 w-8 text-muted-foreground/40" />
    </div>
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);
