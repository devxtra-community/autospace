"use client";

import {
  X,
  User,
  Phone,
  Mail,
  Building2,
  MapPin,
  Warehouse,
  Users,
  Calendar,
  ShoppingBag,
  ShieldAlert,
  Briefcase,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserData } from "./UserTable";

interface UserProfilePanelProps {
  user: UserData | null;
  onClose: () => void;
}

const roleStyles: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700 hover:bg-purple-100/80 border-none",
  OWNER: "bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-none",
  MANAGER: "bg-orange-100 text-orange-700 hover:bg-orange-100/80 border-none",
  CUSTOMER:
    "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 border-none",
  VALET: "bg-pink-100 text-pink-700 hover:bg-pink-100/80 border-none",
  admin: "bg-purple-100 text-purple-700 hover:bg-purple-100/80 border-none",
  owner: "bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-none",
  manager: "bg-orange-100 text-orange-700 hover:bg-orange-100/80 border-none",
  customer:
    "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 border-none",
  valet: "bg-pink-100 text-pink-700 hover:bg-pink-100/80 border-none",
};

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-[#E7F7EF] text-[#0D9488]",
  SUSPENDED: "bg-[#FEE2E2] text-[#EF4444]",
  PENDING: "bg-[#FEF3C7] text-[#D97706]",
  active: "bg-[#E7F7EF] text-[#0D9488]",
  suspended: "bg-[#FEE2E2] text-[#EF4444]",
  pending: "bg-[#FEF3C7] text-[#D97706]",
};

export function UserProfilePanel({ user, onClose }: UserProfilePanelProps) {
  if (!user) return null;

  console.log("user", user);

  return (
    <aside className="fixed top-4 right-4 h-[calc(100vh-2rem)] w-96 bg-white rounded-3xl shadow-2xl border border-black/5 z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-black/5">
        <h3 className="font-bold text-lg text-gray-900">User Profile</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-400"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {/* User Basic Info */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-[#FFFAE8] shadow-sm mb-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullname}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={48} className="text-gray-300" />
            )}
          </div>
          <h4 className="text-xl font-bold text-gray-900">{user.fullname}</h4>
          <p className="text-gray-500 text-sm mb-4">{user.email}</p>

          <div className="flex gap-2">
            <Badge
              className={cn(
                "rounded-lg px-3 py-1 text-[11px] font-bold tracking-tight shadow-none",
                roleStyles[user.role],
              )}
            >
              {user.role}
            </Badge>
            <div
              className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
                statusStyles[user.status],
              )}
            >
              {user.status}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
              <Mail size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                Email Address
              </span>
              <span className="text-gray-900 font-medium">{user.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
              <Phone size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                Phone Number
              </span>
              <span className="text-gray-900 font-medium">{user.phone}</span>
            </div>
          </div>
        </div>

        {/* Role Specific Details */}
        <div className="pt-6 border-t border-black/5 space-y-6">
          <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
            Specific Details
          </h5>

          {user.role?.toLowerCase() === "owner" && (
            <div className="space-y-4">
              <DetailItem
                icon={<Building2 size={16} />}
                label="Company Name"
                value="Autospace Solutions Inc."
              />
              <DetailItem
                icon={<ShieldAlert size={16} />}
                label="Company Status"
                value="Verified"
              />
              <DetailItem
                icon={<Warehouse size={16} />}
                label="Total Garages"
                value="12 Garages"
              />
            </div>
          )}

          {user.role?.toLowerCase() === "manager" && (
            <div className="space-y-4">
              <DetailItem
                icon={<Warehouse size={16} />}
                label="Assigned Garage"
                value="Downtown Central Parking"
              />
              <DetailItem
                icon={<MapPin size={16} />}
                label="Garage Location"
                value="New York, NY"
              />
              <DetailItem
                icon={<Users size={16} />}
                label="Active Valets"
                value="8 Valets"
              />
            </div>
          )}

          {user.role?.toLowerCase() === "customer" && (
            <div className="space-y-4">
              <DetailItem
                icon={<ShoppingBag size={16} />}
                label="Total Bookings"
                value="48 Bookings"
              />
              <DetailItem
                icon={<Calendar size={16} />}
                label="Last Booking"
                value="Jan 24, 2026"
              />
            </div>
          )}

          {user.role?.toLowerCase() === "valet" && (
            <div className="space-y-4">
              <DetailItem
                icon={<Briefcase size={16} />}
                label="Employment"
                value="Full-time"
              />
              <DetailItem
                icon={<Warehouse size={16} />}
                label="Assigned Garage"
                value="East Side Plaza"
              />
              <DetailItem
                icon={<Calendar size={16} />}
                label="Availability"
                value="On Shift"
              />
            </div>
          )}

          {user.role?.toLowerCase() === "admin" && (
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
              <p className="text-xs text-purple-600 font-medium text-center">
                This user has full administrative access to the platform
                settings and user management.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-black/5 space-y-3 bg-gray-50/50">
        <Button
          variant="destructive"
          className="w-full rounded-2xl h-12 font-bold shadow-lg shadow-rose-500/10"
        >
          Block User
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-2xl h-12 font-bold border-black/5 hover:bg-black/5"
        >
          Suspend User
        </Button>
        <button className="w-full py-2 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
          View Full Activity
        </button>
      </div>
    </aside>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#FFFAE8] flex items-center justify-center text-[#d97706]/70">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-400 uppercase font-extrabold tracking-widest">
          {label}
        </span>
        <span className="text-gray-900 font-semibold text-sm">{value}</span>
      </div>
    </div>
  );
}
