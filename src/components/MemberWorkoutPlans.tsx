// src/components/MemberWorkoutPlans.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Dumbbell, Apple, Clock, Calendar, Target, Download, Eye, CheckCircle } from "lucide-react";
import { toast } from "sonner";

/**
 * MemberWorkoutPlans.jsx
 * Shows at most one workout and one diet plan (most recently created of each).
 */

/* ---------- Dummy data (simulate assigned plans) ---------- */
const DUMMY_PLANS = [
  {
    id: "p1",
    title: "Beginner Strength",
    type: "workout",
    description: "A gentle 3-day full-body routine to build foundational strength and technique.",
    duration: "8 weeks",
    difficulty: "beginner",
    goals: ["Build muscle", "Improve posture", "Learn compound lifts"],
    createdDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    pdfUrl: null,
    progress: 35,
    trainer: { name: "Amit Kumar", phone: "+91-9876543210" },
  },
  {
    id: "p2",
    title: "Fat Loss HIIT",
    type: "workout",
    description: "High intensity intervals and metabolic conditioning for fat loss.",
    duration: "6 weeks",
    difficulty: "intermediate",
    goals: ["Lose fat", "Improve cardio"],
    createdDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    pdfUrl: "/static/sample_plan_p2.pdf",
    progress: 60,
    trainer: { name: "Nisha Verma", phone: "+91-9123456789" },
  },
  {
    id: "p3",
    title: "Weight Loss Diet",
    type: "diet",
    description: "Balanced nutrition plan around a 1600–1800 kcal/day target with flexible swaps.",
    duration: "12 weeks",
    difficulty: "beginner",
    goals: ["Lose weight", "Better eating habits"],
    createdDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
    pdfUrl: "/static/sample_plan_p3.pdf",
    progress: 25,
    trainer: { name: "Dietitian Team", phone: "" },
  },
  {
    id: "p4",
    title: "Muscle Building Diet",
    type: "diet",
    description: "Higher calorie, protein-focused meal plans to support hypertrophy.",
    duration: "10 weeks",
    difficulty: "intermediate",
    goals: ["Gain muscle", "Increase protein intake"],
    createdDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    pdfUrl: null,
    progress: 0,
    trainer: { name: "Rohit Patel", phone: "+91-9988776655" },
  },
];

/* ---------- helpers ---------- */
const difficultyLabel = (d) => (d ? d.charAt(0).toUpperCase() + d.slice(1) : "Unknown");

const typeBadge = (type) =>
  type === "workout" ? (
    <Badge className="bg-neon-blue/10 text-neon-blue border-neon-blue/20">Workout</Badge>
  ) : (
    <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Diet</Badge>
  );

/* progress bar simple component */
function ProgressBar({ percent = 0 }) {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden" aria-hidden>
      <div
        style={{ width: `${pct}%` }}
        className="h-full rounded-full transition-all duration-300"
        aria-valuenow={pct}
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>
  );
}

/* pick the most recently created plan per type */
function pickLatestPerType(plans = []) {
  const copy = [...plans];
  copy.sort((a, b) => {
    const ta = a.createdDate ? new Date(a.createdDate).getTime() : 0;
    const tb = b.createdDate ? new Date(b.createdDate).getTime() : 0;
    return tb - ta; // descending (newest first)
  });
  const result = { workout: null, diet: null };
  for (const p of copy) {
    if (p.type === "workout" && !result.workout) result.workout = p;
    if (p.type === "diet" && !result.diet) result.diet = p;
    if (result.workout && result.diet) break;
  }
  return result;
}

/* ---------- MemberWorkoutPlans component ---------- */
export function MemberWorkoutPlans() {
  const [plans, setPlans] = useState([]);
  const [query, setQuery] = useState("");
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfToView, setPdfToView] = useState(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const [completedMap, setCompletedMap] = useState(() => {
    try {
      const raw = localStorage.getItem("member_plan_completed") || "{}";
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    // load dummy data (simulate fetch)
    setPlans(DUMMY_PLANS);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("member_plan_completed", JSON.stringify(completedMap));
    } catch (e) {}
  }, [completedMap]);

  // get the pair (latest workout, latest diet)
  const { workout: latestWorkout, diet: latestDiet } = useMemo(() => pickLatestPerType(plans), [plans]);

  // optionally filter by query across both plans (simple contains)
  const matchesQuery = (plan) => {
    if (!plan) return false;
    const q = (query || "").trim().toLowerCase();
    if (!q) return true;
    return (
      (plan.title || "").toLowerCase().includes(q) ||
      (plan.description || "").toLowerCase().includes(q) ||
      (plan.goals || []).join(" ").toLowerCase().includes(q)
    );
  };

  const visiblePlans = [latestWorkout, latestDiet].filter(Boolean).filter(matchesQuery);

  const openPdf = (plan) => {
    if (!plan || !plan.pdfUrl) {
      toast?.message?.("No PDF available for this plan.");
      return;
    }
    let url = plan.pdfUrl;
    if (url && !/^https?:\/\//i.test(url)) {
      url = `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
    }
    setPdfTitle(plan.title || "Plan PDF");
    setPdfToView(url);
    setPdfOpen(true);
  };

  const downloadPdf = (plan) => {
    if (!plan || !plan.pdfUrl) {
      toast?.message?.("No PDF to download");
      return;
    }
    let url = plan.pdfUrl;
    if (url && !/^https?:\/\//i.test(url)) {
      url = `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const toggleComplete = (id) => {
    setCompletedMap((s) => {
      const next = { ...s, [id]: !s[id] };
      toast?.success?.(next[id] ? "Marked plan as completed" : "Marked plan as not completed");
      return next;
    });
  };

  const totalPlans = Number(Boolean(latestWorkout)) + Number(Boolean(latestDiet));
  const completedCount = (latestWorkout && completedMap[latestWorkout.id] ? 1 : 0) + (latestDiet && completedMap[latestDiet.id] ? 1 : 0);
  const avgProgress =
    visiblePlans.length === 0 ? 0 : Math.round(visiblePlans.reduce((s, p) => s + (Number(p.progress || 0) || 0), 0) / visiblePlans.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-1">My Active Plans</h1>
          <p className="text-muted-foreground">Showing the latest assigned workout and diet plan for you.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="ml-2 w-full sm:w-72">
            <Input placeholder="Filter visible plans..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Cards for the latest workout & diet (up to 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visiblePlans.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">No active workout or diet plans found.</div>
        ) : (
          visiblePlans.map((plan) => {
            const completed = Boolean(completedMap[plan.id]);
            const progress = Math.max(0, Math.min(100, Number(plan.progress || 0)));
            return (
              <Card key={plan.id} className="border-border/50 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {plan.type === "workout" ? <Dumbbell className="w-5 h-5 text-neon-blue" /> : <Apple className="w-5 h-5 text-purple-500" />}
                      {typeBadge(plan.type)}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className="text-xs">{difficultyLabel(plan.difficulty)}</Badge>
                    </div>
                  </div>

                  <CardTitle className="text-lg mt-2">{plan.title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {plan.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> {plan.createdDate ? new Date(plan.createdDate).toLocaleDateString() : "-"}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      Goals
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(plan.goals || []).slice(0, 3).map((g, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{g}</Badge>
                      ))}
                      {(plan.goals || []).length > 3 && <Badge variant="outline" className="text-xs">+{plan.goals.length - 3} more</Badge>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">Progress</div>
                        <ProgressBar percent={progress} />
                      </div>

                      <div className="w-28 text-right">
                        <div className="text-sm font-semibold">{progress}%</div>
                        <div className="text-xs text-muted-foreground">{completed ? "Completed" : "In progress"}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button onClick={() => openPdf(plan)} variant="ghost" className="inline-flex items-center gap-2">
                        <Eye className="w-4 h-4" /> View
                      </Button>

                      {plan.pdfUrl && (
                        <Button onClick={() => downloadPdf(plan)} variant="outline" className="inline-flex items-center gap-2">
                          <Download className="w-4 h-4" /> Download
                        </Button>
                      )}

                      <div className="ml-auto flex items-center gap-2">
                        <button
                          onClick={() => toggleComplete(plan.id)}
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded ${
                            completed ? "bg-emerald-600 text-white" : "bg-transparent border"
                          }`}
                          aria-pressed={completed}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">{completed ? "Completed" : "Mark done"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Trainer: {plan.trainer?.name || "—"} {plan.trainer?.phone ? `• ${plan.trainer.phone}` : ""}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Small summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Shown Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-neon-blue">{totalPlans}</div>
            <p className="text-xs text-muted-foreground mt-1">Latest workout & diet (if assigned)</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-emerald-600">{completedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Plans you've marked completed</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-purple-500">{avgProgress}%</div>
            <p className="text-xs text-muted-foreground mt-1">Average completion across shown plans</p>
          </CardContent>
        </Card>
      </div>

      {/* PDF Dialog */}
      <Dialog open={pdfOpen} onOpenChange={(open) => { if (!open) { setPdfToView(null); setPdfTitle(""); } setPdfOpen(open); }}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>{pdfTitle}</DialogTitle>
          </DialogHeader>

          <div className="mt-2" style={{ minHeight: 400, height: "60vh" }}>
            {pdfToView ? (
              <iframe title={pdfTitle} src={pdfToView} style={{ width: "100%", height: "100%", border: "none" }} />
            ) : (
              <div className="p-8 text-center text-muted-foreground">No PDF available for this plan.</div>
            )}
          </div>

          <DialogFooter className="mt-4 flex items-center justify-between">
            <div>
              {pdfToView && (
                <a href={pdfToView} target="_blank" rel="noopener noreferrer" download>
                  <Button variant="outline">Open in new tab / Download</Button>
                </a>
              )}
            </div>
            <div>
              <Button onClick={() => setPdfOpen(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MemberWorkoutPlans;
