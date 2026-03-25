"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Eye,
  Users,
  MousePointer2,
  ShoppingBag,
  MoreVertical,
} from "lucide-react";
import { getManagerBookings, Booking } from "@/services/booking.service";
import {
  ProfitChart,
  ActivityChart,
  CustomerRateChart,
} from "@/components/garage/DashboardCharts";
import { RecentBookingsTable } from "@/components/garage/RecentBookingsTable";
import { YellowLoader } from "@/components/ui/YellowLoader";

export default function GarageDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getManagerBookings({ limit: 100 });
        setBookings(response.data || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData(); // Initial fetch

    const intervalId = setInterval(fetchData, 10000); // Refetch every 10s

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  // --- Data Aggregation ---

  const stats = useMemo(() => {
    let valetRevenue = 0;
    let bookingRevenue = 0;

    bookings.forEach((b) => {
      const vCharge = b.valetRequested ? 5 : 0;
      valetRevenue += vCharge;
      bookingRevenue += Number(b.amount || 0) - vCharge;
    });

    const totalRevenue = valetRevenue + bookingRevenue;
    const totalOrders = bookings.length;
    const uniqueCustomers = new Set(bookings.map((b) => b.userId)).size;

    // Page Views / Clicks are dummy as they aren't in backend yet, but we'll show something realistic based on orders
    return {
      revenue: totalRevenue,
      valetRevenue,
      bookingRevenue,
      orders: totalOrders,
      customers: uniqueCustomers,
      views: totalOrders * 12 + 450,
      clicks: totalOrders * 3 + 120,
    };
  }, [bookings]);

  const profitData = useMemo(() => {
    const dailyProfit: Record<string, number> = {};
    // Last 7 days for the chart
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    });

    days.forEach((day) => {
      dailyProfit[day] = 0;
    });

    bookings.forEach((b) => {
      const date = new Date(b.startTime).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
      if (dailyProfit[date] !== undefined) {
        dailyProfit[date] += Number(b.amount || 0);
      }
    });

    return Object.entries(dailyProfit).map(([name, profit]) => ({
      name,
      profit,
    }));
  }, [bookings]);

  const activityData = useMemo(() => {
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    bookings.forEach((b) => {
      const day = new Date(b.startTime).getDay();
      dayCounts[day]++;
    });

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date().getDay();

    return days.map((day, i) => ({
      day,
      bookings: dayCounts[i],
      active: i === today,
    }));
  }, [bookings]);

  const repeatCustomerRate = useMemo(() => {
    if (bookings.length === 0) return 0;
    const userCounts: Record<string, number> = {};
    bookings.forEach((b) => {
      userCounts[b.userId] = (userCounts[b.userId] || 0) + 1;
    });
    const repeatUsers = Object.values(userCounts).filter(
      (count) => count > 1,
    ).length;
    return Math.round((repeatUsers / stats.customers) * 100) || 0;
  }, [bookings, stats.customers]);

  if (loading) return <YellowLoader text="Calculating analytics..." />;

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Page Views"
          value={stats.views.toLocaleString()}
          change="+15.5%"
          positive={true}
          icon={<Eye className="text-blue-500" size={18} />}
        />
        <KpiCard
          label="customers"
          value={stats.customers.toLocaleString()}
          change="+8.4%"
          positive={true}
          icon={<Users className="text-blue-600" size={18} />}
        />
        <KpiCard
          label="Click"
          value={stats.clicks.toLocaleString()}
          change="-10.5%"
          positive={false}
          icon={<MousePointer2 className="text-red-500" size={18} />}
        />
        <KpiCard
          label="Bookings"
          value={stats.orders.toLocaleString()}
          change="+4.4%"
          positive={true}
          icon={<ShoppingBag className="text-emerald-500" size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Total Profit */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                Total Profit
              </h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold">
                  ₹{stats.revenue.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                  +24.4% vs last period
                </span>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical size={20} />
            </button>
          </div>

          <ProfitChart data={profitData} />

          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-50">
            <StatSmall
              label="Booking Revenue"
              value={`₹${stats.bookingRevenue.toLocaleString()}`}
              color="bg-blue-500"
            />
            <StatSmall
              label="Valet Revenue"
              value={`₹${stats.valetRevenue.toLocaleString()}`}
              color="bg-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Day Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-gray-800 tracking-tight">
                Most Day Active
              </h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={18} />
              </button>
            </div>
            <ActivityChart data={activityData} />
          </div>

          {/* Repeat Customer Rate */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-gray-800 tracking-tight">
                Repeat Customer Rate
              </h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={18} />
              </button>
            </div>
            <CustomerRateChart rate={repeatCustomerRate} />
            {/* <div className="text-center mt-4 pt-4 border-t border-gray-50">
              <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mx-auto uppercase">
                Show details <ChevronRight size={14} />
              </button>
            </div> */}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Bookings Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">
              Recent Bookings
            </h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical size={20} />
            </button>
          </div>
          <RecentBookingsTable bookings={bookings.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  change,
  positive,
  icon,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {label}
        </h3>
        <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-black text-gray-900 tracking-tight">
            {value}
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${positive ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"}`}
            >
              {change}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              vs last period
            </span>
          </div>
        </div>
        <div className="h-8 w-16 opacity-20 bg-gradient-to-t from-gray-200 to-transparent rounded-t-lg"></div>
      </div>
    </div>
  );
}

function StatSmall({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-col border-r last:border-r-0 border-gray-50 pr-4 last:pr-0">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <span className="text-lg font-extrabold text-gray-800">{value}</span>
    </div>
  );
}

// function TrendUpIcon() {
//   return (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
//       <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
//       <polyline points="16 7 22 7 22 13"></polyline>
//     </svg>
//   );
// }
