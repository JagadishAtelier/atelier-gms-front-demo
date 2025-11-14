import React, { useEffect, useMemo, useState } from "react";
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
import { Users, Calendar, DollarSign, TrendingUp, AlertTriangle, Clipboard } from "lucide-react";
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
} from "recharts";
import dashboardService from "../service/dashboardService";
import { motion } from "framer-motion";

interface DashboardProps {
  onNavigate?: (page: NavigationItem) => void;
}

// small helper hook to detect mobile
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}

// icon wrapper that gives gradient circle, color override and hover micro-anim
function IconBubble({ children, className = "", ariaLabel = "" }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.06, rotate: 3 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className={`inline-flex items-center justify-center h-9 w-9 rounded-full shadow-sm ${className}`}
      aria-label={ariaLabel}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Speedometer (half / semicircle) gauge ---------- */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  };
}
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

type SpeedometerProps = {
  value: number;
  max: number;
  size?: number;
  arcColor?: string;
  trackColor?: string;
  needleColor?: string;
  ticks?: number;
};

function SpeedometerGauge({
  value,
  max,
  size = 160,
  arcColor = "#10b981",
  trackColor = "#e6eef8",
  needleColor = "#0f1724",
  ticks = 5,
}: SpeedometerProps) {
  const total = Math.max(0, Number(max) || 0);
  const val = Math.max(0, Number(value) || 0);
  const percent = total === 0 ? 0 : Math.min(1, val / total);

  const w = size;
  const h = Math.round(size * 0.6);
  const cx = w / 2;
  const cy = h;
  const radius = Math.min(w / 2 - 8, h - 8);

  const startAngle = -120;
  const endAngle = 120;
  const sweep = endAngle - startAngle;
  const filledAngle = startAngle + sweep * percent;

  const trackPath = describeArc(cx, cy, radius, startAngle, endAngle);
  const filledPath = describeArc(cx, cy, radius, startAngle, filledAngle);

  const tickAngles = Array.from({ length: ticks }, (_, i) => startAngle + (sweep * i) / (ticks - 1));

  const needleLength = radius - 6;
  const needleX1 = cx;
  const needleY1 = cy;
  const needleX2 = cx;
  const needleY2 = cy - needleLength;

  const pctText = Math.round(percent * 100);

  return (
    <div className="flex flex-col items-center" role="img" aria-label={`Gauge ${pctText}%`}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
        <path d={trackPath} fill="none" stroke={trackColor} strokeWidth={8} strokeLinecap="round" />
        <path d={filledPath} fill="none" stroke={arcColor} strokeWidth={8} strokeLinecap="round" />

        {tickAngles.map((ang, idx) => {
          const outer = polarToCartesian(cx, cy, radius + 4, ang);
          const inner = polarToCartesian(cx, cy, radius - 8, ang);
          return <line key={idx} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke="#94a3b8" strokeWidth={2} strokeLinecap="round" />;
        })}

        <g
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: `rotate(${filledAngle}deg)`,
            transition: "transform 0.6s cubic-bezier(.2,.9,.2,1)",
          }}
        >
          <line x1={needleX1} y1={needleY1} x2={needleX2} y2={needleY2} stroke={needleColor} strokeWidth={2.5} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={5} fill={needleColor} stroke="white" strokeWidth={1} />
        </g>

        <path d={describeArc(cx, cy, radius - 12, startAngle, endAngle)} fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth={8} strokeLinecap="round" />
      </svg>

      <div className="mt-2 text-center">
        <div className="text-sm text-muted-foreground">Revenue</div>
        <div className="text-base font-semibold">₹{val.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">{pctText}% of total</div>
      </div>
    </div>
  );
}
/* ---------- end SpeedometerGauge ---------- */

export function Dashboard({ onNavigate }: DashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState<boolean>(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const detect = () =>
      Boolean(
        (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ||
          document.documentElement.classList.contains("dark")
      );
    setIsDark(detect());
    const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: any) => setIsDark(Boolean(e.matches || document.documentElement.classList.contains("dark")));
    if (mq && mq.addEventListener) mq.addEventListener("change", handler);
    return () => {
      if (mq && mq.removeEventListener) mq.removeEventListener("change", handler);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getDashboard();
        if (mounted) setData(res.data);
      } catch (err) {
        toast.error("Failed to load dashboard data");
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  // explicit color set (no palette object usage)
  const colors = {
    revenue: "#34d399",
    pending: "#f87171",
    revenueBar: "#10b981",
    pendingBar: "#ef4444",
    linePrimary: "#3b82f6",
    lineSecondary: "#8b5cf6",
    gridLight: "#e6eef8",
    gridDark: "#15202b",
    textLight: "#0f1724",
    textDark: "#e6eef8",
  };

  const revenueTrend = Array.isArray(data?.revenueTrend) ? data.revenueTrend : [];
  const monthlyJoins = Array.isArray(data?.monthlyJoins) ? data.monthlyJoins : [];

  const monthlyJoinsWithTarget = useMemo(() => {
    return monthlyJoins.map((row: any) => {
      const joins = Number(row.joins ?? 0);
      const target = Math.round(joins * 1.15);
      return {
        ...row,
        joins,
        targetJoins: target,
      };
    });
  }, [monthlyJoins]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80 text-lg font-medium text-muted-foreground">Loading dashboard...</div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-80 text-lg text-muted-foreground">No dashboard data available</div>
    );
  }

  const sharedTooltipStyle = {
    backgroundColor: isDark ? "#0b1220" : "#ffffff",
    border: `1px solid ${isDark ? colors.gridDark : colors.gridLight}`,
    color: isDark ? colors.textDark : colors.textLight,
    borderRadius: 8,
    boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.6)" : "0 6px 18px rgba(15,23,42,0.06)",
  };

  const latestRevenue = Number(data.monthlyRevenue ?? 0);
  const latestPending = Number(data.pendingDues ?? 0);
  const latestMonthJoins = monthlyJoinsWithTarget.length > 0 ? monthlyJoinsWithTarget[monthlyJoinsWithTarget.length - 1] : null;

  // computed border style for the stat cards (5px)
  const statCardBorderStyle = {
    borderWidth: 4,
    borderStyle: "solid",
    borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
    borderRadius: 20,
  } as React.CSSProperties;

  return (
    <div className="space-y-6 px-2 md:px-0">
      <div>
        <h1
          className={`text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent ${
            isDark ? "bg-gradient-to-r from-sky-400 to-emerald-300" : "bg-gradient-to-r from-blue-500 to-green-400"
          }`}
        >
          Gym Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here’s your performance overview.</p>
      </div>

      {/* STAT CARDS: each card uses inline style to increase border to 5px */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {[
          {
            title: "Active Members",
            value: data.activeMembers,
            icon: <Users className="h-5 w-5" style={{ color: "#059669" }} />,
            aria: "Active Members",
            bubble: "bg-gradient-to-br from-green-50 to-emerald-100",
          },
          {
            title: "Upcoming Renewals",
            value: data.upcomingRenewals,
            icon: <Calendar className="h-5 w-5" style={{ color: "#2563eb" }} />,
            aria: "Upcoming Renewals",
            bubble: "bg-gradient-to-br from-blue-50 to-cyan-100",
          },
          {
            title: "Pending Dues",
            value: `₹${Number(data.pendingDues ?? 0).toLocaleString()}`,
            icon: <AlertTriangle className="h-5 w-5" style={{ color: "#d97706" }} />,
            aria: "Pending Dues",
            bubble: "bg-gradient-to-br from-yellow-50 to-orange-100",
          },
          {
            title: "Monthly Revenue",
            value: `₹${Number(data.monthlyRevenue ?? 0).toLocaleString()}`,
            icon: <DollarSign className="h-5 w-5" style={{ color: "#059669" }} />,
            aria: "Monthly Revenue",
            bubble: "bg-gradient-to-br from-emerald-50 to-green-100",
          },
        ].map((item, i) => (
          <motion.div key={i} whileHover={{ y: -6 }} transition={{ duration: 0.25 }} className="h-full">
            {/* inline style used to reliably increase border to 5px and adapt color for dark/light */}
            <Card
              style={statCardBorderStyle}
              className="h-full hover:shadow-2xl transition-all duration-300 flex flex-col bg-transparent"
            >
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <IconBubble className={item.bubble} ariaLabel={item.aria}>
                    {item.icon}
                  </IconBubble>
                  <span>{item.title}</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-grow flex items-center justify-between">
                <div className="text-2xl sm:text-3xl font-bold">{item.value}</div>

                <motion.div
                  whileHover={{ scale: 1.08 }}
                  className="text-xs text-muted-foreground text-right sm:text-sm"
                >
                  <span className="hidden sm:inline">
                    {i === 0
                      ? "Active right now"
                      : i === 1
                      ? "Next 7 days"
                      : i === 2
                      ? "Unpaid memberships"
                      : "Revenue this month"}
                  </span>
                  <span className="sm:hidden text-[11px] block">
                    {i === 0 ? "Active" : i === 1 ? "Renewals" : i === 2 ? "Dues" : "Revenue"}
                  </span>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Remaining layout (Revenue Overview, Top Plans, Monthly New Joins) unchanged */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" >
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} >
          <Card className="border-border/50 hover:shadow-xl transition-all" style={statCardBorderStyle}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IconBubble className="bg-gradient-to-br from-emerald-100 to-green-50" ariaLabel="Revenue Overview">
                  <TrendingUp className="h-4 w-4" style={{ color: "#059669" }} />
                </IconBubble>
                <span>Revenue Overview</span>
              </CardTitle>
              <CardDescription>Track monthly revenue vs pending dues</CardDescription>
            </CardHeader>
            <CardContent>
              {/* MOBILE: half speedometer gauge */}
              {isMobile ? (
                <div className="py-2 flex justify-center">
                  <SpeedometerGauge
                    value={latestRevenue}
                    max={latestRevenue + latestPending || 1}
                    size={160}
                    arcColor={colors.revenueBar}
                    trackColor={isDark ? "#0f1724" : "#e6eef8"}
                    needleColor={isDark ? "#e6eef8" : "#0f1724"}
                    ticks={5}
                  />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={revenueTrend} margin={{ top: 10, right: 24, left: 12, bottom: 6 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? colors.gridDark : colors.gridLight} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip wrapperStyle={{ outline: "none" }} contentStyle={sharedTooltipStyle as any} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ color: isDark ? colors.textDark : colors.textLight }} />
                    <Bar dataKey="revenue" fill={colors.revenueBar} name="Revenue" radius={[8, 8, 8, 8]} barSize={22} />
                    <Bar dataKey="pending" fill={colors.pendingBar} name="Pending" radius={[8, 8, 8, 8]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="border-border/50 hover:shadow-xl transition-all" style={statCardBorderStyle}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IconBubble className="bg-gradient-to-br from-indigo-100 to-purple-50" ariaLabel="Top Plans">
                  <Clipboard className="h-4 w-4" style={{ color: "#4f46e5" }} />
                </IconBubble>
                <span>Top Membership Plans</span>
              </CardTitle>
              <CardDescription>Most subscribed membership plans</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topPlans && data.topPlans.length > 0 ? (
                <div className="space-y-2">
                  {data.topPlans.map((plan: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-lg p-2 border border-border/30 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all">
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

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="border-border/50 hover:shadow-xl transition-all" style={statCardBorderStyle}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconBubble className="bg-gradient-to-br from-blue-100 to-cyan-50" ariaLabel="Monthly New Joins">
                <Users className="h-4 w-4" style={{ color: "#1d4ed8" }} />
              </IconBubble>
              <span>Monthly New Joins</span>
            </CardTitle>
            <CardDescription>Track how many members joined each month</CardDescription>
          </CardHeader>
          <CardContent>
            {isMobile ? (
              <div className="space-y-3">
                {monthlyJoinsWithTarget.slice(-3).reverse().map((m: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{m.month}</div>
                      <div className="text-xs text-muted-foreground">Target: {m.targetJoins}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{m.joins}</div>
                      <div className={`text-xs ${m.joins >= m.targetJoins ? "text-green-600" : "text-rose-500"}`}>{m.joins >= m.targetJoins ? "Met" : "Below"}</div>
                    </div>
                  </div>
                ))}

                {latestMonthJoins ? (
                  <div className="pt-2 text-xs text-muted-foreground">Latest month: {latestMonthJoins.month} — {latestMonthJoins.joins} joins</div>
                ) : (
                  <div className="text-xs text-muted-foreground">No join data available</div>
                )}

                <div className="text-xs text-muted-foreground">Open desktop/tablet to view the full trend line.</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={monthlyJoinsWithTarget} margin={{ top: 10, right: 24, left: 12, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? colors.gridDark : colors.gridLight} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip wrapperStyle={{ outline: "none" }} contentStyle={sharedTooltipStyle as any} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ color: isDark ? colors.textDark : colors.textLight }} />

                  <Line
                    type="monotone"
                    dataKey="joins"
                    stroke={colors.linePrimary}
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    name="New Joins"
                  />

                  <Line
                    type="monotone"
                    dataKey="targetJoins"
                    stroke={colors.lineSecondary}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Target (+15%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
