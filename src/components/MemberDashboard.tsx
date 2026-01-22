// src/components/MemberDashboard.tsx
import React, { useEffect, useState, useRef } from "react";
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
import { Users, AlertTriangle, DollarSign, Clock, Phone, Clipboard, Edit2, Mail, PencilRuler, BicepsFlexed } from "lucide-react";
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
import memberService from "../service/memberService.js";
import membermeasurementService from "../service/membermeasurementService.js";
import memberdashboardService from "../service/memberdashboardService.js";
import assignplanService from "../service/assignplanService.js";

// ------------------- NEW: productService import -------------------
import productService from "../service/productService.js";
// ------------------------------------------------------------------

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

interface Plan {
  id?: string;
  title?: string;
  plan_type?: string;
  difficulty?: string;
  goals?: string;
  Description?: string;
  monday_plan?: string;
  tuesday_plan?: string;
  wednesday_plan?: string;
  thursday_plan?: string;
  friday_plan?: string;
  saturday_plan?: string;
  sunday_plan?: string;
  diet_plan?: string;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
}

interface AssignedPlan {
  id?: string;
  plan?: Plan;
  assigned_date?: string;
  notes?: string | null;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  member?: Member;
  [k: string]: any;
}

interface MemberDashboardProps {
  onNavigate?: (page: NavigationItem) => void;
  memberId?: string;
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
    ],
  };
})();

export function MemberDashboard({ onNavigate }: MemberDashboardProps) {
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [member, setMember] = useState<Member | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editState, setEditState] = useState<Partial<Member> | null>(null);
  const { isMobile, isTablet } = useDevice();

  // ------------------- NEW: products state -------------------
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  // --------------------------------------------------------

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

  // assigned plan state
  const [assignedPlans, setAssignedPlans] = useState<AssignedPlan[] | null>(null);
  const [assignedPlanLoading, setAssignedPlanLoading] = useState(false);
  const [activeAssignedPlan, setActiveAssignedPlan] = useState<AssignedPlan | null>(null);

  // fetch dashboard data (real)
  useEffect(() => {
    let mounted = true;
    setIsUpdating(true);
    setLoading(true);

    async function loadDashboard() {
      try {
        const resp = await memberdashboardService.getMemberDashboard();
        const payload =
          resp?.data && typeof resp.data === "object" ? resp.data : (resp && typeof resp === "object" && resp.status ? resp.data || resp : resp);
        const final = payload && Object.keys(payload).length > 0 ? payload : dummyData;

        if (mounted) {
          setDashboardData(final);
          setLoading(false);
          setIsUpdating(false);
        }
      } catch (err: any) {
        console.error("Failed to load dashboard from API", err);
        if (mounted) {
          setDashboardData(dummyData);
          setLoading(false);
          setIsUpdating(false);
          toast.error(err?.message || "Failed to load dashboard, showing fallback data");
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
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

  // ------------------- NEW: fetch products using productService -------------------
  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const res = await productService.getProducts({ page: 1, limit: 12 });
        const list = normalizeListFromResponse(res);
        const mapped = list.map((p: any) => ({
          id: p.id,
          title: p.title ?? p.name ?? "Untitled",
          price: typeof p.price === "number" ? Number(p.price) : (p.price ? Number(String(p.price).replace(/[^\d.]/g, "")) : 0),
          priceLabel: typeof p.price === "number" ? `₹${Number(p.price).toFixed(2)}` : (p.price ?? "—"),
          image: p.product_image_url ?? p.image_url ?? p.image ?? null,
          description: p.description ?? p.desc ?? null,
        }));
        if (mounted) setProducts(mapped);
      } catch (err: any) {
        console.error("Failed to load products", err);
        toast.error(err?.message || "Failed to load products");
      } finally {
        if (mounted) setProductsLoading(false);
      }
    };

    fetchProducts();
    return () => {
      mounted = false;
    };
  }, []);
  // -------------------------------------------------------------------------------

  // fetch member info (USE ONLY memberService.getMembersbyEmail WITHOUT SENDING EMAIL)
  useEffect(() => {
    let mounted = true;
    async function fetchMemberByEmail() {
      try {
        const res = await memberService.getMembersbyEmail();
        if (res && res.data && !Array.isArray(res.data) && res.data.id) {
          if (mounted) setMember(res.data);
          return;
        }
        const list = normalizeListFromResponse(res);
        if (Array.isArray(list) && list.length > 0) {
          const first = list[0];
          const received = first?.data ? first.data : first;
          if (mounted) setMember(received);
          return;
        }
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
  }, []);

  // fetch assigned plan(s) for the current member (backend reads token / member)
  useEffect(() => {
    let mounted = true;
    const fetchAssignedPlans = async () => {
      if (!member?.id) {
        setAssignedPlans(null);
        setActiveAssignedPlan(null);
        return;
      }

      setAssignedPlanLoading(true);
      try {
        const res = await assignplanService.getAssignedPlanBymemberId();
        const list = normalizeListFromResponse(res);
        const plans: AssignedPlan[] = list.map((it: any) => (it.data ? it.data : it));
        if (mounted) {
          setAssignedPlans(plans);
          const sorted = plans
            .filter(p => p)
            .sort((a: any, b: any) => {
              const da = new Date(a.assigned_date ?? a.createdAt ?? 0).getTime();
              const db = new Date(b.assigned_date ?? b.createdAt ?? 0).getTime();
              return db - da;
            });

          const active = sorted.find(p => p.is_active !== false) ?? sorted[0] ?? null;
          setActiveAssignedPlan(active);
        }
      } catch (err: any) {
        console.error("Failed to fetch assigned plans", err);
        if (mounted) {
          setAssignedPlans(null);
          setActiveAssignedPlan(null);
          toast.error(err?.message || "Failed to load assigned plans");
        }
      } finally {
        if (mounted) setAssignedPlanLoading(false);
      }
    };

    fetchAssignedPlans();
    return () => {
      mounted = false;
    };
  }, [member?.id]);

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

        normalized.sort((a: any, b: any) => new Date(b.measurement_date!).getTime() - new Date(a.measurement_date!).getTime());
        const latest = normalized[0];
        if (mounted) {
          setLatestMeasurement({
            id: latest.id,
            height: latest.height,
            weight: latest.weight,
            measurement_date: latest.measurement_date,
          });
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
    name: editState.name,
    email: editState.email,
    phone: editState.phone,
    start_date: editState.start_date,
  };

  try {
    const res = await memberService.updateMember(member.id, payload);

    // normalize response
    const updated =
      res?.data && typeof res.data === "object" ? res.data : payload;

    setMember((prev) => ({
      ...(prev as Member),
      ...updated,
    }));

    setProfileOpen(false);
    toast.success("Profile updated successfully");
  } catch (err: any) {
    console.error("Failed to update profile", err);
    toast.error(err?.message || "Failed to update profile");
  }
}


  // click handler for Add Measurement: open modal (instead of navigating)
  const handleAddMeasurement = () => {
    if (!member?.id) {
      toast.error("No member selected to add measurement for.");
      return;
    }
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

    if (!measureForm.measurement_date) {
      toast.error("Measurement date is required");
      return;
    }

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
      const created = res?.data ? res.data : res;

      const createdObj = {
        id: created.id ?? createdIdFrom(res) ?? "",
        height: created.height != null ? Number(created.height) : (created.h ? Number(created.h) : null),
        weight: created.weight != null ? Number(created.weight) : (created.w ? Number(created.w) : null),
        measurement_date: created.measurement_date ?? created.date ?? created.createdAt ?? created.created_at ?? payload.measurement_date,
      };

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

  const createdIdFrom = (res: any) => {
    if (!res) return undefined;
    if (typeof res === "string") return res;
    if (res.id) return res.id;
    if (res.data && res.data.id) return res.data.id;
    return undefined;
  };

  // ------------------- NEW: ProductsCarousel component (responsive + fixed image size) -------------------
  function ProductsCarousel({ items }: { items: any[] }) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const scrollBy = (dir: "left" | "right") => {
      const el = containerRef.current;
      if (!el) return;
      const scrollAmount = Math.round(el.clientWidth * 0.85);
      el.scrollBy({ left: dir === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    };

    // keyboard navigation
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight") scrollBy("right");
        if (e.key === "ArrowLeft") scrollBy("left");
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, []);

    if (!items || items.length === 0) {
      return <div className="text-sm text-muted-foreground">No products available.</div>;
    }

    // ------------------- NEW: sendWhatsApp helper -------------------
    const sendWhatsApp = (p: any) => {
      try {
        const phone = "919487280241";
        const memberName = (member && member.name) ? member.name : "Customer";
        const memberPhone = (member && member.phone) ? ` (${member.phone})` : "";
        const productTitle = p?.title ?? "Product";
        const productId = p?.id ?? "";
        const productPrice = p?.priceLabel ?? (p?.price ? `₹${p.price}` : "—");

        const text = `Hello,%0AI'm ${memberName}${memberPhone}.%0AI am interested in *${productTitle}*%0AProduct ID: ${productId}%0APrice: ${productPrice}%0AKindly contact me.`;
        const url = `https://wa.me/${phone}?text=${text}`;
        window.open(url, "_blank");
      } catch (err) {
        console.error("Failed to open WhatsApp:", err);
        toast.error("Unable to open WhatsApp");
      }
    };
    // ---------------------------------------------------------------------

    // responsive card sizes (mobile smaller)
    const mobileItemWidth = 160; // px
    const desktopItemWidth = 220; // px

    return (
      <div className="relative">
        <button
          aria-label="Previous products"
          onClick={() => scrollBy("left")}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/90 p-1 shadow border`}
          style={{ transform: "translateY(-50%)" }}
        >
          <span className="text-lg font-bold select-none">‹</span>
        </button>

        <div
          ref={containerRef}
          className="overflow-x-auto no-scrollbar flex gap-4 py-2 px-2 sm:px-6 scroll-smooth"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {items.map((p) => (
            <div
              key={p.id}
              // responsive min width: smaller on mobile, larger on desktop
              className={`flex-shrink-0 rounded-lg border bg-white p-3 shadow-sm`}
              style={{
                minWidth: isMobile ? `${mobileItemWidth}px` : `${desktopItemWidth}px`,
                maxWidth: isMobile ? `${mobileItemWidth}px` : `${desktopItemWidth}px`,
                scrollSnapAlign: "start",
              }}
            >
              {/* FIXED image container: same height across breakpoints */}
              <div
                className="w-full overflow-hidden rounded-md bg-gray-100 flex items-center justify-center"
                style={{
                  height: isMobile ? 140 : 160, // mobile: 140px, desktop: 160px (keeps ratio consistent)
                }}
              >
                <img
                  src={p.image || "https://via.placeholder.com/360x240?text=No+Image"}
                  alt={p.title}
                  className="object-cover w-full h-full"
                  // ensure image covers area and maintains consistent crop
                  loading="lazy"
                />
              </div>

              <div className="mt-3">
                <h4 className="font-semibold text-sm line-clamp-2">{p.title}</h4>
                <div className="mt-1 flex items-center justify-between">
                  <div className="text-sm font-bold text-red-600">{p.priceLabel ?? (p.price ? `₹${p.price}` : "—")}</div>
                  <div className="text-xs text-muted-foreground">In stock</div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{p.description ?? ""}</p>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => sendWhatsApp(p)}
                    className="flex-1 rounded-md bg-gradient-to-r from-neon-green to-neon-blue px-3 py-1 text-sm text-white"
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          aria-label="Next products"
          onClick={() => scrollBy("right")}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/90 p-1 shadow border`}
          style={{ transform: "translateY(-50%)" }}
        >
          <span className="text-lg font-bold select-none">›</span>
        </button>
      </div>
    );
  }
  // ---------------------------------------------------------------------

  if (loading) return <div className="flex justify-center items-center h-80 text-lg font-medium text-muted-foreground">Loading your dashboard...</div>;
  if (!dashboardData) return <div className="flex justify-center items-center h-80 text-lg text-muted-foreground">No data found</div>;

  // profile display helpers
  const avatar = (member?.image_url && member.image_url.length > 5) ? member.image_url : null;
  const displayName = member?.name ?? "Member";
  // const displayEmail = member?.email ?? "—";
  const displayPhone = member?.phone ?? "—";
  const startDateDisplay = member?.start_date ? new Date(member.start_date).toLocaleDateString() : "—";

  const attendancePct = Math.round((attendanceGoal === 0 ? 0 : (attendance / attendanceGoal) * 100));

  // helpers to extract today's plan
  const weekdayKeyForDate = (d: Date) => {
    const map = ["sunday_plan", "monday_plan", "tuesday_plan", "wednesday_plan", "thursday_plan", "friday_plan", "saturday_plan"];
    return map[d.getDay()] ?? "monday_plan";
  };

  const getTodayWorkoutText = (plan?: Plan) => {
    if (!plan) return null;
    const key = weekdayKeyForDate(new Date());
    // @ts-ignore
    const txt = plan[key] ?? null;
    return txt;
  };

  const getDietTextFromPlan = (plan?: Plan) => {
    if (!plan) return null;
    return (plan.diet_plan && plan.diet_plan.trim()) || (plan.Description && plan.Description.trim()) || (plan.goals && String(plan.goals).trim()) || null;
  };

  const renderPlanText = (txt?: string | null) => {
    if (!txt) return <div className="text-sm text-muted-foreground">Not provided</div>;
    const parts = txt.split(/\r?\n/).filter(Boolean);
    return (
      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {parts.map((p, i) => (
          <p key={i} className="mb-1">{p}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
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

  {/* stacked email + phone (phone on next line) */}
  <div className="text-sm text-muted-foreground mt-1">
    <div className="flex items-center gap-1">
      {/* <Mail className="h-4 w-4" /> */}
      {/* <span>{displayEmail}</span> */}
    </div>

    <div className="flex items-center gap-1 mt-1">
      <Phone className="h-4 w-4" />
      {/* break-words ensures long numbers/wrapping behave nicely on small screens */}
      <span className="break-words">{displayPhone}</span>
    </div>
  </div>

  <div className="mt-3 flex items-center gap-3">
    <div className="text-xs text-muted-foreground">Start date</div>
    <div className="text-sm font-medium">{startDateDisplay}</div>
  </div>

  <div className="mt-3 flex items-center gap-2">
    <button
      onClick={() => openEdit()}
      className="px-3 py-1 inline-flex items-center gap-2 bg-white/6 hover:bg-white/9 rounded-md border text-sm"
    >
      <Edit2 className="h-4 w-4" /> Edit profile
    </button>
  </div>
</div>

            </div>

            {/* quick stats block */}
            <div className="flex items-center gap-6 ml-auto">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Next payment</div>
                <div className="text-xs text-muted-foreground">Due {dashboardData.nextPaymentDate ? new Date(dashboardData.nextPaymentDate).toLocaleDateString() : "—"}</div>
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
        {/* ... the 4 small cards remain unchanged ... */}
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
              <div className={`text-muted-foreground ${smallText}`}>Due: {dashboardData.nextPaymentDate ? new Date(dashboardData.nextPaymentDate).toLocaleDateString() : "—"}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-2 flex flex-col justify-between" style={{ borderRadius: 12, border: "4px solid rgba(255,255,255,0.06)" }}>
          <CardHeader className="">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <IconBubble className="bg-gradient-to-br from-indigo-100 to-cyan-50" ariaLabel="Plans">
                <BicepsFlexed className="h-5 w-5 text-indigo-500" style={{color:"#2563eb"}} />
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

        <Card className="p-1 flex flex-col " style={{ borderRadius: 12,  border: "4px solid rgba(255,255,255,0.06)" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <IconBubble className="bg-gradient-to-br from-indigo-100 to-cyan-50" ariaLabel="Plans">
                <PencilRuler className="h-5 w-5 text-indigo-500" style={{color:"#059669"}} />
              </IconBubble>
            <span>Latest Measurement</span></CardTitle>
          </CardHeader>
          <CardContent>
            {measurementLoading ? (
              <div className="text-sm text-muted-foreground">Loading measurement...</div>
            ) : latestMeasurement && measurementFresh ? (
              <div className="">
                <div className="flex  top-0 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Weight</div>
                    <div className="text-lg ">{latestMeasurement.weight != null ? `${latestMeasurement.weight} kg` : "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Height</div>
                    <div className="text-lg ">{latestMeasurement.height != null ? `${latestMeasurement.height} cm` : "—"}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Measured on: {latestMeasurement.measurement_date ? new Date(latestMeasurement.measurement_date).toLocaleDateString() : "—"}</div>
                <div className="">
                </div>
              </div>
            ) : (
              <div className="">
                <div className="text-sm text-muted-foreground">No recent measurement found (last 14 days).</div>
                <div className="text-sm">Please measure again to keep your records up-to-date.</div>
                <div className="pt-1">
                  <button onClick={handleAddMeasurement} className="px-3 py-1 rounded bg-gradient-to-r from-neon-green to-neon-blue text-white">Add Measurement</button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ---------- NEW: Featured Products Carousel ---------- */}
      <div className="mt-4">
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Featured Products</span>
              <div className="text-sm text-muted-foreground">{productsLoading ? "Loading..." : `${products.length} items`}</div>
            </CardTitle>
            <CardDescription>Products you might be interested in — swipe or use arrows to navigate.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <ProductsCarousel items={products} />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* ------------------------------------------------------------------ */}

      {/* Measurement card: show latest measurement if within 14 days, else prompt to add */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isTablet ? "text-base" : "text-lg"}`}>
              <IconBubble className="bg-gradient-to-br from-blue-100 to-cyan-50"> 
                <BicepsFlexed className="h-4 w-4" style={{color: "#ff0000ff"}} />
              </IconBubble>
              <span>Today Workout or Ditet</span>
            </CardTitle>
            <CardDescription className={isTablet ? "text-xs" : ""}>Your Today workout or diet plan</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Today's Plan */}
            {assignedPlanLoading ? (
              <div className="text-sm text-muted-foreground">Loading today's plan...</div>
            ) : activeAssignedPlan && activeAssignedPlan.plan ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Plan</div>
                    <div className="text-lg font-semibold">{activeAssignedPlan.plan.title ?? "Assigned Plan"}</div>
                    <div className="text-xs text-muted-foreground">{activeAssignedPlan.plan.plan_type ?? activeAssignedPlan.plan.difficulty ?? ""}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Assigned on</div>
                    <div className="text-sm">{activeAssignedPlan.assigned_date ? new Date(activeAssignedPlan.assigned_date).toLocaleDateString() : (activeAssignedPlan.createdAt ? new Date(activeAssignedPlan.createdAt).toLocaleDateString() : "—")}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Today's Workout</div>
                  <div className="mt-1 p-3 bg-white/5 rounded border">{renderPlanText(getTodayWorkoutText(activeAssignedPlan.plan) ?? "No workout specified for today.")}</div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">No assigned plan found.</div>
                <div className="text-sm">Ask your trainer to assign a workout & diet plan to see daily guidance here.</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity + Attendance */}
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

      {/* ---------- Edit Profile Modal ---------- */}
{profileOpen && editState && (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
    {/* FULL BLACK overlay */}
    <div
      className="absolute inset-0 bg-black"
      onClick={() => setProfileOpen(false)}
      style={{backgroundColor:"#000"}}
    />

    {/* modal */}
    <div
      className="
        relative w-full
        sm:w-[720px]
        max-h-[90vh]
        overflow-auto
        bg-white
        rounded-t-2xl sm:rounded-xl
        p-4
        shadow-xl
      "
      role="dialog"
      aria-modal
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Edit Profile</h3>
        <button
          onClick={() => setProfileOpen(false)}
          className="px-2 py-1 rounded hover:bg-gray-100"
        >
          Close
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-sm block mb-1">Full name</label>
          <input
            value={editState.name ?? ""}
            onChange={(e) =>
              setEditState((s) => ({ ...(s ?? {}), name: e.target.value }))
            }
            className="w-full p-2 rounded border"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Email</label>
          <input
            value={editState.email ?? ""}
            onChange={(e) =>
              setEditState((s) => ({ ...(s ?? {}), email: e.target.value }))
            }
            className="w-full p-2 rounded border"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Phone</label>
          <input
            value={editState.phone ?? ""}
            onChange={(e) =>
              setEditState((s) => ({ ...(s ?? {}), phone: e.target.value }))
            }
            className="w-full p-2 rounded border"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Start date</label>
          <input
            type="date"
            value={
              editState.start_date
                ? new Date(editState.start_date).toISOString().slice(0, 10)
                : ""
            }
            onChange={(e) =>
              setEditState((s) => ({
                ...(s ?? {}),
                start_date: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : null,
              }))
            }
            className="w-full p-2 rounded border"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => setProfileOpen(false)}
            className="px-4 py-1 border rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => saveProfile()}
            className="px-4 py-1 rounded-md bg-indigo-600 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
)}


      {/* ---------- Add Measurement Modal ---------- */}
{isAddMeasurementOpen && (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
    {/* overlay */}
    <div
      className="absolute inset-0 bg-black/50"
      onClick={() => !measureSubmitting && setIsAddMeasurementOpen(false)}
    />

    {/* modal */}
    <form
      onSubmit={submitCreateMeasurement}
      className="
        relative w-full
        sm:w-[520px]
        max-h-[90vh]
        overflow-auto
        bg-white
        rounded-t-2xl sm:rounded-xl
        p-4
        shadow-xl
      "
      role="dialog"
      aria-modal
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Add Measurement</h3>
        <button
          type="button"
          onClick={() => !measureSubmitting && setIsAddMeasurementOpen(false)}
          className="px-2 py-1 rounded hover:bg-gray-100"
        >
          Close
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-sm block mb-1">Measurement date *</label>
          <input
            type="date"
            value={measureForm.measurement_date}
            onChange={(e) =>
              setMeasureForm((s) => ({ ...s, measurement_date: e.target.value }))
            }
            className="w-full p-2 rounded border"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm block mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={measureForm.weight}
              onChange={(e) =>
                setMeasureForm((s) => ({ ...s, weight: e.target.value }))
              }
              className="w-full p-2 rounded border"
            />
          </div>

          <div>
            <label className="text-sm block mb-1">Height (cm)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={measureForm.height}
              onChange={(e) =>
                setMeasureForm((s) => ({ ...s, height: e.target.value }))
              }
              className="w-full p-2 rounded border"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsAddMeasurementOpen(false)}
            disabled={measureSubmitting}
            className="px-4 py-1 border rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={measureSubmitting}
            className="px-4 py-1 rounded-md bg-indigo-600 text-white"
          >
            {measureSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </form>
  </div>
)}


      {/* ---------- Add Measurement Modal ---------- */}
{isAddMeasurementOpen && (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
    {/* FULL BLACK overlay */}
    <div
      className="absolute inset-0 bg-black"
      onClick={() => !measureSubmitting && setIsAddMeasurementOpen(false)}
      style={{ backgroundColor:"#000"}}
    />

    {/* modal */}
    <form
      onSubmit={submitCreateMeasurement}
      className="
        relative w-full
        sm:w-[520px]
        max-h-[90vh]
        overflow-auto
        bg-white
        rounded-t-2xl sm:rounded-xl
        p-4
        shadow-xl
      "
      role="dialog"
      aria-modal
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Add Measurement</h3>
        <button
          type="button"
          onClick={() => !measureSubmitting && setIsAddMeasurementOpen(false)}
          className="px-2 py-1 rounded hover:bg-gray-100"
        >
          Close
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-sm block mb-1">Measurement date *</label>
          <input
            type="date"
            value={measureForm.measurement_date}
            onChange={(e) =>
              setMeasureForm((s) => ({ ...s, measurement_date: e.target.value }))
            }
            className="w-full p-2 rounded border"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm block mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={measureForm.weight}
              onChange={(e) =>
                setMeasureForm((s) => ({ ...s, weight: e.target.value }))
              }
              className="w-full p-2 rounded border"
            />
          </div>

          <div>
            <label className="text-sm block mb-1">Height (cm)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={measureForm.height}
              onChange={(e) =>
                setMeasureForm((s) => ({ ...s, height: e.target.value }))
              }
              className="w-full p-2 rounded border"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsAddMeasurementOpen(false)}
            disabled={measureSubmitting}
            className="px-4 py-1 border rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={measureSubmitting}
            className="px-4 py-1 rounded-md bg-indigo-600 text-white"
          >
            {measureSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </form>
  </div>
)}

</div>
    </div>
  );
}

export default MemberDashboard;
