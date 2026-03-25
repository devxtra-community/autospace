"use client";

import { useEffect, useState } from "react";
import {
  getAllUsersService,
  getCompanyAdmin,
  getGarageAdmin,
} from "@/services/admin.service";
import { Loader2, Building2, Warehouse, ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import UserLoginChart from "@/components/admin/userLoginChart";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    companies: 0,
    garages: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [companiesData, garagesData, usersData] = await Promise.all([
        getCompanyAdmin(),
        getGarageAdmin(),
        getAllUsersService(),
      ]);
      setStats({
        companies: companiesData.meta?.total || 0,
        garages: garagesData.meta?.total || 0,
        users: usersData.meta.total || 0,
      });
      // console.log("users", usersData);
    } catch (error) {
      console.error("Failed to fetch admin stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center bg-[#fcfcfc]">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Section */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Dashboard
          </h1>
          <div className="h-px bg-gray-200 w-full mb-8 mt-5"></div>

          <h2 className="text-2xl font-semibold text-gray-900 mt-2 flex items-center">
            Welcome Back, Admin
          </h2>
          <p className="mt-2 text-[15px] text-gray-500 font-medium">
            Your Team's Success Starts Here.
          </p>
        </div>

        {/* Metric Cards Section */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Companies Card */}
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#2e9c74] text-white">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[22px] font-bold text-gray-900 leading-none mb-1">
                  {stats.companies.toString().padStart(3, "0")}
                </h3>
                <p className="text-[13px] text-gray-500 font-medium">
                  Companies
                </p>
              </div>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-4 flex items-center justify-between mt-1">
              <Link
                href="/admin/companies"
                className="text-[13px] text-gray-500 font-semibold hover:text-gray-900 transition-colors"
              >
                View details
              </Link>
              <ArrowRight className="w-4 h-4 text-gray-500" />
            </div>
          </div>

          {/* Garages Card */}
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#4567e9] text-white">
                <Warehouse className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[22px] font-bold text-gray-900 leading-none mb-1">
                  {stats.garages.toString().padStart(3, "0")}
                </h3>
                <p className="text-[13px] text-gray-500 font-medium">Garages</p>
              </div>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-4 flex items-center justify-between mt-1">
              <Link
                href="/admin/garages"
                className="text-[13px] text-gray-500 font-semibold hover:text-gray-900 transition-colors"
              >
                View details
              </Link>
              <ArrowRight className="w-4 h-4 text-gray-500" />
            </div>
          </div>

          {/* Users Card */}
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#ff7c42] text-white">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[22px] font-bold text-gray-900 leading-none mb-1">
                  {stats.users.toString().padStart(3, "0")}
                </h3>
                <p className="text-[13px] text-gray-500 font-medium">Users</p>
              </div>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-4 flex items-center justify-between mt-1">
              <Link
                href="/admin/users"
                className="text-[13px] text-gray-500 font-semibold hover:text-gray-900 transition-colors"
              >
                View details
              </Link>
              <ArrowRight className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <UserLoginChart />
      </div>
    </div>
  );
}
