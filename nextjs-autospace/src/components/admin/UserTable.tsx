"use client";

import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  User,
} from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";
import { getAllUsersService } from "@/services/admin.service";

export type UserRole = "Admin" | "Owner" | "Manager" | "Customer" | "Valet";
export type UserStatus = "Active" | "Suspended" | "Pending";

export interface UserData {
  userId: string;
  fullname: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  dateJoined: string;
  avatar?: string;
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
  INACTIVE: "bg-gray-100 text-gray-500",
  active: "bg-[#E7F7EF] text-[#0D9488]",
  suspended: "bg-[#FEE2E2] text-[#EF4444]",
  pending: "bg-[#FEF3C7] text-[#D97706]",
  inactive: "bg-gray-100 text-gray-500",
};

interface UserTableProps {
  onSelectUser: (user: UserData) => void;
  selectedUserId?: string;
}

export function UserTable({ onSelectUser, selectedUserId }: UserTableProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 10;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getAllUsersService({
        page,
        limit,
        search: searchQuery || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });

      if (res.success) {
        setUsers(res.data);
        setTotalPages(res.meta.totalPages);
        setTotal(res.meta.total);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      {/* SEARCH + FILTERS */}
      <div className="flex justify-end gap-3">
        <div className="relative w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-black/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 focus:border-[#FFD700] transition-all text-sm"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-white rounded-xl border border-black/5 shadow-sm text-sm"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
          <option value="manager">Manager</option>
          <option value="customer">Customer</option>
          <option value="valet">Valet</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-white rounded-xl border border-black/5 shadow-sm text-sm"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* TABLE */}
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    Loading users...
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.userId}
                    onClick={() => onSelectUser(user)}
                    className={cn(
                      "hover:bg-gray-50 cursor-pointer",
                      selectedUserId === user.userId && "bg-gray-50",
                    )}
                  >
                    <td className="px-6 py-4">
                      <Checkbox />
                    </td>

                    <td className="px-4 py-4 font-mono text-sm text-gray-500">
                      #{user.userId.slice(-6).toUpperCase()}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <User size={20} />
                        </div>

                        <div>
                          <span className="font-semibold text-sm">
                            {user.fullname}
                          </span>

                          <span className="block text-xs text-gray-500">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <Badge className={roleStyles[user.role]}>
                        {user.role}
                      </Badge>
                    </td>

                    <td className="px-4 py-4">
                      <div
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase",
                          statusStyles[user.status],
                        )}
                      >
                        {user.status}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(user.dateJoined).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <MoreHorizontal size={18} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <div className="px-6 py-4 border-t border-black/5 flex items-center justify-between">
          <div className="text-sm text-gray-500 font-medium">
            Showing {users.length} of {total} users
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg border border-black/5"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="text-sm font-semibold px-4 text-gray-700">
              Page {page} of {totalPages}
            </div>

            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-black/5"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
