// src/pages/membership/Membership.tsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  IndianRupee,
  Clock,
  User,
  RefreshCw,
  Pencil,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import membershipService from "../service/membershipService.js";

interface Membership {
  id: string;
  name: string;
  price: string;
  duration_months: number;
  description: string;
  is_active: boolean;
  createdAt: string;
  created_by_name: string;
}

export function Membership() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [newMembership, setNewMembership] = useState({
    name: "",
    price: "",
    duration_months: "",
    description: "",
  });

  // 🧠 Fetch memberships (extracted so it can be reused)
  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const response = await membershipService.getMemberships();
      // try common response shapes safely
      const list = response?.data?.data ?? response?.data ?? response ?? [];
      // ensure array
      const arr = Array.isArray(list) ? list : [];
      setMemberships(arr);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load memberships");
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchMemberships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ➕ Create membership
  const handleCreate = async () => {
    if (!newMembership.name || !newMembership.price) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: newMembership.name,
        price: parseFloat(newMembership.price),
        duration_months: parseInt(newMembership.duration_months) || 1,
        description: newMembership.description,
      };
      // create on backend
      await membershipService.createMembership(payload);

      // REFRESH: re-fetch memberships to reflect canonical server state
      await fetchMemberships();

      toast.success("Membership created successfully!");
      setNewMembership({ name: "", price: "", duration_months: "", description: "" });
      setIsCreateOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create membership");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Delete membership
  const handleDelete = async (id: string) => {
    try {
      await membershipService.deleteMembership(id);
      // refresh list after delete
      await fetchMemberships();
      toast.success("Membership deleted!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete membership");
    }
  };

  // ♻️ Restore membership (shown instead of Delete when is_active === false)
  const handleRestore = async (id: string) => {
    try {
      await membershipService.restoreMembership(id);
      // refresh list after restore
      await fetchMemberships();
      toast.success("Membership restored!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to restore membership");
    }
  };

  // 🔍 Filtered memberships
  const filteredMemberships = memberships.filter((m) => {
    if (activeTab === "all") return true;
    return activeTab === "active" ? m.is_active : !m.is_active;
  });

  const stats = {
    all: memberships.length,
    active: memberships.filter((m) => m.is_active).length,
    inactive: memberships.filter((m) => !m.is_active).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2">Membership Plans</h1>
          <p className="text-muted-foreground">
            Manage gym memberships, pricing, and durations
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-neon-green to-neon-blue text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Membership Plan</DialogTitle>
              <DialogDescription>
                Add a new membership type with price and duration.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  placeholder="Gold Membership"
                  value={newMembership.name}
                  onChange={(e) =>
                    setNewMembership({ ...newMembership, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={newMembership.price}
                    onChange={(e) =>
                      setNewMembership({ ...newMembership, price: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Duration (Months)</Label>
                  <Input
                    type="number"
                    placeholder="3"
                    value={newMembership.duration_months}
                    onChange={(e) =>
                      setNewMembership({
                        ...newMembership,
                        duration_months: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe this membership plan..."
                  value={newMembership.description}
                  onChange={(e) =>
                    setNewMembership({
                      ...newMembership,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                className="bg-gradient-to-r from-neon-green to-neon-blue text-white"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Plan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-fit">
          <TabsTrigger value="all">All ({stats.all})</TabsTrigger>
          <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({stats.inactive})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-20 text-muted-foreground">
              <RefreshCw className="animate-spin mr-2" /> Loading memberships...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMemberships.map((plan) => (
                <Card
                  key={plan.id}
                  className="border-border/50 hover:border-border transition-all hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge
                        className={`${
                          plan.is_active
                            ? "bg-neon-green/10 text-neon-green border-neon-green/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}
                      >
                        {plan.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        By {plan.created_by_name}
                      </span>
                    </div>
                    <CardTitle className="text-lg mt-2">{plan.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IndianRupee className="w-4 h-4 text-neon-green" />
                      ₹{plan.price} / {plan.duration_months} month
                      {plan.duration_months > 1 ? "s" : ""}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Created {new Date(plan.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      Added by {plan.created_by_name || "Admin"}
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-border">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Pencil className="w-4 h-4 mr-1" /> Edit
                      </Button>

                      {plan.is_active ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(plan.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-green-600 hover:text-green-700"
                          onClick={() => handleRestore(plan.id)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Restore
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
