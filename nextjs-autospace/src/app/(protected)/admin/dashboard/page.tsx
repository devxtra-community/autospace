"use client";

import { useEffect, useState } from "react";
import {
  getPendingCompanies,
  getPendingGarages,
} from "@/services/admin.service";
import {
  Loader2,
  Building2,
  Warehouse,
  Users,
  UserRound,
  BarChart3,
  TrendingUp,
} from "lucide-react";

// Extracted Components
import { StatCard } from "@/components/admin/StatCard";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    pendingCompanies: 0,
    pendingGarages: 0,
    totalCompanies: 12, // Mock data
    totalGarages: 28, // Mock data
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [companiesData, garagesData] = await Promise.all([
        getPendingCompanies(),
        getPendingGarages(),
      ]);
      setStats({
        pendingCompanies: companiesData.data?.length || 0,
        pendingGarages: garagesData.data?.length || 0,
        totalCompanies: 12, // Maintain mock for now as requested
        totalGarages: 28,
      });
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
      <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 font-sans text-foreground">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Admin <span className="text-secondary">Overview</span>
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            High-level summary of the AutoSpace platform.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pending Companies"
            value={stats.pendingCompanies}
            icon={Building2}
            colorClass="bg-indigo-500"
          />
          <StatCard
            title="Pending Garages"
            value={stats.pendingGarages}
            icon={Warehouse}
            colorClass="bg-orange-500"
          />
          <StatCard
            title="Total Companies"
            value={stats.totalCompanies}
            icon={Building2}
            colorClass="bg-secondary"
          />
          <StatCard
            title="Total Garages"
            value={stats.totalGarages}
            icon={Warehouse}
            colorClass="bg-pink-500"
          />
        </div>

        {/* Charts / Activity Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                Revenue Activity
              </h3>
              <span className="text-xs font-medium bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                Last 30 Days
              </span>
            </div>
            <div className="flex-1 bg-muted/30 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <BarChart3 className="h-full w-full p-10" />
              </div>
              <p className="text-muted-foreground font-medium z-10">
                Revenue data chart placeholder
              </p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary" />
                User Registrations
              </h3>
              <span className="text-xs font-medium bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                Weekly Growth
              </span>
            </div>
            <div className="flex-1 bg-muted/30 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <UserRound className="h-full w-full p-10" />
              </div>
              <p className="text-muted-foreground font-medium z-10">
                Registration trends placeholder
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
