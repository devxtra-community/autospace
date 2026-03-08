"use client";

import { getUserLoginStats } from "@/services/admin.service";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function UserLoginChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const stats = await getUserLoginStats();
      setData(stats);
    };

    fetchStats();
  }, []);

  return (
    <div className="w-full h-[350px] bg-white rounded-xl p-6 pb-10 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">User Login Statistics</h2>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#FDE68A" />
            </linearGradient>
          </defs>

          <Bar dataKey="users" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
