// src/components/WorkoutPlans.tsx
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Plus,
  Dumbbell,
  Apple,
  Clock,
  Calendar,
  User,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import planService from "../service/planService";
import assignplanService from "../service/assignplanService";
import memberService from "../service/memberService";
import BASE_API from "../api/baseurl.js";

interface PlanUI {
  id: string;
  title: string;
  type: "workout" | "diet";
  description: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  assignedTo: string[]; // display names
  createdDate: string;
  goals: string[];
  pdfUrl?: string | null;
}

interface MemberItem {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  raw?: any;
}

interface AssignmentItem {
  id?: string;
  member_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  assigned_date?: string;
  notes?: string;
  raw?: any;
}

export function WorkoutPlans() {
  const [activeTab, setActiveTab] = useState("all");
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [plans, setPlans] = useState<PlanUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // file state
  const [imageFile, setImageFile] = useState<File | null>(null);

  // PDF modal state
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfToView, setPdfToView] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState<string>("");

  // Assignment modal state (existing)
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedPlanForAssign, setSelectedPlanForAssign] = useState<PlanUI | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Members (for dropdown)
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const [newPlan, setNewPlan] = useState({
    title: "",
    type: "workout" as "workout" | "diet",
    description: "",
    duration: "",
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
    goals: "",
  });

  // New: Assigned Members modal state (viewing assigned members for a plan)
  const [assignedMembersModalOpen, setAssignedMembersModalOpen] = useState(false);
  const [assignedMembersLoading, setAssignedMembersLoading] = useState(false);
  const [assignedMembers, setAssignedMembers] = useState<AssignmentItem[]>([]);
  const [selectedPlanForMembers, setSelectedPlanForMembers] = useState<PlanUI | null>(null);

  const backendTypeFromUI = (t: "workout" | "diet") =>
    t === "workout" ? "Workout Plan" : "Diet Plan";

  const uiTypeFromBackend = (bt?: string) =>
    bt === "Diet Plan" ? "diet" : "workout";

  const backendDifficultyFromUI = (d: string) =>
    d.charAt(0).toUpperCase() + d.slice(1);

  const uiDifficultyFromBackend = (d?: string) =>
    d ? d.toLowerCase() : "beginner";

  const extractPlansArray = (res: any): any[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    if (res.data && Array.isArray(res.data.rows)) return res.data.rows;
    if (res.rows && Array.isArray(res.rows)) return res.rows;
    if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
  };

  const extractAssignmentsArray = (res: any): any[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    if (res.data && Array.isArray(res.data.rows)) return res.data.rows;
    if (res.rows && Array.isArray(res.rows)) return res.rows;
    if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
  };

  const extractMembersArray = (res: any): any[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    if (res.data && Array.isArray(res.data.rows)) return res.data.rows;
    if (res.rows && Array.isArray(res.rows)) return res.rows;
    if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
  };

  const safeParseGoals = (rawGoals: any): string[] => {
    if (!rawGoals) return [];
    if (Array.isArray(rawGoals)) return rawGoals;
    if (typeof rawGoals === "string") {
      try {
        const parsed = JSON.parse(rawGoals);
        if (Array.isArray(parsed)) return parsed.map((g) => String(g).trim());
      } catch (e) {
        return rawGoals
          .split(",")
          .map((g: string) => g.trim())
          .filter(Boolean);
      }
    }
    return [];
  };

  const getMemberDisplayNameFromAssignment = (assignment: any) => {
    return (
      assignment.member?.name ||
      assignment.member?.full_name ||
      assignment.member_name ||
      assignment.memberName ||
      assignment.member_id ||
      assignment.memberId ||
      assignment.member
    );
  };

  const normalizePlan = (raw: any, assignmentMap: Record<string, string[]>) => {
    const pdfUrl = raw.pdf_url || raw.pdfUrl || raw.pdf || raw.file || null;
    const assignedTo = assignmentMap?.[raw.id] ?? [];

    return {
      id: raw.id,
      title: raw.title || raw.name || "Untitled plan",
      type: uiTypeFromBackend(raw.plan_type),
      description: raw.Description || raw.description || "",
      duration: raw.duration || "",
      difficulty: uiDifficultyFromBackend(raw.difficulty),
      assignedTo,
      createdDate: raw.createdAt || raw.created_date || raw.created_date_time || "",
      goals: safeParseGoals(raw.goals),
      pdfUrl,
    } as PlanUI;
  };

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const options: any = {};
      if (activeTab === "workout") options.plan_type = "Workout Plan";
      if (activeTab === "diet") options.plan_type = "Diet Plan";

      const res = await planService.getPlans(options);
      const dataArray = extractPlansArray(res);

      // Fetch assignments for all plans (so we can show assigned members)
      let assignmentsArray: any[] = [];
      try {
        const assignRes = await assignplanService.getAssignedPlans({});
        assignmentsArray = extractAssignmentsArray(assignRes);
      } catch (e) {
        console.warn("Failed to fetch assignments:", e);
        assignmentsArray = [];
      }

      // Build map plan_id -> array of display names
      const assignmentMap: Record<string, string[]> = {};
      for (const a of assignmentsArray) {
        const pid = a.plan_id || a.planId || a.plan?.id;
        if (!pid) continue;
        if (!assignmentMap[pid]) assignmentMap[pid] = [];
        const display = getMemberDisplayNameFromAssignment(a) || String(a.member_id || a.memberId || "unknown");
        if (!assignmentMap[pid].includes(display)) assignmentMap[pid].push(display);
      }

      const normalized: PlanUI[] = dataArray.map((raw: any) => normalizePlan(raw, assignmentMap));
      setPlans(normalized);
    } catch (err: any) {
      console.error("Failed to fetch plans", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to fetch plans";
      toast.error(msg);
      setError(msg);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Fetch members when assign modal opens
  useEffect(() => {
    const loadMembers = async () => {
      setMembersLoading(true);
      try {
        // fetch a reasonable page of members; backend supports limit param in memberService
        const res = await memberService.getMembers({ limit: 50 });
        const arr = extractMembersArray(res);
        const mapped = arr
          .map((m: any) => ({
            id: m.id || m._id || m.member_id || m.memberId,
            name: m.name || m.full_name || m.fullName || m.email || m.phone || m.id || "",
            email: m.email || m.email_address,
            phone: m.phone || m.mobile || m.contact,
            raw: m,
          }))
          .filter(Boolean)
          // sort by name for nicer UX
          .sort((a: MemberItem, b: MemberItem) => (String(a.name || "").localeCompare(String(b.name || ""))));
        setMembers(mapped);
      } catch (e) {
        console.warn("Members fetch failed", e);
        setMembers([]);
      } finally {
        setMembersLoading(false);
      }
    };

    if (assignModalOpen) {
      loadMembers();
    } else {
      // clear on close for privacy
      setMembers([]);
    }
  }, [assignModalOpen]);

  /**
   * resolveUrl:
   */
  const resolveUrl = (url?: string | null) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    let origin = window.location.origin;
    try {
      if (BASE_API && /^https?:\/\//i.test(BASE_API)) {
        const tmp = new URL(BASE_API);
        origin = tmp.origin;
      }
    } catch (e) {
      origin = window.location.origin;
    }
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${origin}${path}`;
  };

  // Open PDF modal for a plan
  const openPdf = (plan: PlanUI) => {
    const resolved = resolveUrl(plan.pdfUrl ?? null);
    setPdfTitle(plan.title ?? "Plan PDF");
    setPdfToView(resolved);
    setPdfModalOpen(true);
  };

  // Create plan handler (unchanged)
  const handleCreatePlan = async () => {
    if (!newPlan.title.trim()) return toast.error("Please add a plan title");
    if (!newPlan.duration.trim()) return toast.error("Please add duration");

    const formData = new FormData();
    formData.append("title", newPlan.title.trim());
    formData.append("plan_type", backendTypeFromUI(newPlan.type));
    formData.append("difficulty", backendDifficultyFromUI(newPlan.difficulty));
    formData.append("duration", newPlan.duration.trim());

    const goalsArray = newPlan.goals
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);
    formData.append("goals", JSON.stringify(goalsArray));
    formData.append("Description", newPlan.description?.trim() || "");

    if (imageFile) {
      formData.append("image", imageFile, imageFile.name);
    }

    try {
      setLoading(true);
      const res = await planService.createPlan(formData);
      await fetchPlans();
      setIsCreatePlanOpen(false);
      setNewPlan({
        title: "",
        type: "workout",
        description: "",
        duration: "",
        difficulty: "beginner",
        goals: "",
      });
      setImageFile(null);
      const successMsg = res?.message || res?.data?.message || "Plan created";
      toast.success(successMsg);
    } catch (err: any) {
      console.error("Failed to create plan", err);
      const message = err?.response?.data?.message || err?.message || "Failed to create plan";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Open assign modal
  const openAssignModal = (plan: PlanUI) => {
    setSelectedPlanForAssign(plan);
    setAssignForm((s) => ({ ...s, assigned_date: new Date().toISOString().slice(0, 16), member_id: "", member_name: "" }));
    setAssignError(null);
    setAssignModalOpen(true);
  };

  // Close assign modal and reset form
  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedPlanForAssign(null);
    setAssignForm({ member_id: "", member_name: "", assigned_date: new Date().toISOString().slice(0, 16), notes: "" });
    setAssignError(null);
    setMembers([]);
  };

  // When user selects member from dropdown
  const onSelectMember = (memberId: string | undefined) => {
    if (!memberId) {
      setAssignForm((s) => ({ ...s, member_id: "", member_name: "" }));
      return;
    }
    const m = members.find((x) => String(x.id) === String(memberId));
    setAssignForm((s) => ({ ...s, member_id: memberId, member_name: m?.name || "" }));
  };

  // assign form fields (for Assign dialog)
  const [assignForm, setAssignForm] = useState({
    member_id: "",
    member_name: "",
    assigned_date: new Date().toISOString().slice(0, 16),
    notes: "",
  });

  // Handle assign submit
  const handleAssignSubmit = async () => {
    setAssignError(null);

    if (!assignForm.member_id || assignForm.member_id.trim().length === 0) {
      setAssignError("Please select a member from the dropdown.");
      return;
    }

    let assignedISO = assignForm.assigned_date;
    try {
      if (!assignedISO.endsWith("Z")) {
        const dt = new Date(assignedISO);
        assignedISO = dt.toISOString();
      }
    } catch (e) {
      assignedISO = new Date().toISOString();
    }

    const payload: any = {
      plan_id: selectedPlanForAssign?.id,
      member_id: assignForm.member_id.trim(),
      assigned_date: assignedISO,
      notes: assignForm.notes || undefined,
    };

    setAssignLoading(true);

    try {
      const res = await assignplanService.createAssignPlan(payload);
      await fetchPlans();
      closeAssignModal();
      const successMsg =
        res?.message ||
        res?.data?.message ||
        (res?.created ? "Assigned created" : res?.updated ? "Existing assignment updated" : "Assigned plan created");
      toast.success(successMsg || "Plan assigned successfully");
    } catch (err: any) {
      console.error("Failed to assign plan", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to assign plan";
      setAssignError(String(msg));
      toast.error(msg);
    } finally {
      setAssignLoading(false);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return <Badge className="bg-neon-green/10 text-neon-green border-neon-green/20">Beginner</Badge>;
      case "intermediate":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Intermediate</Badge>;
      case "advanced":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Advanced</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) =>
    type === "workout"
      ? <Badge className="bg-neon-blue/10 text-neon-blue border-neon-blue/20">Workout</Badge>
      : <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Diet</Badge>;

  const planCounts = {
    all: plans.length,
    workout: plans.filter((p) => p.type === "workout").length,
    diet: plans.filter((p) => p.type === "diet").length,
  };

  // NEW: fetch assigned members for a single plan (for viewing in modal)
  const fetchAssignedMembersForPlan = async (planId: string) => {
    setAssignedMembersLoading(true);
    setAssignedMembers([]);
    try {
      // try backend filter by plan_id
      const res = await assignplanService.getAssignedPlans({ plan_id: planId });
      const arr = extractAssignmentsArray(res);
      const mapped: AssignmentItem[] = arr.map((a: any) => ({
        id: a.id || a._id || a.assignment_id || a.assign_id,
        member_id: a.member_id || a.memberId || a.member?.id,
        name: getMemberDisplayNameFromAssignment(a) || (a.member?.name || a.member_name || a.name),
        email: a.member?.email || a.email,
        phone: a.member?.phone || a.phone,
        assigned_date: a.assigned_date || a.assignedDate || a.created_at,
        notes: a.notes || a.note,
        raw: a,
      }));
      setAssignedMembers(mapped);
    } catch (e: any) {
      console.warn("Failed to load assigned members:", e);
      toast.error(e?.response?.data?.message || e?.message || "Failed to load assigned members");
      setAssignedMembers([]);
    } finally {
      setAssignedMembersLoading(false);
    }
  };

  // Open assigned members modal
  const openAssignedMembersModal = async (plan: PlanUI) => {
    setSelectedPlanForMembers(plan);
    setAssignedMembersModalOpen(true);
    await fetchAssignedMembersForPlan(plan.id);
  };

  const closeAssignedMembersModal = () => {
    setAssignedMembersModalOpen(false);
    setSelectedPlanForMembers(null);
    setAssignedMembers([]);
  };

  // Unassign a member (if backend supports delete)
  const handleUnassign = async (assignmentId?: string) => {
    if (!assignmentId) return toast.error("Cannot unassign: missing assignment id");
    if (!confirm("Are you sure you want to unassign this member from the plan?")) return;
    try {
      // many backends support delete by id; adjust method name if yours differs
      if (assignplanService.deleteAssignPlan) {
        await assignplanService.deleteAssignPlan(assignmentId);
      } else if (assignplanService.removeAssign) {
        await assignplanService.removeAssign(assignmentId);
      } else {
        throw new Error("Unassign operation not supported by assignplanService");
      }
      // refresh both assigned list and plans summary
      if (selectedPlanForMembers) await fetchAssignedMembersForPlan(selectedPlanForMembers.id);
      await fetchPlans();
      toast.success("Member unassigned");
    } catch (e: any) {
      console.error("Failed to unassign", e);
      toast.error(e?.response?.data?.message || e?.message || "Failed to unassign member");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2">Workout & Diet Plans</h1>
          <p className="text-muted-foreground">Create and manage personalized fitness and nutrition plans</p>
        </div>

        <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-neon-green to-neon-blue text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Plan</DialogTitle>
              <p className="text-sm text-muted-foreground">Create a personalized workout or diet plan for your members.</p>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Plan Title</Label>
                <Input
                  id="title"
                  value={newPlan.title}
                  onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                  placeholder="Enter plan title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Plan Type</Label>
                  <Select value={newPlan.type} onValueChange={(value: "workout" | "diet") => setNewPlan({ ...newPlan, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workout">Workout Plan</SelectItem>
                      <SelectItem value="diet">Diet Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={newPlan.difficulty} onValueChange={(value: "beginner" | "intermediate" | "advanced") => setNewPlan({ ...newPlan, difficulty: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={newPlan.duration}
                  onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value })}
                  placeholder="e.g., 8 weeks, 3 months"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="goals">Goals (comma separated)</Label>
                <Input
                  id="goals"
                  value={newPlan.goals}
                  onChange={(e) => setNewPlan({ ...newPlan, goals: e.target.value })}
                  placeholder="e.g., Build muscle, Lose weight"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  placeholder="Detailed description..."
                  rows={4}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image">Plan Image (optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                onClick={handleCreatePlan}
                className="bg-gradient-to-r from-neon-green to-neon-blue text-white"
                disabled={loading}
              >
                Create Plan
              </Button>
            </DialogFooter>

          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs + Cards */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-fit">
          <TabsTrigger value="all">All Plans ({planCounts.all})</TabsTrigger>
          <TabsTrigger value="workout">Workout ({planCounts.workout})</TabsTrigger>
          <TabsTrigger value="diet">Diet ({planCounts.diet})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">Loading plans...</div>
            ) : error ? (
              <div className="col-span-full text-center text-red-500 py-8">{error}</div>
            ) : plans.length === 0 ? (
              <div className="col-span-full text-center py-8">No plans found</div>
            ) : (
              plans.map((plan) => (
                <Card key={plan.id} className="border-border/50 hover:border-border transition-colors">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        {plan.type === "workout" ? (
                          <Dumbbell className="w-5 h-5 text-neon-blue" />
                        ) : (
                          <Apple className="w-5 h-5 text-purple-500" />
                        )}
                        {getTypeBadge(plan.type)}
                      </div>
                      {getDifficultyBadge(plan.difficulty)}
                    </div>
                    <CardTitle className="text-lg">{plan.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {plan.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {plan.createdDate ? new Date(plan.createdDate).toLocaleDateString() : "-"}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        Goals
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {plan.goals.slice(0, 2).map((goal, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {goal}
                          </Badge>
                        ))}
                        {plan.goals.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{plan.goals.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {/* clickable header to open assigned members modal */}
                        <button
                          onClick={() => openAssignedMembersModal(plan)}
                          className="text-sm font-medium underline-offset-2 hover:underline text-left cursor-pointer"
                          aria-label={`View assigned members for ${plan.title}`}
                        >
                          Assigned Members ({plan.assignedTo.length})
                        </button>
                      </h4>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button onClick={() => openAssignModal(plan)} variant="ghost">Assign</Button>

                      {plan.pdfUrl && (
                        <>
                          <a
                            href={resolveUrl(plan.pdfUrl) || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center"
                            download
                          >
                            <Button variant="ghost">Download PDF</Button>
                          </a>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Plans Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-neon-green">{plans.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month: +{Math.floor(plans.length * 0.3)} new plans
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Members with Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-neon-blue">
              {new Set(plans.flatMap((p) => p.assignedTo)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique members with active plans
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Plans Sent This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-purple-400">23</div>
            <p className="text-xs text-muted-foreground mt-1">Via WhatsApp and Email</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Plan Templates</CardTitle>
          <CardDescription>Quick-start templates for common fitness goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2 text-left">
              <Dumbbell className="w-6 h-6 text-neon-green" />
              <span className="font-medium">Beginner Strength</span>
              <span className="text-xs text-muted-foreground">3-day full body routine</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2 text-left">
              <Target className="w-6 h-6 text-neon-blue" />
              <span className="font-medium">Fat Loss HIIT</span>
              <span className="text-xs text-muted-foreground">High-intensity cardio plan</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2 text-left">
              <Apple className="w-6 h-6 text-purple-500" />
              <span className="font-medium">Weight Loss Diet</span>
              <span className="text-xs text-muted-foreground">Balanced nutrition plan</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2 text-left">
              <User className="w-6 h-6 text-orange-500" />
              <span className="font-medium">Muscle Building</span>
              <span className="text-xs text-muted-foreground">High-protein meal plan</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PDF Viewer Dialog */}
      <Dialog open={pdfModalOpen} onOpenChange={(open) => { if (!open) { setPdfToView(null); setPdfTitle(""); } setPdfModalOpen(open); }}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>{pdfTitle}</DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            {pdfToView ? (
              <div style={{ height: "70vh", minHeight: 400 }}>
                <iframe
                  title={pdfTitle}
                  src={pdfToView}
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
                <noscript>
                  <object data={pdfToView} type="application/pdf" width="100%" height="100%">
                    <p>
                      Your browser does not support viewing PDFs inline. {" "}
                      <a href={pdfToView} target="_blank" rel="noreferrer">Open PDF in new tab</a>
                    </p>
                  </object>
                </noscript>
              </div>
            ) : (
              <div>No PDF available</div>
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
              <Button onClick={() => setPdfModalOpen(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Plan Dialog (existing) */}
      <Dialog open={assignModalOpen} onOpenChange={(open) => { if (!open) closeAssignModal(); }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Assign Plan{selectedPlanForAssign ? ` — ${selectedPlanForAssign.title}` : ""}</DialogTitle>
            <p className="text-sm text-muted-foreground">Assign this plan to a member (select from dropdown).</p>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Member dropdown */}
            <div className="grid gap-2">
              <Label htmlFor="member_select">Select Member</Label>

              {membersLoading ? (
                <div className="text-sm text-muted-foreground">Loading members...</div>
              ) : members.length === 0 ? (
                <div className="text-sm text-muted-foreground">No members available. Please add members first.</div>
              ) : (
                <Select value={assignForm.member_id} onValueChange={(val: string) => onSelectMember(val)}>
                  <SelectTrigger id="member_select">
                    <SelectValue placeholder="Choose member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {`${m.name || m.email || m.id}${m.email ? ` — ${m.email}` : ""}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="text-xs text-muted-foreground">Selected: {assignForm.member_name || "none"}</div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assigned_date">Assigned date & time</Label>
              <Input
                id="assigned_date"
                type="datetime-local"
                value={assignForm.assigned_date}
                onChange={(e) => setAssignForm({ ...assignForm, assigned_date: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={assignForm.notes}
                onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                rows={3}
              />
            </div>

            {assignError && <div className="text-sm text-red-500">{assignError}</div>}
          </div>

          <DialogFooter>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleAssignSubmit}
                disabled={assignLoading || members.length === 0}
              >
                {assignLoading ? "Assigning..." : "Assign Plan"}
              </Button>
              <Button variant="ghost" onClick={closeAssignModal}>Cancel</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NEW: Assigned Members Viewer Dialog */}
      <Dialog open={assignedMembersModalOpen} onOpenChange={(open) => { if (!open) closeAssignedMembersModal(); }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              Assigned Members{selectedPlanForMembers ? ` — ${selectedPlanForMembers.title}` : ""}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">View members assigned to this plan. You can unassign a member here.</p>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {assignedMembersLoading ? (
              <div className="text-sm text-muted-foreground">Loading assigned members...</div>
            ) : assignedMembers.length === 0 ? (
              <div className="text-sm text-muted-foreground">No members assigned to this plan.</div>
            ) : (
              <div className="space-y-3">
                {assignedMembers.map((m) => (
                  <div key={m.id || m.member_id} className="flex items-center justify-between gap-4 p-3 border rounded">
                    <div>
                      <div className="font-medium">{m.name || m.member_id}</div>
                      <div className="text-xs text-muted-foreground">{m.email || m.phone || "No contact"}</div>
                      <div className="text-xs text-muted-foreground">Assigned: {m.assigned_date ? new Date(m.assigned_date).toLocaleString() : "-"}</div>
                      {m.notes && <div className="text-xs mt-1">Notes: {m.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex items-center gap-2">
              <Button onClick={closeAssignedMembersModal}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WorkoutPlans;
