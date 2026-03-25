"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCompanyBookings,
  getCompanyEmployees,
  getMyCompany,
} from "@/services/company.service";

import { Header } from "@/components/company/Header";
import { StatCard } from "@/components/company/StatCard";
import { Car, Warehouse, Users, Calendar, BarChart3 } from "lucide-react";
import { getMyGarages } from "@/services/garage.service";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { name: "Gateway Garage", value: 14000 },
  { name: "Downtown Parking", value: 13000 },
  { name: "Airport Long-Term", value: 8000 },
  { name: "Central Mall", value: 12780 },
];
const COLORS = ["#2e9c74", "#4567e9", "#ff7c42", "#facc15"];

export default function CompanyDashboardPage() {
  const router = useRouter();

  const [bookingsCount, setBookingsCount] = useState(0);
  const [garagesCount, setGaragesCount] = useState(0);
  const [employeeCount, setEmployeeCount] = useState(0);

  useEffect(() => {
    const checkCompany = async () => {
      try {
        const company = await getMyCompany();
        if (!company) router.replace("/company/create");
        else if (company.status === "pending")
          router.replace("/company/status");
        else if (company.status === "rejected")
          router.replace("/company/rejected");
      } catch (err) {
        console.error("Failed to check company", err);
      }
    };

    checkCompany();
  }, [router]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const company = await getMyCompany();
        if (!company) return;
        const bookings = await getCompanyBookings(company.id);
        const garages = await getMyGarages(company.id);
        const employees = await getCompanyEmployees(company.id);
        setBookingsCount(bookings.meta.total);
        setGaragesCount(garages.meta.total);
        setEmployeeCount(employees.meta.total);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      }
    };
    fetchBookings();
  }, []);

  return (
    <>
      <Header />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
        <StatCard
          label="Total Bookings"
          value={bookingsCount}
          icon={Car}
          colorClass="bg-[#2e9c74]"
          linkHref="/company/bookings"
        />
        <StatCard
          label="Total Garages"
          value={garagesCount}
          icon={Warehouse}
          colorClass="bg-[#4567e9]"
          linkHref="/company/garages"
        />
        <StatCard
          label="Total Employees"
          value={employeeCount}
          icon={Users}
          colorClass="bg-[#ff7c42]"
          linkHref="/company/employees"
        />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Booking Performance Chart (Left) */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-gray-100 p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <h3 className="text-[16px] font-bold text-gray-900 tracking-wide flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-400" />
              Booking Performance
            </h3>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              Last 7 Days
            </div>
          </div>

          {/* Chart Graphic representation */}
          <div className="relative w-full h-[320px] flex items-end">
            {/* Y Axis Labels */}
            <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs font-medium text-gray-400 z-10 py-2">
              <span>200</span>
              <span>150</span>
              <span>100</span>
              <span>50</span>
            </div>

            {/* Chart Area */}
            <div className="relative w-full h-full ml-12 border-l border-gray-100/0">
              {/* Vertical Dashed Grid Lines */}
              <div className="absolute inset-0 flex justify-between pointer-events-none z-0 px-4">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="border-l border-dashed border-gray-200/60 h-[calc(100%-36px)]"
                  ></div>
                ))}
              </div>

              {/* SVG Area Chart over grid */}
              <svg
                viewBox="0 0 1000 300"
                className="absolute inset-0 w-full h-[calc(100%-32px)] z-10 overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="companyChartGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#4567e9" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#4567e9" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,240 L166,120 L333,180 L500,80 L666,140 L833,60 L1000,100 L1000,300 L0,300 Z"
                  fill="url(#companyChartGradient)"
                  stroke="none"
                />
                <path
                  d="M0,240 L166,120 L333,180 L500,80 L666,140 L833,60 L1000,100"
                  fill="none"
                  stroke="#4567e9"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Data Point Dots */}
                <circle
                  cx="166"
                  cy="120"
                  r="4.5"
                  fill="white"
                  stroke="#4567e9"
                  strokeWidth="2.5"
                />
                <circle
                  cx="333"
                  cy="180"
                  r="4.5"
                  fill="white"
                  stroke="#4567e9"
                  strokeWidth="2.5"
                />
                <circle
                  cx="500"
                  cy="80"
                  r="4.5"
                  fill="white"
                  stroke="#4567e9"
                  strokeWidth="2.5"
                />
                <circle
                  cx="666"
                  cy="140"
                  r="4.5"
                  fill="white"
                  stroke="#4567e9"
                  strokeWidth="2.5"
                />
                <circle
                  cx="833"
                  cy="60"
                  r="4.5"
                  fill="white"
                  stroke="#4567e9"
                  strokeWidth="2.5"
                />
              </svg>

              {/* X Axis Labels */}
              <div className="absolute bottom-0 left-6 right-2 flex justify-between text-[11px] font-medium text-gray-500">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Revenue Donut Chart (Right) */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-gray-100 p-8 flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <h3 className="text-[16px] font-bold text-gray-900 tracking-wide flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-400" />
              Booking Revenue
            </h3>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              This Month
            </div>
          </div>

          <div className="relative w-full h-[320px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {revenueData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value) => `₹${value}`}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #f3f4f6",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
