"use client";

import { useEffect, useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getPendingGarages,
  getGarageAdmin,
  approveGarage,
  rejectGarage,
} from "@/services/admin.service";
import { Loader2, Warehouse } from "lucide-react";

// Extracted Components
import { DashboardHeader } from "@/components/admin/DashboardHeader";
import { StatusMessage } from "@/components/admin/StatusMessage";
import { GarageCard } from "@/components/admin/GarageCard";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { RejectModal } from "@/components/admin/RejectModal";

import { ComponentType, SVGProps } from "react";

type EmptyStateProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
};

// --- Types ---

interface Garage {
  id: string;
  name: string;
  locationName: string;
  capacity: number;
  garageRegistrationNumber: string;
  status: string;
  valetAvailable: boolean;
  createdAt: string;
  companyId: string;
  managerId: string | null;
  latitude: string;
  longitude: string;
}

type EntityId = number | string;

export default function AdminGaragesPage() {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [garagesAll, setGaragesAll] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const [confirmData, setConfirmData] = useState<{
    id: EntityId;
    type: "garage";
    action: "approve";
  } | null>(null);

  const [rejectData, setRejectData] = useState<{
    id: EntityId;
    type: "garage";
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getPendingGarages();
      setGarages(res.data || []);
      const response = await getGarageAdmin();
      setGaragesAll(response.data || []);
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
      await approveGarage(id as string);
      await fetchData();
      // setGarages((prev) => prev.filter((g) => g.id !== id));
      setMessage({ text: "Garage approved successfully", type: "success" });
    } catch {
      setMessage({ text: `Failed to approve garage`, type: "error" });
    } finally {
      setConfirmData(null);
    }
  };

  const executeReject = async () => {
    if (!rejectData) return;
    const { id } = rejectData;

    try {
      await rejectGarage(id as string);
      await fetchData();
      // setGarages((prev) => prev.filter((g) => g.id !== id));
      setMessage({ text: "Garage rejected", type: "success" });
    } catch {
      setMessage({ text: `Failed to reject garage`, type: "error" });
    } finally {
      setRejectData(null);
      setRejectionReason("");
    }
  };

  const filteredGarages = useMemo(
    () =>
      garages.filter(
        (g) =>
          g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          g.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          g.garageRegistrationNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      ),
    [garages, searchTerm],
  );

  const filteredActiveGarages = useMemo(
    () =>
      garagesAll.filter(
        (g) =>
          (g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.garageRegistrationNumber
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) &&
          !garages.some((pg) => pg.id === g.id),
      ),
    [garagesAll, garages, searchTerm],
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
              Pending Garages ({garages.length})
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-sm"
            >
              Active Garages ({filteredActiveGarages.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 outline-none">
            {filteredGarages.length === 0 ? (
              <EmptyState
                icon={Warehouse}
                title="No pending garages"
                description="There are no pending garage requests matching your criteria."
              />
            ) : (
              <div className="grid gap-4">
                {filteredGarages.map((garage) => (
                  <GarageCard
                    key={garage.id}
                    garage={garage}
                    isExpanded={expandedItems.has(`g-${garage.id}`)}
                    onToggleExpand={toggleExpand}
                    onReject={(id) => setRejectData({ id, type: "garage" })}
                    onApprove={(id) =>
                      setConfirmData({ id, type: "garage", action: "approve" })
                    }
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4 outline-none">
            {filteredActiveGarages.length === 0 ? (
              <EmptyState
                icon={Warehouse}
                title="No active garages"
                description="There are no active garages matching your criteria."
              />
            ) : (
              <div className="grid gap-4">
                {filteredActiveGarages.map((garage) => (
                  <GarageCard
                    key={garage.id}
                    garage={garage}
                    isExpanded={expandedItems.has(`g-${garage.id}`)}
                    onToggleExpand={toggleExpand}
                    onReject={(id) => setRejectData({ id, type: "garage" })}
                    onApprove={(id) =>
                      setConfirmData({ id, type: "garage", action: "approve" })
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
