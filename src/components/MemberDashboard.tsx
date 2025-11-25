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
import { Users, Calendar, AlertTriangle, DollarSign, Clock, Phone, Clipboard } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

interface MemberDashboardProps {
  onNavigate?: (page: NavigationItem) => void;
}

/* ---------- small device hook (copied style) ---------- */
function useDevice() {
  const isBrowser = typeof window !== "undefined";
  const [width, setWidth] = useState<number>(isBrowser ? window.innerWidth : 1024);

  useEffect(() => {
    if (!isBrowser) return;
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [isBrowser]);

  const isMobile = width <= 640;
  const isTablet = width > 640 && width < 1024;
  const isDesktop = width >= 1024;

  return { width, isMobile, isTablet, isDesktop };
}

/* ---------- IconBubble ---------- */
function IconBubble({ children, className = "", ariaLabel = "", size = "md" }: any) {
  const sizeClass = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className={`inline-flex items-center justify-center ${sizeClass} rounded-full shadow-sm ${className}`}
      aria-label={ariaLabel}
    >
      {children}
    </motion.div>
  );
}

/* ---------- SpeedometerGauge (small, reused) ---------- */
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

function SpeedometerGauge({ value, max, size = 160, arcColor = "#3b82f6", trackColor = "#e6eef8", needleColor = "#0f1724", ticks = 5 }: any) {
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
        <div className="text-sm text-muted-foreground">Attendance</div>
        <div className="text-base font-semibold">{val} visits</div>
        <div className="text-xs text-muted-foreground">{pctText}% of goal</div>
      </div>
    </div>
  );
}

// ----------------- Dummy data (no backend) -----------------
const dummyData: any = (() => {
  const now = Date.now();
  return {
    membershipStatus: "Active",
    planName: "Pro - Monthly",
    renewalDate: new Date(now + 1000 * 60 * 60 * 24 * 30).toISOString(),
    nextPaymentAmount: 799,
    nextPaymentDate: new Date(now + 1000 * 60 * 60 * 24 * 7).toISOString(),
    autoPay: true,
    upcomingClasses: [
      { id: 1, name: "HIIT - Morning", startsAt: new Date(now + 1000 * 60 * 60 * 24 * 2).toISOString() },
      { id: 2, name: "Yoga - Evening", startsAt: new Date(now + 1000 * 60 * 60 * 24 * 5).toISOString() },
    ],
    nextClass: { id: 1, name: "HIIT - Morning", startsAt: new Date(now + 1000 * 60 * 60 * 24 * 2).toISOString() },
    trainer: { name: "Amit Kumar", phone: "+91-9876543210" },
    // plans for "Workout & Diet Plans" card — note: only presence matters now
    plans: {
      workout: "Full Body — 4 sessions/week",
      diet: "Balanced — 2200 kcal/day",
    },
    attendanceGoal: 12,
    attendanceThisMonth: 8,
    visitTrend: [
      { label: "Week 1", visits: 2 },
      { label: "Week 2", visits: 3 },
      { label: "Week 3", visits: 1 },
      { label: "Week 4", visits: 2 },
    ],
    notices: [
      { title: "Invoice #1023", summary: "Monthly invoice generated", ts: now - 1000 * 60 * 60 * 24 * 3 },
      { title: "Trainer message", summary: "Change in class schedule", ts: now - 1000 * 60 * 60 * 24 * 6 },
    ],
  };
})();

export function MemberDashboard({ onNavigate }: MemberDashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const { isMobile, isTablet } = useDevice();

  useEffect(() => {
    let mounted = true;
    setIsUpdating(true);
    // simulate network loading with small delay
    const t = window.setTimeout(() => {
      if (!mounted) return;
      setData(dummyData);
      setLoading(false);
      setIsUpdating(false);
    }, 450);

    return () => {
      mounted = false;
      window.clearTimeout(t);
    };
  }, []);

  if (loading) return <div className="flex justify-center items-center h-80 text-lg font-medium text-muted-foreground">Loading your dashboard...</div>;
  if (!data) return <div className="flex justify-center items-center h-80 text-lg text-muted-foreground">No data found</div>;

  // quick derived values
  const nextPayment = data.nextPaymentAmount ?? 0;
  const membershipStatus = data.membershipStatus ?? "Active";
  const renewalDate = data.renewalDate ? new Date(data.renewalDate).toLocaleDateString() : "—";
  const attendanceGoal = Number(data.attendanceGoal ?? 12); // visits per month
  const attendance = Number(data.attendanceThisMonth ?? 0);

  const smallText = isTablet ? "text-xs" : "text-sm";

  const lineData = Array.isArray(data.visitTrend) ? data.visitTrend : [];

  // --- new: availability flags for plans ---
  const workoutAvailable = Boolean(data.plans && data.plans.workout);
  const dietAvailable = Boolean(data.plans && data.plans.diet);

  return (
    <div className="space-y-6 px-2 md:px-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-sky-400`}>My Dashboard</h1>
          <p className={`text-muted-foreground mt-1 ${isTablet ? "text-sm" : ""}`}>Quick view of your membership and activity.</p>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-3">
          {isUpdating ? (
            <div className="inline-flex items-center gap-2">
              <div className="h-3 w-3 rounded-full animate-pulse bg-emerald-500" />
              <span>Syncing…</span>
            </div>
          ) : (
            <div className="text-[12px]">Last synced: {new Date().toLocaleString()}</div>
          )}
        </div>
      </div>

      {/* top summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <Card className="p-2 flex flex-col justify-between " style={{ borderRadius: 12, border: "4px solid rgba(255,255,255,0.06)" }}>
          <CardHeader className="">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <IconBubble className="bg-gradient-to-br from-green-50 to-emerald-100" ariaLabel="Membership">
                <Users className="h-5 w-5 text-emerald-500 color-[#059669]" style={{color:"#059669"}} />
              </IconBubble>
              <span>Membership</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-between">
            <div>
              <div className="font-semibold">{membershipStatus}</div>
            </div>
            <div className="text-right">
              <Badge className="bg-emerald-100 text-emerald-700">{data.planName ?? "—"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="p-2 flex flex-col justify-between" style={{ borderRadius: 12, border: "4px solid rgba(255,255,255,0.06)" }}>
          <CardHeader className="">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <IconBubble className="bg-gradient-to-br from-yellow-50 to-orange-50" ariaLabel="Next payment">
                <DollarSign className="h-5 w-5 text-orange-500" />
              </IconBubble>
              <span>Next Payment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-between">
            <div>
              <div className="font-semibold">₹{Number(nextPayment).toLocaleString()}</div>
              <div className={`text-muted-foreground ${smallText}`}>Due: {data.nextPaymentDate ? new Date(data.nextPaymentDate).toLocaleDateString() : "—"}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-2 flex flex-col justify-between" style={{ borderRadius: 12, border: "4px solid rgba(255,255,255,0.06)" }}>
          <CardHeader className="">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <IconBubble className="bg-gradient-to-br from-indigo-100 to-cyan-50" ariaLabel="Plans">
                <Clipboard className="h-5 w-5 text-indigo-500" style={{color:"#2563eb"}} />
              </IconBubble>
              <span>Workout & Diet Plans</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-between">
            <div>
              <div className="font-semibold">Workout: <span className={workoutAvailable ? "text-green-600 font-medium" : "text-rose-500 font-medium"}>{workoutAvailable ? "Available" : "Not available"}</span></div>
              <div className={`text-muted-foreground ${smallText}`}>Diet: <span className={dietAvailable ? "text-green-600 font-medium" : "text-rose-500 font-medium"}>{dietAvailable ? "Available" : "Not available"}</span></div>
            </div>
            <div className="text-right">
            </div>
          </CardContent>
        </Card>

        <Card className="p-2 flex flex-col justify-between" style={{ borderRadius: 12,  border: "4px solid rgba(255,255,255,0.06)" }}>
          <CardHeader className="">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <IconBubble className="bg-gradient-to-br from-rose-50 to-pink-50" ariaLabel="Support">
                <Phone className="h-5 w-5 text-pink-500" style={{color:"#059669"}}/>
              </IconBubble>
              <span>Trainer</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-between">
            <div>
              <div className="font-semibold">{data.trainer?.name ?? "—"}</div>
              <div className={`text-muted-foreground ${smallText}`}>{data.trainer?.phone ?? "No contact"}</div>
            </div>
            <div className="text-right">
              <button onClick={() => window.open(`tel:${data.trainer?.phone ?? ""}`)} className="px-3 py-1 border rounded-md text-xs hover:shadow-sm">Call</button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity + Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="p-4" style={{ borderRadius: 12,  border: "4px solid rgba(255,255,255,0.06)" }}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isTablet ? "text-base" : "text-lg"}`}>
                <IconBubble className="bg-gradient-to-br from-blue-100 to-cyan-50"> 
                  <Clock className="h-4 w-4" />
                </IconBubble>
                <span>Your Attendance</span>
              </CardTitle>
              <CardDescription className={isTablet ? "text-xs" : ""}>Progress towards your monthly attendance goal</CardDescription>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                <div className="py-2 flex justify-center">
                  <SpeedometerGauge value={attendance} max={attendanceGoal} size={220} arcColor="#3b82f6" />
                </div>
              ) : (
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 8, right: 12, left: 8, bottom: 6 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} />
                      <Line type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="p-4" style={{ borderRadius: 12,  border: "4px solid rgba(255,255,255,0.06)" }}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isTablet ? "text-base" : "text-lg"}`}>
                <IconBubble className="bg-gradient-to-br from-emerald-100 to-green-50"> 
                  <AlertTriangle className="h-4 w-4" />
                </IconBubble>
                <span>Payments & Notices</span>
              </CardTitle>
              <CardDescription className={isTablet ? "text-xs" : ""}>Your latest invoices and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.notices && data.notices.length > 0 ? (
                  data.notices.slice(0, 4).map((n: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <div className="font-medium text-sm">{n.title}</div>
                        <div className="text-xs text-muted-foreground">{n.summary}</div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">{new Date(n.ts).toLocaleDateString()}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No recent notices</div>
                )}

                <div className="pt-2 flex gap-2">
                  <button onClick={() => onNavigate && onNavigate("payments")} className="px-3 py-1 border rounded-md text-sm">View invoices</button>
                  <button onClick={() => onNavigate && onNavigate("profile")} className="px-3 py-1 border rounded-md text-sm">Edit profile</button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

    </div>
  );
}

export default MemberDashboard;
