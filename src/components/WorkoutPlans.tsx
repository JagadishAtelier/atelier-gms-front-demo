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
  DialogDescription,
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
import planService from "../service/planService"; // adjust import path if needed

interface PlanUI {
  id: string;
  title: string;
  type: "workout" | "diet";
  description: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  assignedTo: string[];
  createdDate: string;
  goals: string[];
}

export function WorkoutPlans() {
  const [activeTab, setActiveTab] = useState("all");
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [plans, setPlans] = useState<PlanUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newPlan, setNewPlan] = useState({
    title: "",
    type: "workout" as "workout" | "diet",
    description: "",
    duration: "",
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
    goals: "",
  });

  // Helpers to convert between backend <-> UI shapes
  const backendTypeFromUI = (t: "workout" | "diet") =>
    t === "workout" ? "Workout Plan" : "Diet Plan";

  const uiTypeFromBackend = (bt?: string) =>
    bt === "Diet Plan" ? "diet" : "workout";

  const backendDifficultyFromUI = (d: string) =>
    d.charAt(0).toUpperCase() + d.slice(1); // beginner -> Beginner

  const uiDifficultyFromBackend = (d?: string) =>
    d ? d.toLowerCase() : "beginner";

  // attempt to robustly extract an array of plans from various wrapper shapes
  const extractPlansArray = (res: any): any[] => {
    if (!res) return [];
    // res might already be the axios response.data (your planService returns res.data)
    // Example shape: { status, message, data: { total, currentPage, totalPages, data: [ ... ] } }
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    if (res.data && Array.isArray(res.data.rows)) return res.data.rows;
    if (res.rows && Array.isArray(res.rows)) return res.rows;
    // fallback: sometimes service returns { data: { data: [...] } }
    if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
  };

  const safeParseGoals = (rawGoals: any): string[] => {
    if (!rawGoals) return [];
    if (Array.isArray(rawGoals)) return rawGoals;
    if (typeof rawGoals === "string") {
      // try parse JSON string like '["Wight loss","Fit"]'
      try {
        const parsed = JSON.parse(rawGoals);
        if (Array.isArray(parsed)) return parsed.map((g) => String(g).trim());
      } catch (e) {
        // if not JSON, try comma-split fallback
        return rawGoals.split(",").map((g: string) => g.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const normalizePlan = (raw: any): PlanUI => {
    return {
      id: raw.id,
      title: raw.title || raw.name || "Untitled plan",
      type: uiTypeFromBackend(raw.plan_type),
      description: raw.Description || raw.description || "",
      duration: raw.duration || "",
      difficulty: uiDifficultyFromBackend(raw.difficulty),
      // backend doesn't provide assigned members in example — safe default []
      assignedTo: Array.isArray(raw.assignedTo) ? raw.assignedTo : [],
      createdDate: raw.createdAt || raw.created_date || raw.created_date_time || "",
      goals: safeParseGoals(raw.goals),
    };
  };

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const options: any = {};
      if (activeTab === "workout") options.plan_type = "Workout Plan";
      if (activeTab === "diet") options.plan_type = "Diet Plan";
      // fetch from service (returns axios response.data)
      const res = await planService.getPlans(options);

      // extract array robustly based on returned shape
      const dataArray = extractPlansArray(res);

      const normalized: PlanUI[] = dataArray.map(normalizePlan);
      setPlans(normalized);
    } catch (err: any) {
      console.error("Failed to fetch plans", err);
      setError(err?.message || "Failed to fetch plans");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleCreatePlan = async () => {
    if (!newPlan.title.trim()) {
      return alert("Please add a plan title");
    }
    if (!newPlan.duration.trim()) {
      return alert("Please add duration");
    }

    const payload = {
      title: newPlan.title.trim(),
      plan_type: backendTypeFromUI(newPlan.type),
      difficulty: backendDifficultyFromUI(newPlan.difficulty),
      duration: newPlan.duration.trim(),
      goals: newPlan.goals
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      Description: newPlan.description?.trim() || "",
    };

    try {
      setLoading(true);
      await planService.createPlan(payload);
      setIsCreatePlanOpen(false);
      setNewPlan({
        title: "",
        type: "workout",
        description: "",
        duration: "",
        difficulty: "beginner",
        goals: "",
      });
      await fetchPlans();
    } catch (err: any) {
      console.error("Failed to create plan", err);
      alert(err?.message || "Failed to create plan");
    } finally {
      setLoading(false);
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

  const getTypeBadge = (type: string) => {
    return type === "workout"
      ? <Badge className="bg-neon-blue/10 text-neon-blue border-neon-blue/20">Workout</Badge>
      : <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Diet</Badge>;
  };

  const planCounts = {
    all: plans.length,
    workout: plans.filter((p) => p.type === "workout").length,
    diet: plans.filter((p) => p.type === "diet").length,
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
              <DialogDescription>
                Create a personalized workout or diet plan for your members.
              </DialogDescription>
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
                  placeholder="e.g., Build muscle, Lose weight, Improve endurance"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  placeholder="Detailed description of the plan..."
                  rows={4}
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

      {/* Plan Type Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-fit">
          <TabsTrigger value="all">All Plans ({planCounts.all})</TabsTrigger>
          <TabsTrigger value="workout">Workout ({planCounts.workout})</TabsTrigger>
          <TabsTrigger value="diet">Diet ({planCounts.diet})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Plans Grid */}
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
                        Assigned Members ({plan.assignedTo.length})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {plan.assignedTo.slice(0, 2).map((member, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {member}
                          </Badge>
                        ))}
                        {plan.assignedTo.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{plan.assignedTo.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
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

      {/* Template Library */}
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
    </div>
  );
}
