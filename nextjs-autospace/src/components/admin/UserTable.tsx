"use client";

import { MoreHorizontal, User } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type UserRole = "Admin" | "Owner" | "Manager" | "Customer" | "Valet";
export type UserStatus = "Active" | "Suspended" | "Pending";

export interface UserData {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  dateJoined: string;
  avatar?: string;
}

const mockUsers: UserData[] = [
  {
    id: "1",
    userId: "#U10231",
    name: "Alex Thompson",
    email: "alex.t@example.com",
    role: "Owner",
    status: "Active",
    dateJoined: "Jan 12, 2026",
  },
  {
    id: "2",
    userId: "#U10232",
    name: "Sarah Miller",
    email: "sarah.m@example.com",
    role: "Manager",
    status: "Active",
    dateJoined: "Jan 15, 2026",
  },
  {
    id: "3",
    userId: "#U10233",
    name: "John Davis",
    email: "john.d@example.com",
    role: "Valet",
    status: "Pending",
    dateJoined: "Jan 18, 2026",
  },
  {
    id: "4",
    userId: "#U10234",
    name: "Elena Rodriguez",
    email: "elena.r@example.com",
    role: "Customer",
    status: "Active",
    dateJoined: "Jan 20, 2026",
  },
  {
    id: "5",
    userId: "#U10235",
    name: "Marcus Chen",
    email: "marcus.c@example.com",
    role: "Admin",
    status: "Suspended",
    dateJoined: "Jan 22, 2026",
  },
];

const roleStyles: Record<UserRole, string> = {
  Admin: "bg-purple-100 text-purple-700 hover:bg-purple-100/80 border-none",
  Owner: "bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-none",
  Manager: "bg-orange-100 text-orange-700 hover:bg-orange-100/80 border-none",
  Customer:
    "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 border-none",
  Valet: "bg-pink-100 text-pink-700 hover:bg-pink-100/80 border-none",
};

const statusStyles: Record<UserStatus, string> = {
  Active: "bg-[#E7F7EF] text-[#0D9488]",
  Suspended: "bg-[#FEE2E2] text-[#EF4444]",
  Pending: "bg-[#FEF3C7] text-[#D97706]",
};

interface UserTableProps {
  onSelectUser: (user: UserData) => void;
  selectedUserId?: string;
}

export function UserTable({ onSelectUser, selectedUserId }: UserTableProps) {
  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-black/5">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/5">
              <th className="px-6 py-5">
                <Checkbox />
              </th>
              <th className="px-4 py-5 font-semibold text-gray-500 text-[13px] uppercase tracking-wider">
                User ID
              </th>
              <th className="px-4 py-5 font-semibold text-gray-500 text-[13px] uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-5 font-semibold text-gray-500 text-[13px] uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-5 font-semibold text-gray-500 text-[13px] uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-5 font-semibold text-gray-500 text-[13px] uppercase tracking-wider">
                Date Joined
              </th>
              <th className="px-6 py-5 text-right font-semibold text-gray-500 text-[13px] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {mockUsers.map((user) => (
              <tr
                key={user.id}
                onClick={() => onSelectUser(user)}
                className={cn(
                  "hover:bg-[#FFFAE8]/50 cursor-pointer transition-colors duration-200 group",
                  selectedUserId === user.id && "bg-[#FFFAE8]",
                )}
              >
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <Checkbox />
                </td>
                <td className="px-4 py-4 font-mono text-sm text-gray-500">
                  {user.userId}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-black/5">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={20} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 text-sm">
                        {user.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge
                    className={cn(
                      "rounded-lg px-2.5 py-0.5 text-[11px] font-bold tracking-tight shadow-none",
                      roleStyles[user.role],
                    )}
                  >
                    {user.role}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  <div
                    className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
                      statusStyles[user.status],
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-2" />
                    {user.status}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {user.dateJoined}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-black/5 rounded-lg transition-colors text-gray-400 group-hover:text-gray-900">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
