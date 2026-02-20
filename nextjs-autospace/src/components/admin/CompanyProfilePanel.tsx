"use client";

import {
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  Warehouse,
  User,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { approveCompany, rejectCompany } from "@/services/admin.service";

import { CompanyData } from "./CompanyTable";

interface Props {
  company: CompanyData | null;
  onClose: () => void;
}

/* STATUS COLORS */
const statusStyles: Record<string, string> = {
  active: "bg-[#E7F7EF] text-[#0D9488]",
  pending: "bg-[#FEF3C7] text-[#D97706]",
  rejected: "bg-[#FEE2E2] text-[#EF4444]",
};

export function CompanyProfilePanel({ company, onClose }: Props) {
  if (!company) return null;

  const handleApprove = async () => {
    await approveCompany(company.companyId);
  };

  const handleReject = async () => {
    await rejectCompany(company.companyId);
  };

  return (
    <aside className="fixed top-4 right-4 w-[420px] h-[calc(100vh-2rem)] bg-card border border-border rounded-3xl shadow-xl flex flex-col z-50">
      {/* HEADER */}
      <div className="flex justify-between items-center p-6 border-b border-border">
        <h2 className="font-bold text-lg">Company Profile</h2>

        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
          <X size={18} />
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* ICON */}
        <div className="flex flex-col items-center">
          <Building2 size={40} />

          <h3 className="font-bold text-lg mt-2">{company.companyName}</h3>

          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold capitalize",
              statusStyles[company.status],
            )}
          >
            {company.status}
          </span>
        </div>

        {/* DETAILS */}
        <DetailItem
          icon={<User size={16} />}
          label="Owner"
          value={company.ownerName}
        />

        <DetailItem
          icon={<Mail size={16} />}
          label="Email"
          value={company.contactEmail}
        />

        <DetailItem
          icon={<Phone size={16} />}
          label="Phone"
          value={company.contactPhone}
        />

        <DetailItem
          icon={<MapPin size={16} />}
          label="Location"
          value={company.businessLocation}
        />

        <DetailItem
          icon={<Warehouse size={16} />}
          label="Garages"
          value={String(company.garagesCount)}
        />

        <DetailItem
          icon={<Calendar size={16} />}
          label="Created"
          value={new Date(company.createdAt).toLocaleDateString()}
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className="p-6 border-t border-border space-y-3">
        {/* PENDING → approve + reject */}
        {company.status === "pending" && (
          <>
            <Button
              onClick={handleApprove}
              className="w-full bg-primary text-black"
            >
              Approve Company
            </Button>

            <Button
              onClick={handleReject}
              variant="destructive"
              className="w-full"
            >
              Reject Company
            </Button>
          </>
        )}

        {/* ACTIVE → reject only */}
        {company.status === "active" && (
          <Button
            onClick={handleReject}
            variant="destructive"
            className="w-full"
          >
            Reject Company
          </Button>
        )}

        {/* REJECTED → approve only */}
        {company.status === "rejected" && (
          <Button
            onClick={handleApprove}
            className="w-full bg-primary text-black"
          >
            Approve Company
          </Button>
        )}
      </div>
    </aside>
  );
}

/* DETAIL ITEM TYPE SAFE */
interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="flex gap-3 items-center">
      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
        {icon}
      </div>

      <div>
        <div className="text-xs text-muted-foreground uppercase">{label}</div>

        <div className="font-semibold">{value || "-"}</div>
      </div>
    </div>
  );
}
