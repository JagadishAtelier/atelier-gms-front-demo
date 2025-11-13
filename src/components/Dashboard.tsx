// src/components/Dashboard.tsx
import React, { useState, useEffect, useMemo } from "react";
import { NavigationItem } from "../App";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clipboard,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  defs,
} from "recharts";
import dashboardService from "../service/dashboardService";
import { motion } from "framer-motion";

interface DashboardProps {
  onNavigate?: (page: NavigationItem) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState<boolean>(false);

  // detect dark mode (prefers-color-scheme OR presence of .dark class)
  useEffect(() => {
    const detect = () =>
      Boolean(
        (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ||
          document.documentElement.classList.contains("dark")
      );
    setIsDark(detect());
    // listen for changes
    const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: any) => setIsDark(Boolean(e.matches || document.documentElement.classList.contains("dark")));
    if (mq && mq.addEventListener) mq.addEventListener("change", handler);
    return () => {
      if (mq && mq.removeEventListener) mq.removeEventListener("change", handler);
    };
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getDashboard();
        setData(res.data);
      } catch (err) {
        toast.error("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // chart color palettes tuned for dark/light
  const palette = useMemo(
    () =>
      isDark
        ? {
            bg: "#0b1220",
            card: "#0f1724",
            text: "#e6eef8",
            subText: "#9aa6b8",
            grid: "#18202a",
            revenueFrom: "#064e3b", // green dark
            revenueTo: "#10b981", // green
            pendingFrom: "#5b0211",
            pendingTo: "#ef4444",
            linePrimary: "#60a5fa",
            lineSecondary: "#7c3aed",
          }
        : {
            bg: "#ffffff",
            card: "#ffffff",
            text: "#0f1724",
            subText: "#6b7280",
            grid: "#e6e9ee",
            revenueFrom: "#bbf7d0",
            revenueTo: "#34d399",
            pendingFrom: "#fecaca",
            pendingTo: "#f87171",
            linePrimary: "#3b82f6",
            lineSecondary: "#8b5cf6",
          },
    [isDark]
  );

  // Derived datasets
  // ensure revenueTrend and monthlyJoins exist and are arrays
  const revenueTrend = Array.isArray(data?.revenueTrend) ? data.revenueTrend : [];
  const monthlyJoins = Array.isArray(data?.monthlyJoins) ? data.monthlyJoins : [];

  // Add a subtle target/benchmark series for monthlyJoins (e.g. +15% target) so we have a second line
  const monthlyJoinsWithTarget = useMemo(() => {
    return monthlyJoins.map((row: any) => {
      const joins = Number(row.joins ?? 0);
      const target = Math.round(joins * 1.15); // default target = +15%
      return {
        ...row,
        joins,
        targetJoins: target,
      };
    });
  }, [monthlyJoins]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80 text-lg font-medium text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-80 text-lg text-muted-foreground">
        No dashboard data available
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className={`text-4xl font-extrabold ${
            isDark ? "bg-gradient-to-r from-sky-400 to-emerald-300" : "bg-gradient-to-r from-blue-500 to-green-400"
          } bg-clip-text text-transparent`}
        >
          Gym Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here’s your performance overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Active Members",
            value: data.activeMembers,
            icon: <Users className="h-5 w-5 text-green-400" />,
            desc: "Active right now",
            gradient: "from-green-500/10 to-emerald-500/5",
          },
          {
            title: "Upcoming Renewals",
            value: data.upcomingRenewals,
            icon: <Calendar className="h-5 w-5 text-blue-400" />,
            desc: "Next 7 days",
            gradient: "from-blue-500/10 to-cyan-500/5",
          },
          {
            title: "Pending Dues",
            value: `₹${Number(data.pendingDues ?? 0).toLocaleString()}`,
            icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
            desc: "Unpaid memberships",
            gradient: "from-yellow-500/10 to-orange-500/5",
          },
          {
            title: "Monthly Revenue",
            value: `₹${Number(data.monthlyRevenue ?? 0).toLocaleString()}`,
            icon: <DollarSign className="h-5 w-5 text-emerald-400" />,
            desc: "Revenue this month",
            gradient: "from-emerald-500/10 to-green-500/5",
          },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className={`bg-gradient-to-br ${item.gradient} border-border/40 hover:shadow-lg transition-shadow duration-300`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                {item.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts + Top Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="border-border/50 hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Revenue Overview
              </CardTitle>
              <CardDescription>Track monthly revenue vs pending dues</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueTrend}>
                  {/* gradients */}
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={palette.revenueTo} stopOpacity={0.95} />
                      <stop offset="100%" stopColor={palette.revenueFrom} stopOpacity={0.15} />
                    </linearGradient>
                    <linearGradient id="gradPending" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={palette.pendingTo} stopOpacity={0.95} />
                      <stop offset="100%" stopColor={palette.pendingFrom} stopOpacity={0.15} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#15202b" : "#e6eef8"} />
                  <XAxis dataKey="month" stroke={isDark ? palette.subText : palette.subText} />
                  <YAxis stroke={isDark ? palette.subText : palette.subText} />
                  <Tooltip
                    wrapperStyle={{ outline: "none" }}
                    contentStyle={{
                      backgroundColor: isDark ? "#0b1220" : "#ffffff",
                      border: `1px solid ${isDark ? "#18202a" : "#e6e9ee"}`,
                      color: isDark ? palette.text : palette.text,
                      borderRadius: 8,
                      boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.6)" : "0 6px 18px rgba(15,23,42,0.06)",
                    }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ color: isDark ? palette.subText : palette.subText }} />
                  <Bar dataKey="revenue" fill="url(#gradRevenue)" name="Revenue" radius={[8, 8, 8, 8]} />
                  <Bar dataKey="pending" fill="url(#gradPending)" name="Pending" radius={[8, 8, 8, 8]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Plans */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="border-border/50 hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clipboard className="h-5 w-5 text-purple-400" />
                Top Membership Plans
              </CardTitle>
              <CardDescription>Most subscribed membership plans</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topPlans && data.topPlans.length > 0 ? (
                <div className="space-y-3">
                  {data.topPlans.map((plan: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-gradient-to-r from-purple-500/6 to-indigo-500/4 rounded-lg p-2 border border-border/40">
                      <div>
                        <div className="font-medium text-sm">{plan.name}</div>
                        <div className="text-xs text-muted-foreground">₹{plan.price}</div>
                      </div>
                      <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
                        {plan.subscribers} Members
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No plan data available</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Joins */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="border-border/50 hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-blue-400" />
              Monthly New Joins
            </CardTitle>
            <CardDescription>Track how many members joined each month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={monthlyJoinsWithTarget}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#15202b" : "#e6eef8"} />
                <XAxis dataKey="month" stroke={isDark ? palette.subText : palette.subText} />
                <YAxis stroke={isDark ? palette.subText : palette.subText} />
                <Tooltip
                  wrapperStyle={{ outline: "none" }}
                  contentStyle={{
                    backgroundColor: isDark ? "#0b1220" : "#ffffff",
                    border: `1px solid ${isDark ? "#18202a" : "#e6e9ee"}`,
                    color: isDark ? palette.text : palette.text,
                    borderRadius: 8,
                    boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.6)" : "0 6px 18px rgba(15,23,42,0.06)",
                  }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ color: isDark ? palette.subText : palette.subText }} />
                {/* primary line */}
                <Line
                  type="monotone"
                  dataKey="joins"
                  stroke={palette.linePrimary}
                  strokeWidth={3}
                  dot={{ r: 5, fill: palette.linePrimary }}
                  name="New Joins"
                />
                {/* secondary dashed benchmark line (subtle) */}
                <Line
                  type="monotone"
                  dataKey="targetJoins"
                  stroke={palette.lineSecondary}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Target (+15%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
