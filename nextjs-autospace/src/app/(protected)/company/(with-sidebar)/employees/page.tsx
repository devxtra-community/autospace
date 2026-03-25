"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Building,
  UserCog,
} from "lucide-react";

import { getCompanyEmployees, getMyCompany } from "@/services/company.service";

/* ================= TYPES ================= */

type Role = "MANAGER" | "VALET";

type EmploymentStatus = "ACTIVE" | "PENDING" | "REJECTED";

interface Employee {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  garageId?: string;
  garageName?: string;
  employmentStatus?: EmploymentStatus;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/* ================= COMPONENT ================= */

export default function CompanyEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"ALL" | Role>("ALL");
  const [status, setStatus] = useState<"ALL" | EmploymentStatus>("ALL");

  const [page, setPage] = useState(1);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  /* ================= FETCH ================= */

  const fetchEmployees = useCallback(async () => {
    try {
      const company = await getMyCompany();

      const res = await getCompanyEmployees(company.id, {
        page,
        limit: 6,
        role: role === "ALL" ? undefined : role,
        employmentStatus: status === "ALL" ? undefined : status,
        search: search || undefined,
      });
      // console.log("employees",res);

      setEmployees(res.data);
      setMeta(res.meta);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  }, [page, role, status, search]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  /* ================= HELPERS ================= */

  const roleStyle: Record<Role, string> = {
    MANAGER: "bg-blue-100 text-blue-700",
    VALET: "bg-green-100 text-green-700",
  };

  const statusStyle: Record<EmploymentStatus, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Users size={22} />
          Company Employees
        </h1>

        <p className="text-muted-foreground text-sm">
          Manage managers and valets
        </p>
      </div>

      {/* FILTERS */}

      <div className="flex flex-wrap gap-3">
        {/* SEARCH */}

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-3 text-muted-foreground"
          />

          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search employees..."
            className="pl-9 pr-3 py-2 border rounded-lg bg-white w-64"
          />
        </div>

        {/* ROLE FILTER */}

        <select
          value={role}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value as Role | "ALL");
          }}
          className="border rounded-lg px-3 py-2 bg-white"
        >
          <option value="ALL">All Roles</option>
          <option value="MANAGER">Managers</option>
          <option value="VALET">Valets</option>
        </select>

        {/* STATUS FILTER */}

        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as EmploymentStatus | "ALL");
          }}
          className="border rounded-lg px-3 py-2 bg-white"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* TABLE */}

      <div className="border rounded-xl overflow-hidden bg-card">
        <table className="w-full">
          <thead className="bg-muted border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold">
                Employee
              </th>

              <th className="text-left px-4 py-3 text-xs font-semibold">
                Role
              </th>

              <th className="text-left px-4 py-3 text-xs font-semibold">
                Garage
              </th>

              <th className="text-left px-4 py-3 text-xs font-semibold">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp) => (
              <tr
                key={emp.userId}
                onClick={() => setSelectedEmployee(emp)}
                className="border-b hover:bg-muted/40 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{emp.name}</div>

                  <div className="text-sm text-muted-foreground">
                    {emp.email}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      roleStyle[emp.role],
                    )}
                  >
                    {emp.role}
                  </span>
                </td>

                <td className="px-4 py-3 text-sm">{emp.garageName || "-"}</td>

                <td className="px-4 py-3">
                  {emp.employmentStatus && (
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        statusStyle[emp.employmentStatus],
                      )}
                    >
                      {emp.employmentStatus}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}

      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-black">
          Page {meta.page} of {meta.totalPages}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border rounded-lg"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="p-2 border rounded-lg"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* MODAL */}

      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-card rounded-xl p-6 w-[400px] space-y-4">
            <div className="text-lg font-semibold">Employee Details</div>

            <div className="space-y-2 text-sm">
              <div className="flex gap-2 items-center">
                <UserCog size={16} />
                {selectedEmployee.name}
              </div>

              <div className="flex gap-2 items-center">
                <Mail size={16} />
                {selectedEmployee.email}
              </div>

              <div className="flex gap-2 items-center">
                <Phone size={16} />
                {selectedEmployee.phone}
              </div>

              <div className="flex gap-2 items-center">
                <Building size={16} />
                {selectedEmployee.garageName || "No garage"}
              </div>
            </div>

            <button
              onClick={() => setSelectedEmployee(null)}
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
