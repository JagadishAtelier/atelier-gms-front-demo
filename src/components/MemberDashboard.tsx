// MemberDashboard.tsx
import React, { useEffect, useState } from "react";
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
import { Users, AlertTriangle, DollarSign, Clock, Phone, Clipboard, Edit2, Mail } from "lucide-react";
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
import memberService from "../service/memberService.js"; // uses getMembersbyEmail()
import membermeasurementService from "../service/membermeasurementService.js"; // new: measurements

/* ---------- Types ---------- */
interface Member {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  image_url?: string | null;
  workout_batch?: string | null;
  start_date?: string | null;
  gender?: string | null;
  dob?: string | null;
  join_date?: string | null;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
}

interface MemberDashboardProps {
  onNavigate?: (page: NavigationItem) => void;
  memberId?: string; // kept for compatibility but not used to send email
}

/* ---------- small device hook ---------- */
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

/* ----------------- Dummy dashboard data (keeps original dashboard feel) -----------------*/
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
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [member, setMember] = useState<Member | null>(null);
  const [profileOpen, setProfileOpen] = useState(false); // edit modal toggle
  const [editState, setEditState] = useState<Partial<Member> | null>(null);
  const { isMobile, isTablet } = useDevice();

  // measurement state
  const [latestMeasurement, setLatestMeasurement] = useState<null | {
    id: string;
    height?: number | null;
    weight?: number | null;
    measurement_date?: string | null;
  }>(null);
  const [measurementLoading, setMeasurementLoading] = useState(false);
  const [measurementFresh, setMeasurementFresh] = useState<boolean>(false); // within 14 days

  // Add Measurement modal state
  const [isAddMeasurementOpen, setIsAddMeasurementOpen] = useState<boolean>(false);
  const [measureForm, setMeasureForm] = useState<{ height: string; weight: string; measurement_date: string }>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return { height: "", weight: "", measurement_date: `${yyyy}-${mm}-${dd}` };
  });
  const [measureSubmitting, setMeasureSubmitting] = useState(false);

  // fetch dashboard data (simulated)
  useEffect(() => {
    let mounted = true;
    setIsUpdating(true);

    const t = window.setTimeout(() => {
      if (!mounted) return;
      setDashboardData(dummyData);
      setLoading(false);
      setIsUpdating(false);
    }, 450);

    return () => {
      mounted = false;
      window.clearTimeout(t);
    };
  }, []);

  // small helper to normalize different response shapes
  const normalizeListFromResponse = (res: any): any[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (Array.isArray(res.rows)) return res.rows;
    if (Array.isArray(res.data?.rows)) return res.data.rows;
    return [];
  };

  // fetch member info (USE ONLY memberService.getMembersbyEmail WITHOUT SENDING EMAIL)
  useEffect(() => {
    let mounted = true;
    async function fetchMemberByEmail() {
      try {
        // Call backend endpoint that will determine the email from the token
        const res = await memberService.getMembersbyEmail(); // no params — backend reads token
        // If backend returns a single object under res.data (member), use it.
        if (res && res.data && !Array.isArray(res.data) && res.data.id) {
          if (mounted) setMember(res.data);
          return;
        }

        // Otherwise try to normalize as list and take first item
        const list = normalizeListFromResponse(res);
        if (Array.isArray(list) && list.length > 0) {
          const first = list[0];
          const received = first?.data ? first.data : first;
          if (mounted) setMember(received);
          return;
        }

        // No member found
        if (mounted) {
          setMember(null);
          toast.error("No member found for current user");
        }
      } catch (err: any) {
        console.error("Failed to fetch member by email (token-based)", err);
        if (mounted) {
          setMember(null);
          toast.error(err?.message || "Failed to fetch member");
        }
      }
    }

    fetchMemberByEmail();
    return () => {
      mounted = false;
    };
  }, []); // run once on mount

  // fetch latest measurement for the member when member is available
  useEffect(() => {
    let mounted = true;
    const fetchLatestMeasurement = async () => {
      if (!member?.id) {
        setLatestMeasurement(null);
        setMeasurementFresh(false);
        return;
      }
      setMeasurementLoading(true);
      try {
        const res = await membermeasurementService.getMeasurementsByMemberId(member.id);
        const list = normalizeListFromResponse(res);
        if (!Array.isArray(list) || list.length === 0) {
          if (mounted) {
            setLatestMeasurement(null);
            setMeasurementFresh(false);
          }
          return;
        }

        // Some backends return objects with measurement_date, or nested fields — normalize
        const normalized = list
          .map((it: any) => {
            const dateRaw = it.measurement_date ?? it.date ?? it.createdAt ?? it.created_at ?? null;
            return {
              id: it.id,
              height: it.height != null ? Number(it.height) : (it.h ? Number(it.h) : null),
              weight: it.weight != null ? Number(it.weight) : (it.w ? Number(it.w) : null),
              measurement_date: dateRaw ? (typeof dateRaw === "string" ? dateRaw : (dateRaw instanceof Date ? dateRaw.toISOString() : String(dateRaw))) : null,
              raw: it,
            };
          })
          .filter((x: any) => x.measurement_date);

        if (normalized.length === 0) {
          if (mounted) {
            setLatestMeasurement(null);
            setMeasurementFresh(false);
          }
          return;
        }

        // sort by date desc
        normalized.sort((a: any, b: any) => new Date(b.measurement_date!).getTime() - new Date(a.measurement_date!).getTime());
        const latest = normalized[0];
        if (mounted) {
          setLatestMeasurement({
            id: latest.id,
            height: latest.height,
            weight: latest.weight,
            measurement_date: latest.measurement_date,
          });

          // check freshness: within last 14 days
          const msSince = Date.now() - new Date(latest.measurement_date!).getTime();
          const days = msSince / (1000 * 60 * 60 * 24);
          setMeasurementFresh(days <= 14);
        }
      } catch (err: any) {
        console.error("Failed to fetch measurements for member", err);
        if (mounted) {
          setLatestMeasurement(null);
          setMeasurementFresh(false);
          toast.error(err?.message || "Failed to load measurements");
        }
      } finally {
        if (mounted) setMeasurementLoading(false);
      }
    };

    fetchLatestMeasurement();
    return () => {
      mounted = false;
    };
  }, [member?.id]);

  // helper derived values
  const nextPayment = (dashboardData?.nextPaymentAmount ?? 0) as number;
  const membershipStatus = dashboardData?.membershipStatus ?? "Active";
  const renewalDate = dashboardData?.renewalDate ? new Date(dashboardData.renewalDate).toLocaleDateString() : "—";
  const attendanceGoal = Number(dashboardData?.attendanceGoal ?? 12); // visits per month
  const attendance = Number(dashboardData?.attendanceThisMonth ?? 0);
  const smallText = isTablet ? "text-xs" : "text-sm";
  const lineData = Array.isArray(dashboardData?.visitTrend) ? dashboardData.visitTrend : [];

  // open edit modal and init editState
  function openEdit() {
    setEditState({
      name: member?.name ?? "",
      email: member?.email ?? "",
      phone: member?.phone ?? "",
      start_date: member?.start_date ?? "",
    });
    setProfileOpen(true);
  }

  // Save profile — tries PUT and updates local state
  async function saveProfile() {
    if (!member || !editState) return;
    const payload: any = {
      ...member,
      name: editState.name,
      email: editState.email,
      phone: editState.phone,
      start_date: editState.start_date,
    };

    try {
      toast.loading("Saving profile...");
      const res = await fetch(`/api/members/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        // try to parse error message
        let msg = `Error ${res.status}`;
        try {
          const j = await res.json();
          msg = j?.message ?? msg;
        } catch {}
        throw new Error(msg);
      }
      const j = await res.json();
      const updated = j?.data ? j.data : payload;
      setMember(updated);
      setProfileOpen(false);
      toast.success("Profile updated");
    } catch (err: any) {
      console.error("Failed to save profile", err);
      // update locally anyway (optimistic)
      setMember(prev => ({ ...(prev as Member), ...payload }));
      setProfileOpen(false);
      toast.error("Failed to save to server, saved locally");
    }
  }

  // click handler for Add Measurement: open modal (instead of navigating)
  const handleAddMeasurement = () => {
    if (!member?.id) {
      toast.error("No member selected to add measurement for.");
      return;
    }
    // initialize measurement date to today
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setMeasureForm({ height: "", weight: "", measurement_date: `${yyyy}-${mm}-${dd}` });
    setIsAddMeasurementOpen(true);
  };

  // submit create measurement
  const submitCreateMeasurement = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!member?.id) {
      toast.error("Member not available");
      return;
    }

    // validation: measurement_date required
    if (!measureForm.measurement_date) {
      toast.error("Measurement date is required");
      return;
    }

    // parse numbers if provided
    const payload: any = {
      member_id: member.id,
      measurement_date: new Date(measureForm.measurement_date).toISOString(),
    };

    if (measureForm.height !== "") {
      const h = parseFloat(measureForm.height);
      if (isNaN(h)) {
        toast.error("Height must be a number");
        return;
      }
      payload.height = h;
    }

    if (measureForm.weight !== "") {
      const w = parseFloat(measureForm.weight);
      if (isNaN(w)) {
        toast.error("Weight must be a number");
        return;
      }
      payload.weight = w;
    }

    try {
      setMeasureSubmitting(true);
      const res = await membermeasurementService.createMemberMeasurement(payload);
      // normalize created record (service returns res.data or object)
      const created = res?.data ? res.data : res;

      const createdObj = {
        id: created.id ?? createdIdFrom(res) ?? "",
        height: created.height != null ? Number(created.height) : (created.h ? Number(created.h) : null),
        weight: created.weight != null ? Number(created.weight) : (created.w ? Number(created.w) : null),
        measurement_date: created.measurement_date ?? created.date ?? created.createdAt ?? created.created_at ?? payload.measurement_date,
      };

      // update local latestMeasurement & freshness
      setLatestMeasurement({
        id: createdObj.id,
        height: createdObj.height,
        weight: createdObj.weight,
        measurement_date: createdObj.measurement_date,
      });
      const msSince = Date.now() - new Date(createdObj.measurement_date!).getTime();
      const days = msSince / (1000 * 60 * 60 * 24);
      setMeasurementFresh(days <= 14);

      toast.success("Measurement saved");
      setIsAddMeasurementOpen(false);
    } catch (err: any) {
      console.error("Failed to create measurement", err);
      toast.error(err?.message || "Failed to save measurement");
    } finally {
      setMeasureSubmitting(false);
    }
  };

  // small helper to try to extract id from different shapes
  const createdIdFrom = (res: any) => {
    if (!res) return undefined;
    if (typeof res === "string") return res;
    if (res.id) return res.id;
    if (res.data && res.data.id) return res.data.id;
    return undefined;
  };

  if (loading) return <div className="flex justify-center items-center h-80 text-lg font-medium text-muted-foreground">Loading your dashboard...</div>;
  if (!dashboardData) return <div className="flex justify-center items-center h-80 text-lg text-muted-foreground">No data found</div>;

  // profile display helpers
  const avatar = (member?.image_url && member.image_url.length > 5) ? member.image_url : null;
  const displayName = member?.name ?? "Member";
  const displayEmail = member?.email ?? "—";
  const displayPhone = member?.phone ?? "—";
  const startDateDisplay = member?.start_date ? new Date(member.start_date).toLocaleDateString() : "—";

  const attendancePct = Math.round((attendanceGoal === 0 ? 0 : (attendance / attendanceGoal) * 100));

  return (
    <div className="space-y-6 px-2 md:px-0">
      {/* ---------- Advanced profile header (new) ---------- */}
      <div className="w-full">
        <Card className="p-4" style={{ borderRadius: 14, border: "4px solid rgba(255,255,255,0.04)", background: "linear-gradient(90deg, rgba(59,130,246,0.06), rgba(14,165,233,0.03))" }}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatar ? (
                  <img src={avatar} alt={displayName} className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-md" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center text-white text-xl font-semibold shadow-md">
                    {displayName.split(" ").map(s => s[0]).slice(0, 2).join("")}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1">
                  <Badge className={`px-2 py-0 text-[10px] ${member?.is_active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {member?.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold">{displayName}</h2>
                <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1"><Mail className="h-4 w-4" /> <span>{displayEmail}</span></div>
                  <div className="flex items-center gap-1"><Phone className="h-4 w-4" /> <span>{displayPhone}</span></div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="text-xs text-muted-foreground">Start date</div>
                  <div className="text-sm font-medium">{startDateDisplay}</div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => openEdit()} className="px-3 py-1 inline-flex items-center gap-2 bg-white/6 hover:bg-white/9 rounded-md border text-sm">
                    <Edit2 className="h-4 w-4" /> Edit profile
                  </button>
                  <button onClick={() => navigator?.share ? navigator.share({ title: `Contact ${displayName}`, text: displayPhone }) : window.open(`tel:${member?.phone ?? ""}`)} className="px-3 py-1 border rounded-md text-sm">
                    Call
                  </button>
                </div>
              </div>
            </div>

            {/* quick stats block */}
            <div className="flex items-center gap-6 ml-auto">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Next payment</div>
                <div className="text-lg font-semibold">₹{Number(nextPayment).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Due {new Date(dashboardData.nextPaymentDate).toLocaleDateString()}</div>
              </div>

              <div className="text-center hidden sm:block">
                <div className="text-xs text-muted-foreground">Attendance</div>
                <div className="text-lg font-semibold">{attendance}/{attendanceGoal}</div>
                <div className="text-xs text-muted-foreground">{attendancePct}% of goal</div>
              </div>

              <div className="text-center">
                <div className="text-xs text-muted-foreground">Plan</div>
                <div className="text-lg font-semibold">{dashboardData.planName}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ---------- top summary (original) ---------- */}
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
              <Badge className="bg-emerald-100 text-emerald-700">{dashboardData.planName ?? "—"}</Badge>
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
              <div className={`text-muted-foreground ${smallText}`}>Due: {dashboardData.nextPaymentDate ? new Date(dashboardData.nextPaymentDate).toLocaleDateString() : "—"}</div>
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
              <div className="font-semibold">Workout: <span className={"text-green-600 font-medium"}>{dashboardData.plans?.workout ? "Available" : "Not available"}</span></div>
              <div className={`text-muted-foreground ${smallText}`}>Diet: <span className={dashboardData.plans?.diet ? "text-green-600 font-medium" : "text-rose-500 font-medium"}>{dashboardData.plans?.diet ? "Available" : "Not available"}</span></div>
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
              <div className="font-semibold">{dashboardData.trainer?.name ?? "—"}</div>
              <div className={`text-muted-foreground ${smallText}`}>{dashboardData.trainer?.phone ?? "No contact"}</div>
            </div>
            <div className="text-right">
              <button onClick={() => window.open(`tel:${dashboardData.trainer?.phone ?? ""}`)} className="px-3 py-1 border rounded-md text-xs hover:shadow-sm">Call</button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Measurement card: show latest measurement if within 14 days, else prompt to add */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Latest Measurement</CardTitle>
            <CardDescription className={isTablet ? "text-xs" : ""}>Shows most recent height & weight (if measured within 14 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {measurementLoading ? (
              <div className="text-sm text-muted-foreground">Loading measurement...</div>
            ) : latestMeasurement && measurementFresh ? (
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Weight</div>
                    <div className="text-lg font-semibold">{latestMeasurement.weight != null ? `${latestMeasurement.weight} kg` : "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Height</div>
                    <div className="text-lg font-semibold">{latestMeasurement.height != null ? `${latestMeasurement.height} cm` : "—"}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Measured on: {latestMeasurement.measurement_date ? new Date(latestMeasurement.measurement_date).toLocaleDateString() : "—"}</div>
                <div className="pt-2">
                  <button onClick={() => onNavigate ? onNavigate("measurements" as unknown as NavigationItem) : window.location.href = "/measurements"} className="px-3 py-1 rounded bg-gradient-to-r from-neon-green to-neon-blue text-white">View Measurements</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">No recent measurement found (last 14 days).</div>
                <div className="text-sm">Please measure again to keep your records up-to-date.</div>
                <div className="pt-2">
                  <button onClick={handleAddMeasurement} className="px-3 py-1 rounded bg-gradient-to-r from-neon-green to-neon-blue text-white">Add Measurement</button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity + Attendance (keeps original card as companion) */}
        <Card className="p-4">
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
              <div style={{ height: 220 }}>
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
      </div>

      {/* Payments & Notices (original) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
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
              {dashboardData.notices && dashboardData.notices.length > 0 ? (
                dashboardData.notices.slice(0, 4).map((n: any, idx: number) => (
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

        {/* a small placeholder card to keep layout balanced */}
        <Card className="p-4">
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isTablet ? "text-base" : "text-lg"}`}>
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button onClick={() => window.open(`tel:${dashboardData.trainer?.phone ?? ""}`)} className="px-3 py-1 border rounded-md text-sm">Call Trainer</button>
              <div className="text-xs text-muted-foreground mt-2">Use the actions above to manage payments or profile.</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---------- Add Measurement Modal ---------- */}
      {isAddMeasurementOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{backgroundColor:"#000", height:"300px", width:"500px", justifyContent:"center", left:"300px", top:"200px"}}>
          <div className="absolute inset-0 bg-black/40" onClick={() => { if (!measureSubmitting) setIsAddMeasurementOpen(false); }} />
          <form
            onSubmit={submitCreateMeasurement}
            className="relative w-full md:w-[520px] max-h-[90vh] overflow-auto bg-white/6 backdrop-blur-sm rounded-t-lg md:rounded-lg p-4 m-4"
            role="dialog"
            aria-modal
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Measurement</h3>
              <button type="button" onClick={() => { if (!measureSubmitting) setIsAddMeasurementOpen(false); }} className="px-2 py-1 rounded hover:bg-white/5">Close</button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm block mb-1">Measurement date *</label>
                <input
                  type="date"
                  value={measureForm.measurement_date}
                  onChange={(e) => setMeasureForm(s => ({ ...s, measurement_date: e.target.value }))}
                  className="w-full p-2 rounded border bg-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={measureForm.weight}
                    onChange={(e) => setMeasureForm(s => ({ ...s, weight: e.target.value }))}
                    className="w-full p-2 rounded border bg-transparent"
                    placeholder="e.g. 72.5"
                  />
                </div>

                <div>
                  <label className="text-sm block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={measureForm.height}
                    onChange={(e) => setMeasureForm(s => ({ ...s, height: e.target.value }))}
                    className="w-full p-2 rounded border bg-transparent"
                    placeholder="e.g. 172.0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button type="button" onClick={() => setIsAddMeasurementOpen(false)} disabled={measureSubmitting} className="px-3 py-1 border rounded-md">Cancel</button>
                <button type="submit" disabled={measureSubmitting} className="px-3 py-1 rounded-md bg-indigo-600 text-white">{measureSubmitting ? "Saving..." : "Save Measurement"}</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ---------- Edit Profile Modal / Drawer (simple) ---------- */}
      {profileOpen && editState && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{backgroundColor:"#000", height:"470px", width:"900px", justifyContent:"center", left:"300px", top:"100px", padding:"20px"}}>
          <div className="absolute inset-0 bg-black/40" onClick={() => setProfileOpen(false)} />
          <div className="relative w-full md:w-[720px] max-h-[90vh] overflow-auto bg-white/6 backdrop-blur-sm rounded-t-lg md:rounded-lg p-4 m-4" role="dialog" aria-modal>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Profile</h3>
              <button onClick={() => setProfileOpen(false)} className="px-2 py-1 rounded hover:bg-white/5">Close</button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm block mb-1">Full name</label>
                <input value={editState.name ?? ""} onChange={(e) => setEditState(s => ({ ...(s ?? {}), name: e.target.value }))} className="w-full p-2 rounded border bg-transparent" />
              </div>

              <div>
                <label className="text-sm block mb-1">Email</label>
                <input value={editState.email ?? ""} onChange={(e) => setEditState(s => ({ ...(s ?? {}), email: e.target.value }))} className="w-full p-2 rounded border bg-transparent" />
              </div>

              <div>
                <label className="text-sm block mb-1">Phone</label>
                <input value={editState.phone ?? ""} onChange={(e) => setEditState(s => ({ ...(s ?? {}), phone: e.target.value }))} className="w-full p-2 rounded border bg-transparent" />
              </div>

              <div>
                <label className="text-sm block mb-1">Start date</label>
                <input type="date" value={editState.start_date ? new Date(editState.start_date).toISOString().slice(0, 10) : ""} onChange={(e) => setEditState(s => ({ ...(s ?? {}), start_date: e.target.value ? new Date(e.target.value).toISOString() : null }))} className="w-full p-2 rounded border bg-transparent" />
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button onClick={() => setProfileOpen(false)} className="px-3 py-1 border rounded-md">Cancel</button>
                <button onClick={() => saveProfile()} className="px-3 py-1 rounded-md bg-indigo-600 text-white">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberDashboard;
