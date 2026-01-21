// src/pages/dashboard/Dashboard.tsx
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
import attendanceService from "../service/attendanceService"; // <-- NEW import
import { motion } from "framer-motion";

interface DashboardProps {
  onNavigate?: (page: NavigationItem) => void;
}

/* ---------- local storage config ---------- */
const STORAGE_KEY = "gms_dashboard_v1"; // change if you want to invalidate all cached dashboards
const SHOW_TOAST_ON_UPDATE = true; // set false to suppress toasts when background update arrives

function useDevice() {
  const isBrowser = typeof window !== "undefined";
  const [width, setWidth] = useState<number>(isBrowser ? window.innerWidth : 1024);

  useEffect(() => {
    if (!isBrowser) return;
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [isBrowser]);

  const isMobile = width <= 640; // compact phone UI
  const isTablet = width > 640 && width < 1024; // tablet: full charts but compact sizing
  const isDesktop = width >= 1024;

  return { width, isMobile, isTablet, isDesktop };
}

/* ---------- IconBubble ---------- */
type IconBubbleProps = {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  size?: "sm" | "md";
};

function IconBubble({ children, className = "", ariaLabel = "", size = "md" }: IconBubbleProps) {
  const sizeClass = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  return (
    <motion.div
      whileHover={{ scale: 1.06, rotate: 3 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className={`inline-flex items-center justify-center ${sizeClass} rounded-full shadow-sm ${className}`}
      aria-label={ariaLabel}
    >
      {children}
    </motion.div>
  );
}

/* ---------- SpeedometerGauge (unchanged) ---------- */
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
  const [isUpdating, setIsUpdating] = useState(false); 
  const [isDark, setIsDark] = useState<boolean>(false);

  // New attendance states
  const [presentTodayCount, setPresentTodayCount] = useState<number>(0);
  const [doingNowCount, setDoingNowCount] = useState<number>(0);
  const [attendanceLoading, setAttendanceLoading] = useState<boolean>(false);

  // device flags
  const { isMobile, isTablet, isDesktop } = useDevice();

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
    const controller = new AbortController();

    const loadFromCache = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.data) return false;
        setData(parsed.data);
        setLoading(false);
        return true;
      } catch (e) {
        console.warn("Failed to read dashboard cache:", e);
        return false;
      }
    };

    const fetchAndUpdate = async () => {
      setIsUpdating(true);
      try {
        const res = await dashboardService.getDashboard();
        if (!mounted) return;
        const newData = res?.data ?? null;
        if (!newData) return;

        // compare cached and new - stringify compare is fine for this use-case
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          const prev = raw ? JSON.parse(raw).data : null;
          const prevStr = prev ? JSON.stringify(prev) : null;
          const newStr = JSON.stringify(newData);
          if (!prevStr || prevStr !== newStr) {
            setData(newData);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now(), data: newData }));
            } catch (e) {
              console.warn("Failed to write dashboard cache:", e);
            }
            if (SHOW_TOAST_ON_UPDATE) toast.success("Dashboard updated");
          }
        } catch (e) {
          // on any compare failure, just write and update
          setData(newData);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now(), data: newData }));
          } catch (ee) {
            console.warn("Failed to write dashboard cache:", ee);
          }
        }
      } catch (err) {
        console.error("Failed to refresh dashboard:", err);
        // only notify if no data at all
        if (!data) toast.error("Failed to load dashboard data");
      } finally {
        if (mounted) {
          setIsUpdating(false);
          setLoading(false);
        }
      }
    };

    const hadCache = loadFromCache();
    // always fetch in background to get fresh values (even if cache present)
    fetchAndUpdate();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  // ---------- NEW: fetch attendance summary for today ----------
  useEffect(() => {
    let mounted = true;
    const fetchAttendanceCounts = async () => {
      setAttendanceLoading(true);
      try {
        const from = new Date();
        from.setHours(0, 0, 0, 0);
        const to = new Date();
        to.setHours(23, 59, 59, 999);

        // call attendanceService.getAttendances with date range
        const res = await attendanceService.getAttendances({
          from_date: from.toISOString(),
          to_date: to.toISOString(),
          limit: 2000,
        });

        // normalize list
        let list: any[] = [];
        if (!res) list = [];
        else if (Array.isArray(res)) list = res;
        else if (Array.isArray(res.data)) list = res.data;
        else if (Array.isArray(res.data?.data)) list = res.data.data;
        else if (Array.isArray(res.rows)) list = res.rows;
        else if (Array.isArray(res.data?.rows)) list = res.data.rows;
        else list = [];

        // compute unique present members and doing-now members
        const presentSet = new Set<string>();
        const doingSet = new Set<string>();

        list.forEach((a: any) => {
          const memberId = String(a.member_id || a.memberId || a.member || a.member_id?.toString?.() || "");
          const hasSignIn = Boolean(a.sign_in || a.signIn || a.signInAt || a.sign_in_at);
          const hasSignOut = Boolean(a.sign_out || a.signOut || a.signOutAt || a.sign_out_at);

          if (memberId && hasSignIn) {
            presentSet.add(memberId);
            if (!hasSignOut) doingSet.add(memberId);
          }
        });

        if (mounted) {
          setPresentTodayCount(presentSet.size);
          setDoingNowCount(doingSet.size);
        }
      } catch (err) {
        console.error("Failed to fetch attendance counts:", err);
      } finally {
        if (mounted) setAttendanceLoading(false);
      }
    };

    fetchAttendanceCounts();

    // no polling by default; if you want, add interval here
    return () => {
      mounted = false;
    };
  }, [/* run on mount only; if you want auto-refresh, add dependencies or interval */]);

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
    borderWidth: 2, 
    borderStyle: "solid",
    borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
    borderRadius: 16,
  } as React.CSSProperties;

  // Tablet-specific size adjustments
  const titleClass = isTablet ? "text-2xl" : "text-3xl sm:text-4xl";
  const cardPaddingClass = isTablet ? "p-3" : "p-4";
  const statValueClass = isTablet ? "text-xl" : "text-2xl sm:text-3xl";
  const smallTextClass = isTablet ? "text-xs" : "text-sm";
  const cardGap = isTablet ? "gap-3" : "gap-4";

  // chart heights (smaller on tablet)
  const barChartHeight = isTablet ? 220 : 260;
  const lineChartHeight = isTablet ? 300 : 340;

  // icon sizes
  const iconSizeClass = isTablet ? "h-4 w-4" : "h-5 w-5";
  const iconBubbleSize = isTablet ? "sm" : "md";

  return (
    <div className={`space-y-6 px-2 md:px-0`}>
      <div className="flex items-center justify-between">
        <div>
          <h1
            className={`${titleClass} font-extrabold bg-clip-text text-transparent ${
              isDark ? "bg-gradient-to-r from-sky-400 to-emerald-300" : "bg-gradient-to-r from-blue-500 to-green-400"
            }`}
          >
            Gym Dashboard
          </h1>
          <p className={`text-muted-foreground mt-1 ${isTablet ? "text-sm" : ""}`}>Welcome back! Here’s your performance overview.</p>
        </div>

        {/* small update indicator */}
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          {isUpdating ? (
            <div className="inline-flex items-center gap-2">
              <div className="h-3 w-3 rounded-full animate-pulse bg-emerald-500" />
              <span>Updating…</span>
            </div>
          ) : (
            <div className="text-[12px]">Last: {new Date(localStorage.getItem(STORAGE_KEY) ? JSON.parse(localStorage.getItem(STORAGE_KEY) as string).ts : Date.now()).toLocaleString()}</div>
          )}
        </div>
      </div>

      {/* STAT CARDS */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${cardGap} items-stretch`}>
        {[
          {
            title: "Active Members",
            value: data.activeMembers,
            icon: <Users className={iconSizeClass} style={{ color: "#059669" }} />,
            aria: "Active Members",
            bubble: "bg-gradient-to-br from-green-50 to-emerald-100",
          },
          {
            title: "Upcoming Renewals",
            value: data.upcomingRenewals,
            icon: <Calendar className={iconSizeClass} style={{ color: "#2563eb" }} />,
            aria: "Upcoming Renewals",
            bubble: "bg-gradient-to-br from-blue-50 to-cyan-100",
          },
          {
            title: "Pending Dues",
            value: `₹${Number(data.pendingDues ?? 0).toLocaleString()}`,
            icon: <AlertTriangle className={iconSizeClass} style={{ color: "#d97706" }} />,
            aria: "Pending Dues",
            bubble: "bg-gradient-to-br from-yellow-50 to-orange-100",
          },
          {
            title: "Monthly Revenue",
            value: `₹${Number(data.monthlyRevenue ?? 0).toLocaleString()}`,
            icon: <DollarSign className={iconSizeClass} style={{ color: "#059669" }} />,
            aria: "Monthly Revenue",
            bubble: "bg-gradient-to-br from-emerald-50 to-green-100",
          },
        ].map((item, i) => (
          <motion.div key={i} whileHover={{ y: -6 }} transition={{ duration: 0.25 }} className="h-full">
           <Card
  style={statCardBorderStyle}
  className={`${cardPaddingClass} h-full hover:shadow-2xl transition-all duration-300 flex flex-col bg-transparent`}
>
  <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className={`font-medium flex items-center gap-2 ${isTablet ? "text-sm" : "text-sm"}`}>
                  <IconBubble className={item.bubble} ariaLabel={item.aria} size={iconBubbleSize}>
                    {item.icon}
                  </IconBubble>
                  <span className={isTablet ? "text-sm" : ""}>{item.title}</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-grow flex items-center justify-between">
                <div className={`${statValueClass} font-bold`}>{item.value}</div>

                <motion.div
                  whileHover={{ scale: 1.08 }}
                  className={`text-muted-foreground text-right ${isTablet ? "text-xs" : "text-xs sm:text-sm"}`}
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

      {/* ---------- NEW small attendance summary section ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className={`${cardPaddingClass} border-border/50`} style={statCardBorderStyle}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isTablet ? "text-base" : "text-lg"}`}>
              <IconBubble className="bg-gradient-to-br from-green-50 to-emerald-100" ariaLabel="Present Today" size={iconBubbleSize}>
                <Users className={iconSizeClass} style={{ color: "#059669" }} />
              </IconBubble>
              <span>Present Today</span>
            </CardTitle>
            <CardDescription className={isTablet ? "text-xs" : ""}>Members who signed in today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between w-full">
              <div>
                <div className={`${isTablet ? "text-xl" : "text-2xl"} font-bold`}>
                  {attendanceLoading ? "…" : presentTodayCount}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Unique members signed in today</div>
              </div>
              <div className="text-muted-foreground text-right">
                <div className="text-xs">{new Date().toLocaleDateString()}</div>
                <div className="text-xs mt-1">{attendanceLoading ? "Updating..." : "Live"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardPaddingClass} border-border/50`} style={statCardBorderStyle}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isTablet ? "text-base" : "text-lg"}`}>
              <IconBubble className="bg-gradient-to-br from-yellow-50 to-orange-50" ariaLabel="Doing Workout Now" size={iconBubbleSize}>
                <Users className={iconSizeClass} style={{ color: "#d97706" }} />
              </IconBubble>
              <span>Doing Workout Now</span>
            </CardTitle>
            <CardDescription className={isTablet ? "text-xs" : ""}>Signed in but not signed out</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between w-full">
              <div>
                <div className={`${isTablet ? "text-xl" : "text-2xl"} font-bold`}>
                  {attendanceLoading ? "…" : doingNowCount}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Members currently in session</div>
              </div>
              <div className="text-muted-foreground text-right">
                <div className="text-xs">{attendanceLoading ? "Refreshing..." : "Realtime"}</div>
                <div className="text-xs mt-1">{doingNowCount > 0 ? `${Math.round((doingNowCount / Math.max(1, presentTodayCount)) * 100)}%` : "0%"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* ---------- end attendance summary section ---------- */}

      {/* Revenue Overview (left) & Top Plans (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Card className={`${cardPaddingClass} border-border/50 hover:shadow-xl transition-all`} style={statCardBorderStyle}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isTablet ? "text-base" : "text-lg"}`}>
                <IconBubble className="bg-gradient-to-br from-emerald-100 to-green-50" ariaLabel="Revenue Overview" size={iconBubbleSize}>
                  <TrendingUp className={iconSizeClass} style={{ color: "#059669" }} />
                </IconBubble>
                <span>Revenue Overview</span>
              </CardTitle>
              <CardDescription className={isTablet ? "text-xs" : ""}>Track monthly revenue vs pending dues</CardDescription>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                <div className="py-2 flex justify-center">
                  <SpeedometerGauge
                    value={latestRevenue}
                    max={latestRevenue + latestPending || 1}
                    size={isTablet ? 220 : 250}
                    arcColor={colors.revenueBar}
                    trackColor={isDark ? "#0f1724" : "#e6eef8"}
                    needleColor={isDark ? "#e6eef8" : "#0f1724"}
                    ticks={5}
                  />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={barChartHeight}>
                  <BarChart data={revenueTrend} margin={{ top: 10, right: 24, left: 12, bottom: 6 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? colors.gridDark : colors.gridLight} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: isTablet ? 11 : 12 }} />
                    <YAxis tick={{ fontSize: isTablet ? 11 : 12 }} />
                    <Tooltip wrapperStyle={{ outline: "none" }} contentStyle={sharedTooltipStyle as any} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ color: isDark ? colors.textDark : colors.textLight }} />
                    <Bar dataKey="revenue" fill={colors.revenueBar} name="Revenue" radius={[8, 8, 8, 8]} barSize={isTablet ? 18 : 22} />
                    <Bar dataKey="pending" fill={colors.pendingBar} name="Pending" radius={[8, 8, 8, 8]} barSize={isTablet ? 18 : 22} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
          <Card className={`${cardPaddingClass} border-border/50 hover:shadow-xl transition-all`} style={statCardBorderStyle}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isTablet ? "text-base" : "text-lg"}`}>
                <IconBubble className="bg-gradient-to-br from-indigo-100 to-purple-50" ariaLabel="Top Plans" size={iconBubbleSize}>
                  <Clipboard className={iconSizeClass} style={{ color: "#4f46e5" }} />
                </IconBubble>
                <span>Top Membership Plans</span>
              </CardTitle>
              <CardDescription className={isTablet ? "text-xs" : ""}>Most subscribed membership plans</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topPlans && data.topPlans.length > 0 ? (
                <div className="space-y-2">
                  {data.topPlans.map((plan: any, i: number) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between rounded-lg ${isTablet ? "p-2" : "p-3"} border border-border/30 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all`}
                    >
                      <div>
                        <div className={`font-medium ${isTablet ? "text-sm" : "text-sm"}`}>{plan.name}</div>
                        <div className={`text-xs text-muted-foreground`}>₹{plan.price}</div>
                      </div>
                      <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
                        {plan.subscribers} Members
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-sm text-muted-foreground ${isTablet ? "text-xs" : ""}`}>No plan data available</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className={`${cardPaddingClass} border-border/50 hover:shadow-xl transition-all`} style={statCardBorderStyle}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isTablet ? "text-base" : "text-lg"}`}>
              <IconBubble className="bg-gradient-to-br from-blue-100 to-cyan-50" ariaLabel="Monthly New Joins" size={iconBubbleSize}>
                <Users className={iconSizeClass} style={{ color: "#1d4ed8" }} />
              </IconBubble>
              <span>Monthly New Joins</span>
            </CardTitle>
            <CardDescription className={isTablet ? "text-xs" : ""}>Track how many members joined each month</CardDescription>
          </CardHeader>
          <CardContent>
            {isMobile ? (
              <div className="space-y-3">
                {monthlyJoinsWithTarget.slice(-3).reverse().map((m: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <div className={`font-medium ${isTablet ? "text-sm" : "text-sm"}`}>{m.month}</div>
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
              <ResponsiveContainer width="100%" height={lineChartHeight}>
                <LineChart data={monthlyJoinsWithTarget} margin={{ top: 10, right: 24, left: 12, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? colors.gridDark : colors.gridLight} />
                  <XAxis dataKey="month" tick={{ fontSize: isTablet ? 11 : 12 }} />
                  <YAxis tick={{ fontSize: isTablet ? 11 : 12 }} />
                  <Tooltip wrapperStyle={{ outline: "none" }} contentStyle={sharedTooltipStyle as any} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ color: isDark ? colors.textDark : colors.textLight }} />

                  <Line
                    type="monotone"
                    dataKey="joins"
                    stroke={colors.linePrimary}
                    strokeWidth={3}
                    dot={{ r: isTablet ? 4 : 5 }}
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

export default Dashboard;
